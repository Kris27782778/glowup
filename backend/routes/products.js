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
};

router.get('/', async (req, res) => {
  const { category, sub_category, skin_type, effect } = req.query;

  try {
    // 第一步：撈產品 + 成分資料（含分數）
    let query = supabase
      .from('products')
      .select(`
        *,
        product_ingredients (
          ingredient_id,
          ingredients (
            ingredient_id,
            name,
            skin_oily,
            skin_dry,
            skin_sensitive,
            skin_normal,
            skin_combo,
            effect_hydration,
            effect_oil_control,
            effect_repair,
            effect_anti_acne,
            effect_exfoliate
          )
        )
      `);

    if (category)     query = query.eq('category', category);
    if (sub_category) query = query.eq('sub_category', sub_category);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    // 第二步：計算每個產品的分數
    const skinCol   = skinMap[skin_type];
    const effectCol = effectMap[effect];

    const scored = data.map(product => {
      let score = 3; // 基礎分

      product.product_ingredients?.forEach(pi => {
        const ing = pi.ingredients;
        if (!ing) return;
        if (skinCol   && ing[skinCol]   != null) score += ing[skinCol];
        if (effectCol && ing[effectCol] != null) score += ing[effectCol];
      });

      return { ...product, score };
    });

    // 第三步：如果有選膚質或功效，過濾掉分數太低的（< 3分）
    const filtered = (skinCol || effectCol)
      ? scored.filter(p => p.score >= 3)
      : scored;

    // 第四步：從高到低排序
    filtered.sort((a, b) => b.score - a.score);

    res.json(filtered);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查詢失敗' });
  }
});

module.exports = router;