const express    = require('express');
const router     = express.Router();
const pool       = require('../config/db');
const supabase   = require('../config/supabase');
const Anthropic  = require('@anthropic-ai/sdk');
const crypto     = require('crypto');
const { sendVerificationEmail, sendWelcomeEmail } = require('../config/mailer');

// ── 驗證管理員身份（不需 admin key，用學號驗證）───────────────────
router.post('/verify-admin', async (req, res) => {
  const { student_id } = req.body;
  if (!student_id) return res.status(400).json({ error: '請提供學號' });
  try {
    const result = await pool.query(
      `SELECT user_id, nickname FROM users
       WHERE student_id = $1 AND is_admin = true AND COALESCE(is_banned, false) = false`,
      [student_id]
    );
    if (result.rows.length === 0) return res.status(403).json({ error: '此學號不具管理員權限' });
    res.json({ ok: true, nickname: result.rows[0].nickname });
  } catch (err) {
    console.error('[admin/verify-admin]', err.message);
    res.status(500).json({ error: '驗證失敗' });
  }
});

// ── Admin Key 驗證 middleware ──────────────────────────────────────
function requireAdmin(req, res, next) {
  const key = req.headers['x-admin-key'];
  if (!key || key !== process.env.ADMIN_KEY) {
    return res.status(401).json({ error: '未授權' });
  }
  next();
}
router.use(requireAdmin);

