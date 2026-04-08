const express = require('express');
const router = express.Router();
const supabase = require('../config/supabase');

router.get('/', async (req, res) => {
  const { category, sub_category } = req.query;
  try {
    let query = supabase
      .from('products')
      .select(`
        *,
        product_ingredients (
          ingredient_id,
          ingredients ( ingredient_id, name )
        )
      `);

    if (category)     query = query.eq('category', category);
    if (sub_category) query = query.eq('sub_category', sub_category);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '查詢失敗' });
  }
});

module.exports = router;