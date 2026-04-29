const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

// 膚質對應 ingredients 欄位
const skinMap = {
  '油性肌':  'skin_oily',
  '乾性肌':  'skin_dry',
  '敏感性肌': 'skin_sensitive',
  '中性肌':  'skin_normal',
  '混合性肌': 'skin_combo',
};

// 功效對應 ingredients 欄位
const effectMap = {
  '保濕':   'effect_hydration',
  '控油':   'effect_oil_control',
  '舒緩修復': 'effect_repair',
  '抗痘':   'effect_anti_acne',
  '去角質':  'effect_exfoliate',
  '美白':   'effect_whitening',
  '抗老':   'effect_anti_aging',
};

router.get('/', async (req, res) => {
  const { category, sub_category, skin_type, effect, search, page = 1, limit = 24 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(48, Math.max(1, parseInt(limit)));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  const skinCol   = skinMap[skin_type];
  const effectCol = effectMap[effect];

  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_ingredients (
          ingredient_id,
          ingredients (
            ingredient_id, name,
            ${skinCol   ? skinCol + ',' : ''}
            ${effectCol ? effectCol     : 'skin_oily'}
          )
        )
      `, { count: 'exact' });

    if (category)     query = query.eq('category', category);
    if (sub_category) query = query.eq('sub_category', sub_category);
    if (search)       query = query.or(`name.ilike.%${search}%,brand.ilike.%${search}%`);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const scored = data.map(product => {
      let score = 3;
      product.product_ingredients?.forEach(pi => {
        const ing = pi.ingredients;
        if (!ing) return;
        if (skinCol   && ing[skinCol]   != null) score += ing[skinCol];
        if (effectCol && ing[effectCol] != null) score += ing[effectCol];
      });
      return { ...product, score };
    });

    const filtered = (skinCol || effectCol)
      ? scored.filter(p => p.score >= 3)
      : scored;

    filtered.sort((a, b) => b.score - a.score);

    const paged = filtered.slice(from, to + 1);

    res.set('Cache-Control', 'public, max-age=60');
    res.json({ data: paged, total: count, page: pageNum, limit: pageSize });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查詢失敗' });
  }
});

module.exports = router;