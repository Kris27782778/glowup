// backend/routes/reviews.js  ← 新建這個檔案

const express = require('express');
const router  = express.Router();
const supabase = require('../config/supabase');

// 必須放在 /:product_id 之前，避免 "user" 被當成 product_id
router.get('/user/:user_id', async (req, res) => {
  const { user_id } = req.params;
  const { data, error } = await supabase
    .from('reviews')
    .select('*, products(name, brand, sub_category)')
    .eq('user_id', user_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// GET /api/reviews/:product_id  取得產品所有評論
router.get('/:product_id', async (req, res) => {
  const { product_id } = req.params;
  const { data, error } = await supabase
    .from('reviews')
    .select('*, users(nickname, skin_type)')
    .eq('product_id', product_id)
    .order('created_at', { ascending: false });

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

// DELETE /api/reviews/:review_id  刪除評論
router.delete('/:review_id', async (req, res) => {
  const { review_id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: '缺少 user_id' });

  // 確認是本人的評論才能刪
  const { data: existing } = await supabase
    .from('reviews')
    .select('user_id')
    .eq('review_id', review_id)
    .single();

  if (!existing) return res.status(404).json({ error: '評論不存在' });
  if (existing.user_id !== parseInt(user_id)) return res.status(403).json({ error: '無權限刪除' });

  const { error } = await supabase.from('reviews').delete().eq('review_id', review_id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: '已刪除' });
});

// POST /api/reviews  新增評論
router.post('/', async (req, res) => {
  const { product_id, user_id, rating, content } = req.body;
  if (!product_id || !user_id || !rating) {
    return res.status(400).json({ error: '缺少必要欄位' });
  }

  // 先查是否已評過（UPSERT：已評過就更新）
  const { data, error } = await supabase
    .from('reviews')
    .upsert([{ product_id, user_id, rating, content }],
            { onConflict: 'product_id,user_id' })
    .select('*, users(nickname)')
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});



module.exports = router;

// ─────────────────────────────────────────────
// 在 backend/index.js 加上這兩行：
//
// const reviewRoutes = require('./routes/reviews');
// app.use('/api/reviews', reviewRoutes);
// ─────────────────────────────────────────────