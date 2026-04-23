const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('../config/db');
const { sendVerificationEmail } = require('../config/mailer');

// ── 工具：產生 6 位數 OTP ──────────────────────────────────────────
function generateOTP() {
  return String(crypto.randomInt(100000, 999999));
}

// ── 寄送驗證碼 POST /api/auth/send-verification ───────────────────
router.post('/send-verification', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: '請提供有效的電子郵件' });
  }

  const otp = generateOTP();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 分鐘後

  try {
    // 刪除同一 email 的舊驗證紀錄，避免累積
    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);

    // 存入新的 OTP
    await pool.query(
      'INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );

    // 寄信
    await sendVerificationEmail(email, otp);

    res.json({ message: '驗證碼已寄出' });
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

  try {
    const result = await pool.query(
      `SELECT * FROM email_verifications
       WHERE email = $1 AND otp = $2 AND verified_at IS NULL
       ORDER BY created_at DESC LIMIT 1`,
      [email, otp]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: '驗證碼錯誤' });
    }

    const record = result.rows[0];

    if (new Date() > new Date(record.expires_at)) {
      return res.status(400).json({ error: '驗證碼已過期，請重新寄送' });
    }

    // 標記為已驗證
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
  const { student_id, password, nickname, department_grade, email, skin_type } = req.body;

  try {
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

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (student_id, password, nickname, department_grade, email, skin_type)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [student_id, hashedPassword, nickname, department_grade, email, skin_type]
    );

    // 清理驗證紀錄
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
    res.json({
      message: '登入成功',
      user: {
        user_id: user.user_id,
        student_id: user.student_id,
        nickname: user.nickname,
        department_grade: user.department_grade,
        email: user.email,
        skin_type: user.skin_type,
      }
    });
  } catch (err) {
    console.error('[login]', err.message);
    res.status(500).json({ error: '登入失敗' });
  }
});

module.exports = router;