// ── 概覽統計 GET /api/admin/stats ─────────────────────────────────
router.get('/stats', async (req, res) => {
  try {
    const [
      users, products, questions, wishlists, newUsers, todayUsers, todayQuestions, pendingReports,
      weeklyUsers, weeklyPosts, weeklyQuestions, weeklyWishlists, weeklyReviews, weeklySolved, weeklyRemoved,
      yesterdayQ,
    ] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM questions'),
      pool.query('SELECT COUNT(*) FROM wishlists'),
      pool.query(`SELECT user_id, nickname, student_id, department_grade, skin_type, is_banned, created_at
                  FROM users ORDER BY created_at DESC LIMIT 5`),
      pool.query(`SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '24 hours'`),
      pool.query(`SELECT COUNT(*) FROM questions WHERE created_at >= NOW() - INTERVAL '24 hours'`),
      pool.query(`SELECT COUNT(*) FROM reports WHERE status = 'pending'`).catch(() => ({ rows: [{ count: 0 }] })),
      // 本週新增
      pool.query(`SELECT COUNT(*) FROM users WHERE created_at >= date_trunc('week', NOW())`),
      pool.query(`SELECT COUNT(*) FROM forum_posts WHERE created_at >= date_trunc('week', NOW())`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*) FROM questions WHERE created_at >= date_trunc('week', NOW())`),
      pool.query(`SELECT COUNT(*) FROM wishlists WHERE created_at >= date_trunc('week', NOW())`),
      pool.query(`SELECT COUNT(*) FROM reviews WHERE created_at >= date_trunc('week', NOW())`).catch(() => ({ rows: [{ count: 0 }] })),
      pool.query(`SELECT COUNT(*) FROM questions WHERE solved = true AND created_at >= date_trunc('week', NOW())`),
      pool.query(`SELECT COUNT(*) FROM forum_posts WHERE status = 'removed' AND created_at >= date_trunc('week', NOW())`).catch(() => ({ rows: [{ count: 0 }] })),
      // 昨日問題數（用於今日對比）
      pool.query(`SELECT COUNT(*) FROM questions WHERE created_at >= NOW() - INTERVAL '48 hours' AND created_at < NOW() - INTERVAL '24 hours'`),
    ]);
    res.json({
      userCount:      parseInt(users.rows[0].count),
      productCount:   parseInt(products.rows[0].count),
      questionCount:  parseInt(questions.rows[0].count),
      wishlistCount:  parseInt(wishlists.rows[0].count),
      newUsers:       newUsers.rows,
      todayUsers:     parseInt(todayUsers.rows[0].count),
      todayQuestions: parseInt(todayQuestions.rows[0].count),
      pendingReports: parseInt(pendingReports.rows[0].count),
      weeklyGrowth: {
        users:           parseInt(weeklyUsers.rows[0].count),
        posts:           parseInt(weeklyPosts.rows[0].count),
        questions:       parseInt(weeklyQuestions.rows[0].count),
        wishlists:       parseInt(weeklyWishlists.rows[0].count),
        reviews:         parseInt(weeklyReviews.rows[0].count),
        solvedQuestions: parseInt(weeklySolved.rows[0].count),
        removedPosts:    parseInt(weeklyRemoved.rows[0].count),
      },
      yesterdayQuestions: parseInt(yesterdayQ.rows[0].count),
    });
  } catch (err) {
    console.error('[admin/stats]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 會員列表 GET /api/admin/users ─────────────────────────────────
router.get('/users', async (req, res) => {
  const { q = '' } = req.query;
  try {
    const result = await pool.query(
      `SELECT user_id, student_id, nickname, real_name, department_grade, email, skin_type,
              COALESCE(is_banned, false) AS is_banned, ban_reason, banned_until, created_at
       FROM users
       WHERE nickname ILIKE $1 OR real_name ILIKE $1 OR student_id ILIKE $1 OR email ILIKE $1
       ORDER BY created_at DESC`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/users]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 停權會員 PATCH /api/admin/users/:id/ban ───────────────────────
router.patch('/users/:id/ban', async (req, res) => {
  const { reason, days } = req.body;
  const bannedUntil = days ? new Date(Date.now() + days * 24 * 60 * 60 * 1000) : null;
  try {
    await pool.query(
      `UPDATE users SET is_banned = true, ban_reason = $1, banned_until = $2 WHERE user_id = $3`,
      [reason || null, bannedUntil, req.params.id]
    );
    await writeAudit('user.ban', 'user', req.params.id, { reason, days });
    res.json({ message: '已停權' });
  } catch (err) {
    console.error('[admin/users ban]', err.message);
    res.status(500).json({ error: '停權失敗' });
  }
});

// ── 解除停權 PATCH /api/admin/users/:id/unban ─────────────────────
router.patch('/users/:id/unban', async (req, res) => {
  try {
    await pool.query(
      `UPDATE users SET is_banned = false, ban_reason = null, banned_until = null WHERE user_id = $1`,
      [req.params.id]
    );
    await writeAudit('user.unban', 'user', req.params.id);
    res.json({ message: '已解除停權' });
  } catch (err) {
    console.error('[admin/users unban]', err.message);
    res.status(500).json({ error: '解除停權失敗' });
  }
});

// ── 刪除會員 DELETE /api/admin/users/:id ──────────────────────────
router.delete('/users/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM wishlists WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM questions  WHERE user_id = $1', [req.params.id]);
    await pool.query('DELETE FROM users      WHERE user_id = $1', [req.params.id]);
    await writeAudit('user.delete', 'user', req.params.id);
    res.json({ message: '已刪除' });
  } catch (err) {
    console.error('[admin/users delete]', err.message);
    res.status(500).json({ error: '刪除失敗' });
  }
});

// ── 產品列表 GET /api/admin/products ──────────────────────────────
router.get('/products', async (req, res) => {
  const { q = '' } = req.query;
  try {
    const result = await pool.query(
      `SELECT product_id, name, brand, category, sub_category, is_deleted, created_at
       FROM products
       WHERE name ILIKE $1 OR brand ILIKE $1 OR category ILIKE $1
       ORDER BY created_at DESC`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/products]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 編輯產品 PATCH /api/admin/products/:id ────────────────────
router.patch('/products/:id', async (req, res) => {
  const { name, brand, category, sub_category, raw_ingredients, finish, coverage } = req.body;
  try {
    const fields = []; const values = []; let idx = 1;
    if (name            !== undefined) { fields.push(`name             = $${idx++}`); values.push(name); }
    if (brand           !== undefined) { fields.push(`brand            = $${idx++}`); values.push(brand); }
    if (category        !== undefined) { fields.push(`category         = $${idx++}`); values.push(category); }
    if (sub_category    !== undefined) { fields.push(`sub_category     = $${idx++}`); values.push(sub_category); }
    if (raw_ingredients !== undefined) { fields.push(`raw_ingredients  = $${idx++}`); values.push(raw_ingredients); }
    if (finish          !== undefined) { fields.push(`finish           = $${idx++}`); values.push(finish || null); }
    if (coverage        !== undefined) { fields.push(`coverage         = $${idx++}`); values.push(coverage || null); }
    if (fields.length === 0) return res.status(400).json({ error: '沒有需要更新的欄位' });
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE product_id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: '找不到產品' });
    await writeAudit('product.update', 'product', req.params.id, req.body);
    res.json({ message: '更新成功', product: result.rows[0] });
  } catch (err) {
    console.error('[admin/products patch]', err.message);
    res.status(500).json({ error: '更新失敗' });
  }
});

// ── 取得產品元資料 GET /api/admin/products/meta ───────────────
router.get('/products/meta', async (req, res) => {
  try {
    const [cats, subs] = await Promise.all([
      pool.query('SELECT DISTINCT category FROM products ORDER BY category'),
      pool.query('SELECT DISTINCT sub_category FROM products ORDER BY sub_category'),
    ]);
    res.json({
      categories:    cats.rows.map(r => r.category),
      sub_categories: subs.rows.map(r => r.sub_category),
    });
  } catch (err) {
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 新增產品 POST /api/admin/products ────────────────────────────
router.post('/products', async (req, res) => {
  const { name, brand, category, sub_category } = req.body;
  if (!name || !brand || !category) return res.status(400).json({ error: '名稱、品牌、分類為必填' });
  try {
    const result = await pool.query(
      `INSERT INTO products (name, brand, category, sub_category) VALUES ($1, $2, $3, $4) RETURNING *`,
      [name, brand, category, sub_category || null]
    );
    await writeAudit('product.create', 'product', result.rows[0].product_id, { name, brand, category, sub_category });
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error('[admin/products post]', err.message);
    res.status(500).json({ error: '新增失敗' });
  }
});

// ── 下架產品 DELETE /api/admin/products/:id ───────────────────────
router.delete('/products/:id', async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_deleted = true WHERE product_id = $1', [req.params.id]);
    await writeAudit('product.remove', 'product', req.params.id);
    res.json({ message: '已下架' });
  } catch (err) {
    console.error('[admin/products delete]', err.message);
    res.status(500).json({ error: '下架失敗' });
  }
});

// ── 重新上架 PATCH /api/admin/products/:id/restore ────────────────
router.patch('/products/:id/restore', async (req, res) => {
  try {
    await pool.query('UPDATE products SET is_deleted = false WHERE product_id = $1', [req.params.id]);
    await writeAudit('product.restore', 'product', req.params.id);
    res.json({ message: '已重新上架' });
  } catch (err) {
    console.error('[admin/products restore]', err.message);
    res.status(500).json({ error: '上架失敗' });
  }
});

// ── 問答列表 GET /api/admin/questions ─────────────────────────────
router.get('/questions', async (req, res) => {
  const { q = '' } = req.query;
  try {
    const result = await pool.query(
      `SELECT qu.question_id, qu.title, qu.tags, qu.solved, qu.views, qu.created_at,
              u.nickname, u.student_id,
              (SELECT COUNT(*) FROM answers a WHERE a.question_id = qu.question_id)::int AS answer_count
       FROM questions qu
       LEFT JOIN users u ON u.user_id = qu.user_id
       WHERE qu.title ILIKE $1 OR u.nickname ILIKE $1
       ORDER BY qu.created_at DESC`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/questions]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 標記已解決 PATCH /api/admin/questions/:id ─────────────────────
router.patch('/questions/:id', async (req, res) => {
  const { solved } = req.body;
  try {
    await pool.query('UPDATE questions SET solved = $1 WHERE question_id = $2', [solved, req.params.id]);
    await writeAudit('question.solve', 'question', req.params.id, { solved });
    res.json({ message: '已更新' });
  } catch (err) {
    console.error('[admin/questions patch]', err.message);
    res.status(500).json({ error: '更新失敗' });
  }
});

// ── 刪除問答 DELETE /api/admin/questions/:id ──────────────────────
router.delete('/questions/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM questions WHERE question_id = $1', [req.params.id]);
    await writeAudit('question.delete', 'question', req.params.id);
    res.json({ message: '已刪除' });
  } catch (err) {
    console.error('[admin/questions delete]', err.message);
    res.status(500).json({ error: '刪除失敗' });
  }
});

// ── 成分列表 GET /api/admin/ingredients ──────────────────────────
router.get('/ingredients', async (req, res) => {
  const { q = '' } = req.query;
  try {
    const result = await pool.query(
      `SELECT ingredient_id, name,
              skin_oily, skin_dry, skin_sensitive, skin_normal, skin_combo,
              effect_hydration, effect_oil_control, effect_repair, effect_anti_acne,
              effect_exfoliate, effect_whitening, effect_anti_aging
       FROM ingredients WHERE name ILIKE $1 ORDER BY name LIMIT 100`,
      [`%${q}%`]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/ingredients]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 編輯成分 PATCH /api/admin/ingredients/:id ─────────────────────
router.patch('/ingredients/:id', async (req, res) => {
  const fields = ['skin_oily','skin_dry','skin_sensitive','skin_normal','skin_combo',
    'effect_hydration','effect_oil_control','effect_repair','effect_anti_acne',
    'effect_exfoliate','effect_whitening','effect_anti_aging'];
  const setClauses = []; const values = []; let idx = 1;
  if (req.body.name !== undefined) { setClauses.push(`name = $${idx++}`); values.push(req.body.name); }
  fields.forEach(f => {
    if (req.body[f] !== undefined) { setClauses.push(`${f} = $${idx++}`); values.push(req.body[f]); }
  });
  if (setClauses.length === 0) return res.status(400).json({ error: '沒有需要更新的欄位' });
  values.push(req.params.id);
  try {
    const result = await pool.query(
      `UPDATE ingredients SET ${setClauses.join(', ')} WHERE ingredient_id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: '找不到成分' });
    res.json({ ingredient: result.rows[0] });
  } catch (err) {
    console.error('[admin/ingredients patch]', err.message);
    res.status(500).json({ error: '更新失敗' });
  }
});

