const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const pool = require('../config/db');
const { sendVerificationEmail, sendGoogleBindEmail } = require('../config/mailer');

const JWT_SECRET = process.env.ADMIN_KEY;
const FRONTEND = process.env.FRONTEND_URL || 'http://localhost:3000';

function signUserToken(user) {
  return jwt.sign({
    user_id: user.user_id, student_id: user.student_id,
    nickname: user.nickname, department_grade: user.department_grade,
    email: user.email, skin_type: user.skin_type,
    is_admin: user.is_admin || false, last_verified_at: user.last_verified_at,
  }, JWT_SECRET, { expiresIn: '30d' });
}

// ── 工具：產生 6 位數 OTP ──────────────────────────────────────────
function generateOTP() {
  return String(crypto.randomInt(100000, 999999));
}

// 記錄每個 email 的 OTP 輸入失敗次數（伺服器重啟後重置，可接受）
const otpAttemptMap = new Map(); // email -> failCount

const OTP_COOLDOWN_MS = 60 * 1000;  // 重送間隔 60 秒
const MAX_OTP_ATTEMPTS = 3;          // 最多嘗試次數

// ── 寄送驗證碼 POST /api/auth/send-verification ───────────────────
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: '請提供有效的電子郵件' });
  }

  try {
    // 速率限制：60 秒內只能送一次，防止重複點擊寄出多封信
    const recent = await pool.query(
      `SELECT created_at FROM email_verifications
       WHERE email = $1
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    if (recent.rows.length > 0) {
      const elapsed = Date.now() - new Date(recent.rows[0].created_at).getTime();
      if (elapsed < OTP_COOLDOWN_MS) {
        const remaining = Math.ceil((OTP_COOLDOWN_MS - elapsed) / 1000);
        return res.status(429).json({ error: `請等待 ${remaining} 秒後再重新傳送` });
      }
    }

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分鐘後

    // 刪除同一 email 的舊驗證紀錄（確保同時間只有最新驗證碼有效）
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);

    // 存入新的 OTP
    await pool.query(
      'INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    // 先回應前端，背景發信（不阻塞請求）
    otpAttemptMap.delete(email);
    res.json({ message: '驗證碼已寄出' });

    sendVerificationEmail(email, otp).catch(err =>
      console.error('[send-verification] 發信失敗:', err.message)
    );
  } catch (err) {
    console.error('[send-verification]', err.message);
    res.status(500).json({ error: '驗證碼寄送失敗，請稍後再試' });
  }
});

// ── 驗證 OTP POST /api/auth/verify-otp ───────────────────────────
router.post('/verify-otp', async (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }

  // 伺服器端嘗試次數守衛
  const failCount = otpAttemptMap.get(email) || 0;
  if (failCount >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({ error: '驗證次數已達上限，請重新傳送驗證碼', tooManyAttempts: true });
  }

  try {
    // 只取最新一筆（舊碼因 send-verification 的 DELETE 已清除，此為防禦性查詢）
    const result = await pool.query(
      `SELECT * FROM email_verifications
       WHERE email = $1 AND verified_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: '驗證碼不存在或已過期，請重新傳送' });
    }

    const record = result.rows[0];

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: '驗證碼已過期，請重新傳送', tooManyAttempts: true });
    }

    // 比對最新驗證碼
    if (record.otp !== otp) {
      const newCount = failCount + 1;
      otpAttemptMap.set(email, newCount);
      const remaining = MAX_OTP_ATTEMPTS - newCount;
      if (remaining <= 0) {
        return res.status(400).json({ error: '驗證碼錯誤，請重新傳送驗證碼', tooManyAttempts: true });
      }
      return res.status(400).json({ error: `驗證碼錯誤，剩餘 ${remaining} 次機會` });
    }

    // 驗證成功：清除失敗計數，標記已驗證
    otpAttemptMap.delete(email);
    await pool.query(
      'UPDATE email_verifications SET verified_at = NOW() WHERE id = $1',
      [record.id]
    );

    res.json({ message: '驗證成功' });
  } catch (err) {
    console.error('[verify-otp]', err.message);
    res.status(500).json({ error: '驗證失敗，請稍後再試' });
  }
});

