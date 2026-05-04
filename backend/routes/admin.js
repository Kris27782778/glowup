const express = require('express');
const router  = express.Router();
const pool    = require('../config/db');

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
    const [users, products, questions, wishlists, newUsers, todayUsers, todayQuestions, pendingReports] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query('SELECT COUNT(*) FROM products'),
      pool.query('SELECT COUNT(*) FROM questions'),
      pool.query('SELECT COUNT(*) FROM wishlists'),
      pool.query(`SELECT user_id, nickname, student_id, department_grade, skin_type, is_banned, created_at
                  FROM users ORDER BY created_at DESC LIMIT 5`),
      pool.query(`SELECT COUNT(*) FROM users WHERE created_at >= NOW() - INTERVAL '24 hours'`),
      pool.query(`SELECT COUNT(*) FROM questions WHERE created_at >= NOW() - INTERVAL '24 hours'`),
      pool.query(`SELECT COUNT(*) FROM reports WHERE status = 'pending'`).catch(() => ({ rows: [{ count: 0 }] })),
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
      `SELECT product_id, name, brand, category, sub_category, created_at
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
  const { name, brand, category, sub_category } = req.body;
  try {
    const fields = []; const values = []; let idx = 1;
    if (name        !== undefined) { fields.push(`name        = $${idx++}`); values.push(name); }
    if (brand       !== undefined) { fields.push(`brand       = $${idx++}`); values.push(brand); }
    if (category    !== undefined) { fields.push(`category    = $${idx++}`); values.push(category); }
    if (sub_category!== undefined) { fields.push(`sub_category= $${idx++}`); values.push(sub_category); }
    if (fields.length === 0) return res.status(400).json({ error: '沒有需要更新的欄位' });
    values.push(req.params.id);
    const result = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE product_id = $${idx} RETURNING *`,
      values
    );
    if (result.rows.length === 0) return res.status(404).json({ error: '找不到產品' });
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
    res.json({ product: result.rows[0] });
  } catch (err) {
    console.error('[admin/products post]', err.message);
    res.status(500).json({ error: '新增失敗' });
  }
});

// ── 刪除產品 DELETE /api/admin/products/:id ───────────────────────
router.delete('/products/:id', async (req, res) => {
  try {
    await pool.query('DELETE FROM product_ingredients WHERE product_id = $1', [req.params.id]);
    await pool.query('DELETE FROM wishlists          WHERE product_id = $1', [req.params.id]);
    await pool.query('DELETE FROM products           WHERE product_id = $1', [req.params.id]);
    res.json({ message: '已刪除' });
  } catch (err) {
    console.error('[admin/products delete]', err.message);
    res.status(500).json({ error: '刪除失敗' });
  }
});

// ── 問答列表 GET /api/admin/questions ─────────────────────────────
router.get('/questions', async (req, res) => {
  const { q = '' } = req.query;
  try {
    const result = await pool.query(
      `SELECT qu.question_id, qu.title, qu.tags, qu.solved, qu.views, qu.created_at,
              u.nickname, u.student_id
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
  try {
    let sql = `SELECT r.*, u.nickname AS reporter_name
               FROM reports r LEFT JOIN users u ON u.user_id = r.reporter_id
               ORDER BY r.created_at DESC LIMIT 50`;
    const params = [];
    if (status) {
      sql = `SELECT r.*, u.nickname AS reporter_name
             FROM reports r LEFT JOIN users u ON u.user_id = r.reporter_id
             WHERE r.status = $1 ORDER BY r.created_at DESC LIMIT 50`;
      params.push(status);
    }
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
    await pool.query(
      `UPDATE reports SET status = 'resolved', admin_note = $1, resolved_at = NOW() WHERE report_id = $2`,
      [admin_note || null, req.params.id]
    );
    res.json({ message: '已處理' });
  } catch (err) {
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

module.exports = router;