// ── 檢舉列表 GET /api/admin/reports ──────────────────────────────
router.get('/reports', async (req, res) => {
  const { status = '' } = req.query;
  const baseSql = `
    SELECT r.*, u.nickname AS reporter_name,
      COALESCE(q.title, pr.name, LEFT(a.content, 120), LEFT(rv.content, 120)) AS preview_text
    FROM reports r
    LEFT JOIN users u    ON u.user_id    = r.reporter_id
    LEFT JOIN questions q ON r.target_type = 'question' AND q.question_id = r.target_id
    LEFT JOIN products pr ON r.target_type = 'product'  AND pr.product_id  = r.target_id
    LEFT JOIN answers  a  ON r.target_type = 'answer'   AND a.answer_id    = r.target_id
    LEFT JOIN reviews  rv ON r.target_type = 'review'   AND rv.review_id   = r.target_id
  `;
  try {
    const params = [];
    const sql = status
      ? baseSql + ` WHERE r.status = $1 ORDER BY r.created_at DESC LIMIT 50`
      : baseSql + ` ORDER BY r.created_at DESC LIMIT 50`;
    if (status) params.push(status);
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    if (err.message.includes('does not exist')) return res.json([]);
    console.error('[admin/reports]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 處理檢舉 PATCH /api/admin/reports/:id/resolve ────────────────
router.patch('/reports/:id/resolve', async (req, res) => {
  const { admin_note } = req.body;
  try {
    const { rows } = await pool.query(
      `SELECT target_type, target_id FROM reports WHERE report_id = $1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: '找不到案件' });

    const { target_type, target_id } = rows[0];
    if (target_type === 'question') {
      await pool.query(`DELETE FROM answers   WHERE question_id = $1`, [target_id]);
      await pool.query(`DELETE FROM questions WHERE question_id = $1`, [target_id]);
    } else if (target_type === 'answer') {
      await pool.query(`DELETE FROM answers WHERE answer_id = $1`, [target_id]);
    } else if (target_type === 'review') {
      await pool.query(`DELETE FROM reviews WHERE review_id = $1`, [target_id]);
    }

    await pool.query(
      `UPDATE reports SET status = 'resolved', admin_note = $1, resolved_at = NOW() WHERE report_id = $2`,
      [admin_note || null, req.params.id]
    );
    await writeAudit('report.resolve', 'report', req.params.id, { target_type, target_id }, admin_note);
    res.json({ message: '已處理' });
  } catch (err) {
    console.error('[resolve report]', err.message);
    res.status(500).json({ error: '更新失敗' });
  }
});

// ── 關閉檢舉 PATCH /api/admin/reports/:id/dismiss ────────────────
router.patch('/reports/:id/dismiss', async (req, res) => {
  const { admin_note } = req.body;
  try {
    await pool.query(
      `UPDATE reports SET status = 'dismissed', admin_note = $1, resolved_at = NOW() WHERE report_id = $2`,
      [admin_note || null, req.params.id]
    );
    await writeAudit('report.dismiss', 'report', req.params.id, {}, admin_note);
    res.json({ message: '已關閉' });
  } catch (err) {
    res.status(500).json({ error: '更新失敗' });
  }
});

// ── 行銷分析 GET /api/admin/analytics ────────────────────────────
router.get('/analytics', async (req, res) => {
  try {
    const [
      skinRaw, weeklyUsers, weeklyQuestions,
      categoryRaw, subCatRaw, topWishlist, tagRows,
    ] = await Promise.all([
      // 膚質分佈（標準化）
      pool.query('SELECT skin_type, COUNT(*)::int AS count FROM users GROUP BY skin_type'),

      // 近 12 週用戶成長
      pool.query(`
        SELECT TO_CHAR(DATE_TRUNC('week', created_at) + INTERVAL '1 day', 'MM/DD') AS week,
               COUNT(*)::int AS count
        FROM users
        WHERE created_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY DATE_TRUNC('week', created_at)
      `),

      // 近 12 週問答成長
      pool.query(`
        SELECT TO_CHAR(DATE_TRUNC('week', created_at) + INTERVAL '1 day', 'MM/DD') AS week,
               COUNT(*)::int AS count
        FROM questions
        WHERE created_at >= NOW() - INTERVAL '12 weeks'
        GROUP BY DATE_TRUNC('week', created_at)
        ORDER BY DATE_TRUNC('week', created_at)
      `),

      // 產品主分類
      pool.query('SELECT category, COUNT(*)::int AS count FROM products GROUP BY category ORDER BY count DESC'),

      // 產品子分類 Top 8
      pool.query('SELECT sub_category, COUNT(*)::int AS count FROM products GROUP BY sub_category ORDER BY count DESC LIMIT 8'),

      // 熱門收藏 Top 8
      pool.query(`
        SELECT p.name, p.brand, p.category,
               COUNT(w.wishlist_id)::int AS wishlist_count
        FROM products p
        LEFT JOIN wishlists w ON w.product_id = p.product_id
        GROUP BY p.product_id
        ORDER BY wishlist_count DESC, p.name
        LIMIT 8
      `),

      // 問答標籤頻率
      pool.query('SELECT tags FROM questions'),
    ]);

    // 標準化膚質（舊格式中文 → key）
    const SKIN_MAP = { '油肌':'oily','乾肌':'dry','敏感肌':'sensitive','中性肌':'normal','混合肌':'combo' };
    const skinMerged = {};
    skinRaw.rows.forEach(({ skin_type, count }) => {
      const key = SKIN_MAP[skin_type] || skin_type || 'unknown';
      skinMerged[key] = (skinMerged[key] || 0) + count;
    });
    const skinDist = Object.entries(skinMerged)
      .map(([key, count]) => ({ key, count }))
      .sort((a, b) => b.count - a.count);

    // 標籤頻率
    const tagFreq = {};
    tagRows.rows.forEach(({ tags }) => {
      (tags || []).forEach(tag => { tagFreq[tag] = (tagFreq[tag] || 0) + 1; });
    });
    const tagDist = Object.entries(tagFreq)
      .map(([tag, count]) => ({ tag, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 12);

    res.json({
      skinDist,
      weeklyUsers:     weeklyUsers.rows,
      weeklyQuestions: weeklyQuestions.rows,
      categoryDist:    categoryRaw.rows,
      subCatDist:      subCatRaw.rows,
      topWishlist:     topWishlist.rows,
      tagDist,
    });
  } catch (err) {
    console.error('[admin/analytics]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});


// ── Sprint 3: 論壇貼文管理 ──────────────────────────────────────────
 
// GET /api/admin/posts — 取全部貼文（含已下架）
router.get('/posts', async (req, res) => {
  const { q = '', status = '' } = req.query;
  try {
    let sql = `
      SELECT fp.post_id, fp.title, fp.skin_type, fp.domain,
             fp.effect_tags, fp.helpful_count, fp.comment_count,
             fp.status, fp.created_at,
             u.nickname, u.department_grade
      FROM forum_posts fp
      LEFT JOIN users u ON u.user_id = fp.user_id
      WHERE 1=1
    `;
    const params = [];
    if (q) {
      params.push(`%${q}%`);
      sql += ` AND (fp.title ILIKE $${params.length} OR u.nickname ILIKE $${params.length})`;
    }
    if (status) {
      params.push(status);
      sql += ` AND fp.status = $${params.length}`;
    }
    sql += ' ORDER BY fp.created_at DESC';
    const result = await pool.query(sql, params);
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/posts]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});
 
// PATCH /api/admin/posts/:id/remove — 下架貼文
router.patch('/posts/:id/remove', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`UPDATE forum_posts SET status='removed' WHERE post_id=$1`, [id]);
    await writeAudit('post.remove', 'post', parseInt(id));
    res.json({ message: '已下架' });
  } catch (err) {
    console.error('[admin/posts/remove]', err.message);
    res.status(500).json({ error: '操作失敗' });
  }
});
 
// PATCH /api/admin/posts/:id/restore — 恢復上架
router.patch('/posts/:id/restore', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query(`UPDATE forum_posts SET status='active' WHERE post_id=$1`, [id]);
    await writeAudit('post.restore', 'post', parseInt(id));
    res.json({ message: '已恢復' });
  } catch (err) {
    console.error('[admin/posts/restore]', err.message);
    res.status(500).json({ error: '操作失敗' });
  }
});


// ── 審計日誌 helper ───────────────────────────────────────────────
async function writeAudit(action, target_type, target_id, detail = {}, admin_note = null) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (action, target_type, target_id, detail, admin_note) VALUES ($1,$2,$3,$4,$5)`,
      [action, target_type, target_id ?? null, JSON.stringify(detail), admin_note]
    );
  } catch (e) {
    console.error('[audit]', e.message);
  }
}

// ── 審計日誌查詢 GET /api/admin/audit ────────────────────────────
router.get('/audit', async (req, res) => {
  const { action = '', limit = 50 } = req.query;
  try {
    const params = [];
    let where = '';
    if (action) {
      params.push(`${action}%`);
      where = `WHERE action ILIKE $1`;
    }
    params.push(Math.min(200, parseInt(limit) || 50));
    const result = await pool.query(
      `SELECT * FROM audit_logs ${where} ORDER BY created_at DESC LIMIT $${params.length}`,
      params
    );
    res.json(result.rows);
  } catch (err) {
    console.error('[admin/audit]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 手動新增會員 POST /api/admin/users ───────────────────────────
router.post('/users', async (req, res) => {
  const { student_id, email, nickname, real_name, department_grade } = req.body;
  if (!student_id || !email || !nickname) {
    return res.status(400).json({ error: '學號、信箱、暱稱為必填' });
  }
  try {
    const bcrypt = require('bcrypt');
    const tempPassword = crypto.randomBytes(9).toString('base64url').slice(0, 12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    const result = await pool.query(
      `INSERT INTO users (student_id, password, nickname, real_name, department_grade, email, skin_type, last_verified_at, must_change_password)
       VALUES ($1, $2, $3, $4, $5, $6, '', NOW(), TRUE) RETURNING user_id, student_id, nickname, email, created_at`,
      [student_id, hashedPassword, nickname, real_name || null, department_grade || '', email]
    );
    res.json({ ok: true, user: result.rows[0] });
    sendWelcomeEmail(email, nickname, student_id, tempPassword).catch(err =>
      console.error('[admin/users] 歡迎信發送失敗:', err.message)
    );
  } catch (err) {
    console.error('[admin/users post]', err.message);
    if (err.code === '23505') return res.status(409).json({ error: '此學號已被註冊' });
    res.status(500).json({ error: '新增失敗：' + err.message });
  }
});

// ── 無 AI 回覆的問題列表 GET /api/admin/questions/no-ai ──────────
router.get('/questions/no-ai', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('questions')
      .select('question_id, title, detail, created_at, users(nickname)')
      .is('ai_answer', null)
      .order('created_at', { ascending: false })
      .limit(60);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ data: data || [] });
  } catch (err) {
    console.error('[admin/questions/no-ai]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// ── 人工補送 AI 回覆 POST /api/admin/questions/:id/ai-retry ──────
router.post('/questions/:id/ai-retry', async (req, res) => {
  const { id } = req.params;
  const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
  if (!apiKey) return res.status(503).json({ error: 'ANTHROPIC_API_KEY 未設定' });

  try {
    const { data: q, error } = await supabase
      .from('questions')
      .select('question_id, title, detail')
      .eq('question_id', id)
      .single();
    if (error || !q) return res.status(404).json({ error: '找不到問題' });

    const anthropic = new Anthropic({ apiKey, timeout: 30000 });
    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 400,
      messages: [{
        role: 'user',
        content: `你是 GLŌW AI，輔大美妝交流平台的智能助理，專精保養成分分析。請針對以下問題，提供簡潔、科學的初步分析（150字以內），重點放在成分、膚質適合性或保養建議，語氣親切自然。\n\n重要規則：直接給出分析結論，不要詢問使用者是否有更多問題，不要邀請追問，不要以「如果有任何問題」或類似句子結尾。\n\n問題標題：${q.title}\n問題說明：${q.detail}`,
      }],
    });

    const aiText = msg.content?.[0]?.text || '';
    await supabase.from('questions').update({ ai_answer: aiText }).eq('question_id', id);
    res.json({ ok: true, ai_answer: aiText });
  } catch (err) {
    console.error('[admin/ai-retry]', err.message);
    res.status(500).json({ error: 'AI 生成失敗：' + err.message });
  }
});

// ── 人工補送驗證信 POST /api/admin/resend-verification ───────────
router.post('/resend-verification', async (req, res) => {
  const { email } = req.body;
  if (!email || !email.includes('@')) return res.status(400).json({ error: '請提供有效 email' });

  try {
    const otp = String(crypto.randomInt(100000, 999999));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query('DELETE FROM email_verifications WHERE email = $1', [email]);
    await pool.query(
      'INSERT INTO email_verifications (email, otp, expires_at) VALUES ($1, $2, $3)',
      [email, otp, expiresAt]
    );
    await sendVerificationEmail(email, otp);
    res.json({ ok: true, message: '驗證信已補送' });
  } catch (err) {
    console.error('[admin/resend-verification]', err.message);
    res.status(500).json({ error: '補送失敗：' + err.message });
  }
});

module.exports = router;