// ── 註冊 POST /api/auth/register ─────────────────────────────────
router.post('/register', async (req, res) => {
  const { student_id, password, nickname, real_name, department_grade, email, skin_type, skip_verification } = req.body;

  try {
    if (!skip_verification) {
      // 確認 email 已通過驗證（最近 30 分鐘內）
      const verified = await pool.query(
        `SELECT id FROM email_verifications
         WHERE email = $1 AND verified_at IS NOT NULL
           AND verified_at > NOW() - INTERVAL '30 minutes'
         ORDER BY verified_at DESC LIMIT 1`,
        [email]
      );
      if (verified.rows.length === 0) {
        return res.status(403).json({ error: '電子郵件尚未完成驗證，請重新驗證' });
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // 解析 department_grade：'科系 · 部別 · 年級'
    const parts = (department_grade || '').split(' · ');
    const deptName = parts[0]?.trim();
    const session  = parts[1]?.trim();
    const grade    = parts[2]?.trim() || null;

    let department_id = null;
    if (deptName && session) {
      const deptResult = await pool.query(
        'SELECT department_id FROM departments WHERE name = $1 AND session = $2',
        [deptName, session]
      );
      if (deptResult.rows.length > 0) department_id = deptResult.rows[0].department_id;
    }

    // skip_verification 時 last_verified_at 設為 NULL，後續在個人資料補驗證
    const result = await pool.query(
      `INSERT INTO users (student_id, password, nickname, real_name, department_grade, email, skin_type, last_verified_at, department_id, grade)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [student_id, hashedPassword, nickname, real_name || null, department_grade, email, skin_type,
       skip_verification ? null : new Date(), department_id, grade]
    );

    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);

    res.json({ message: '註冊成功', user: result.rows[0] });
  } catch (err) {
    console.error('[register]', err.message);
    if (err.code === '23505') {
      return res.status(409).json({ error: '此帳號已被註冊' });
    }
    res.status(500).json({ error: '註冊失敗' });
  }
});

// ── 更新個人資料 PATCH /api/auth/profile ──────────────────────────
router.patch('/profile', async (req, res) => {
  const { user_id, skin_type, nickname, bio } = req.body;
  if (!user_id) return res.status(400).json({ error: '缺少 user_id' });

  try {
    const fields = [];
    const values = [];
    let idx = 1;

    if (skin_type !== undefined) { fields.push(`skin_type = $${idx++}`); values.push(skin_type); }
    if (nickname  !== undefined) { fields.push(`nickname  = $${idx++}`); values.push(nickname);  }
    if (bio       !== undefined) { fields.push(`bio       = $${idx++}`); values.push(bio);       }

    if (fields.length === 0) return res.status(400).json({ error: '沒有需要更新的欄位' });

    values.push(user_id);
    const result = await pool.query(
      `UPDATE users SET ${fields.join(', ')} WHERE user_id = $${idx} RETURNING
         user_id, student_id, nickname, department_grade, email, skin_type, bio`,
      values
    );

    if (result.rows.length === 0) return res.status(404).json({ error: '找不到使用者' });
    res.json({ message: '更新成功', user: result.rows[0] });
  } catch (err) {
    console.error('[profile]', err.message);
    res.status(500).json({ error: '更新失敗' });
  }
});

// ── 登入 POST /api/auth/login ─────────────────────────────────────
router.post('/login', async (req, res) => {
  const { student_id, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE student_id = $1', [student_id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: '學號或密碼錯誤' });
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: '學號或密碼錯誤' });
    }
    if (user.is_banned) {
      return res.status(403).json({ error: '此帳號已被停用，請聯絡管理員' });
    }

    if (user.must_change_password) {
      return res.json({
        message: '登入成功，請設定新密碼',
        mustChangePassword: true,
        user: {
          user_id: user.user_id, student_id: user.student_id,
          nickname: user.nickname, department_grade: user.department_grade,
          email: user.email, skin_type: user.skin_type,
          is_admin: user.is_admin || false,
          last_verified_at: user.last_verified_at,
        },
      });
    }

    // 年度重驗檢查
    const YEAR_MS = 365 * 24 * 60 * 60 * 1000;
    const WARN_DAYS = 30;
    const lastVerified = user.last_verified_at ? new Date(user.last_verified_at) : null;
    if (lastVerified) {
      const elapsed = Date.now() - lastVerified.getTime();
      if (elapsed > YEAR_MS) {
        return res.status(403).json({
          error: '帳號年度驗證已到期，請重新驗證學校信箱以繼續使用',
          code: 'REVERIFY_REQUIRED',
          email: user.email,
          student_id: user.student_id,
        });
      }
      const daysLeft = Math.floor((YEAR_MS - elapsed) / (24 * 60 * 60 * 1000));
      if (daysLeft <= WARN_DAYS) {
        return res.json({
          message: '登入成功',
          token: signUserToken(user),
          warning: { daysLeft },
          user: {
            user_id: user.user_id, student_id: user.student_id,
            nickname: user.nickname, department_grade: user.department_grade,
            email: user.email, skin_type: user.skin_type,
            is_admin: user.is_admin || false,
            last_verified_at: user.last_verified_at,
          },
        });
      }
    }

    res.json({
      message: '登入成功',
      token: signUserToken(user),
      user: {
        user_id: user.user_id,
        student_id: user.student_id,
        nickname: user.nickname,
        department_grade: user.department_grade,
        email: user.email,
        skin_type: user.skin_type,
        is_admin: user.is_admin || false,
        last_verified_at: user.last_verified_at,
      },
    });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: '登入失敗' });
  }
});

// ── 重設密碼 POST /api/auth/reset-password ───────────────────
router.post('/reset-password', async (req, res) => {
  const { email, new_password } = req.body;
  if (!email || !new_password) return res.status(400).json({ error: '缺少必要欄位' });
  if (new_password.length < 6) return res.status(400).json({ error: '密碼至少需要 6 個字元' });
  try {
    const verified = await pool.query(
      `SELECT id FROM email_verifications
       WHERE email = $1 AND verified_at IS NOT NULL
         AND verified_at > NOW() - INTERVAL '30 minutes'
       ORDER BY verified_at DESC LIMIT 1`,
      [email]
    );
    if (verified.rows.length === 0) {
      return res.status(400).json({ error: '驗證已過期，請重新操作' });
    }
    const hashed = await bcrypt.hash(new_password, 10);
    const result = await pool.query(
      'UPDATE users SET password = $1 WHERE email = $2 RETURNING user_id',
      [hashed, email]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: '找不到此信箱對應的帳號' });
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);
    res.json({ message: '密碼已成功重設' });
  } catch (err) {
    console.error('[reset-password]', err.message);
    res.status(500).json({ error: '重設密碼失敗' });
  }
});

// ── 更改密碼 PATCH /api/auth/password ────────────────────────
router.patch('/password', async (req, res) => {
  const { user_id, current_password, new_password } = req.body;
  if (!user_id || !current_password || !new_password) return res.status(400).json({ error: '缺少必要欄位' });
  if (new_password.length < 6) return res.status(400).json({ error: '新密碼至少需要 6 個字元' });
  try {
    const result = await pool.query('SELECT * FROM users WHERE user_id = $1', [user_id]);
    if (result.rows.length === 0) return res.status(404).json({ error: '找不到使用者' });
    const match = await bcrypt.compare(current_password, result.rows[0].password);
    if (!match) return res.status(401).json({ error: '目前密碼輸入錯誤' });
    const hashed = await bcrypt.hash(new_password, 10);
    await pool.query('UPDATE users SET password = $1 WHERE user_id = $2', [hashed, user_id]);
    res.json({ message: '密碼已更新' });
  } catch (err) {
    console.error('[change-password]', err.message);
    res.status(500).json({ error: '更新密碼失敗' });
  }
});

// ── 首次登入強制改密碼 POST /api/auth/force-change-password ───────
router.post('/force-change-password', async (req, res) => {
  const { user_id, new_password } = req.body;
  if (!user_id || !new_password) return res.status(400).json({ error: '缺少必要欄位' });
  if (new_password.length < 6) return res.status(400).json({ error: '密碼至少需要 6 個字元' });
  try {
    const check = await pool.query('SELECT must_change_password FROM users WHERE user_id = $1', [user_id]);
    if (check.rows.length === 0) return res.status(404).json({ error: '找不到使用者' });
    if (!check.rows[0].must_change_password) return res.status(403).json({ error: '此帳號無需強制更改密碼' });
    const hashed = await bcrypt.hash(new_password, 10);
    const result = await pool.query(
      `UPDATE users SET password = $1, must_change_password = FALSE WHERE user_id = $2
       RETURNING user_id, student_id, nickname, department_grade, email, skin_type, is_admin, last_verified_at`,
      [hashed, user_id]
    );
    res.json({ message: '密碼已設定', token: signUserToken(result.rows[0]), user: result.rows[0] });
  } catch (err) {
    console.error('[force-change-password]', err.message);
    res.status(500).json({ error: '密碼設定失敗' });
  }
});

// ── 年度重驗 POST /api/auth/reverify ─────────────────────────────
router.post('/reverify', async (req, res) => {
  const { student_id, email, otp } = req.body;
  if (!student_id || !email || !otp) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }

  const failCount = otpAttemptMap.get(email) || 0;
  if (failCount >= MAX_OTP_ATTEMPTS) {
    return res.status(429).json({ error: '驗證失敗次數過多，請重新發送驗證碼' });
  }

  try {
    const record = await pool.query(
      `SELECT * FROM email_verifications
       WHERE email = $1 AND verified_at IS NULL AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [email]
    );
    if (record.rows.length === 0) {
      return res.status(400).json({ error: '驗證碼不存在或已過期，請重新發送' });
    }
    if (record.rows[0].otp !== otp) {
      const newCount = failCount + 1;
      otpAttemptMap.set(email, newCount);
      const remaining = MAX_OTP_ATTEMPTS - newCount;
      return res.status(400).json({ error: `驗證碼錯誤，還有 ${remaining} 次機會` });
    }

    otpAttemptMap.delete(email);
    await pool.query('UPDATE email_verifications SET verified_at = NOW() WHERE id = $1', [record.rows[0].id]);
    await pool.query('UPDATE users SET last_verified_at = NOW() WHERE student_id = $1', [student_id]);
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);

    const userResult = await pool.query('SELECT * FROM users WHERE student_id = $1', [student_id]);
    const user = userResult.rows[0];
    res.json({
      message: '驗證成功',
      user: {
        user_id: user.user_id, student_id: user.student_id,
        nickname: user.nickname, department_grade: user.department_grade,
        email: user.email, skin_type: user.skin_type,
        is_admin: user.is_admin || false,
        last_verified_at: user.last_verified_at,
      },
    });
  } catch (err) {
    console.error('[reverify]', err.message);
    res.status(500).json({ error: '驗證失敗' });
  }
});

// ── JWT 驗證 middleware（給需要登入的 Google 路由使用）────────────
function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: '未登入' });
  try {
    req.user = jwt.verify(auth.slice(7), JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'token 無效' });
  }
}

// ── Google 綁定初始化 GET /api/auth/google/bind-init ─────────────
// 前端用 fetch + Authorization header 呼叫，回傳 base64 state（含 userId）
// 前端拿到後直接 window.location.href 到 /google/bind?state=...
router.get('/google/bind-init', (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: '未登入' });
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    const state = Buffer.from(JSON.stringify({ type: 'bind', userId: decoded.user_id })).toString('base64');
    res.json({ ok: true, state });
  } catch {
    res.status(401).json({ error: 'token 無效' });
  }
});

// ── Google OAuth 綁定 GET /api/auth/google/bind ───────────────────
router.get('/google/bind', (req, res, next) => {
  const { state } = req.query;
  passport.authenticate('google', { scope: ['profile', 'email'], state: state || 'bind', session: false, prompt: 'select_account' })(req, res, next);
});

// ── Google OAuth 登入 GET /api/auth/google/login ──────────────────
router.get('/google/login', (req, res, next) => {
  const state = Buffer.from(JSON.stringify({ type: 'login' })).toString('base64');
  passport.authenticate('google', { scope: ['profile', 'email'], state, session: false })(req, res, next);
});

// ── Google OAuth 回呼 GET /api/auth/google/callback ───────────────
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: `${FRONTEND}/settings?error=google_fail`, session: false }),
  async (req, res) => {
    try {
      const stateData = JSON.parse(Buffer.from(req.query.state, 'base64').toString());

      if (stateData.type === 'bind') {
        await pool.query(
          'INSERT INTO user_oauth (user_id, provider, provider_id, provider_email) VALUES ($1, $2, $3, $4) ON CONFLICT (provider, provider_id) DO UPDATE SET provider_email = EXCLUDED.provider_email',
          [stateData.userId, 'google', req.user.googleId, req.user.email]
        );
        pool.query('SELECT email, nickname FROM users WHERE user_id=$1', [stateData.userId])
          .then(({ rows }) => {
            if (rows.length > 0) {
              sendGoogleBindEmail(rows[0].email, rows[0].nickname, req.user.email)
                .catch(err => console.error('[google/bind email]', err.message));
            }
          })
          .catch(() => {});
        return res.redirect(`${FRONTEND}/settings?google=success`);
      }

      if (stateData.type === 'login') {
        const oauthResult = await pool.query(
          'SELECT user_id FROM user_oauth WHERE provider=$1 AND provider_id=$2',
          ['google', req.user.googleId]
        );
        if (oauthResult.rows.length === 0) {
          return res.redirect(`${FRONTEND}/login?error=not_bound`);
        }
        const userId = oauthResult.rows[0].user_id;
        const userResult = await pool.query('SELECT * FROM users WHERE user_id=$1', [userId]);
        if (userResult.rows.length === 0) {
          return res.redirect(`${FRONTEND}/login?error=not_bound`);
        }
        const user = userResult.rows[0];
        if (user.is_banned) {
          return res.redirect(`${FRONTEND}/login?error=banned`);
        }
        return res.redirect(`${FRONTEND}/login?token=${signUserToken(user)}`);
      }

      return res.redirect(`${FRONTEND}/settings?error=server_error`);
    } catch (err) {
      console.error('[google/callback]', err.message);
      return res.redirect(`${FRONTEND}/settings?error=server_error`);
    }
  }
);

// ── 取消 Google 綁定 DELETE /api/auth/google/unbind ──────────────
router.delete('/google/unbind', authMiddleware, async (req, res) => {
  try {
    const userId = req.user.user_id;
    await pool.query('DELETE FROM user_oauth WHERE user_id=$1 AND provider=$2', [userId, 'google']);
    res.json({ ok: true });
  } catch (err) {
    console.error('[google/unbind]', err.message);
    res.status(500).json({ error: '取消綁定失敗' });
  }
});

// ── Google 綁定狀態 GET /api/auth/google/status ───────────────────
router.get('/google/status', async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth?.startsWith('Bearer ')) return res.status(401).json({ error: '需要登入' });
  try {
    const decoded = jwt.verify(auth.slice(7), JWT_SECRET);
    const result = await pool.query(
      `SELECT provider_email FROM user_oauth WHERE user_id=$1 AND provider='google'`,
      [decoded.user_id]
    );
    res.json({ bound: result.rows.length > 0, email: result.rows[0]?.provider_email || null });
  } catch {
    res.status(401).json({ error: 'token 無效' });
  }
});

module.exports = router;
