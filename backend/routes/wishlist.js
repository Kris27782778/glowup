const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

// 取得使用者收藏清單（含產品資料）
router.get('/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    // 第一步：取收藏記錄
    const { data: wList, error: wErr } = await supabase
      .from('wishlists')
      .select('wishlist_id, created_at, product_id')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (wErr) return res.status(400).json({ error: wErr.message });
    if (!wList || wList.length === 0) return res.json([]);

    // 第二步：用 product_id 撈產品資料（含成分）
    const productIds = wList.map(w => w.product_id);
    const { data: products, error: pErr } = await supabase
      .from('products')
      .select(`
        product_id, name, brand, category, sub_category, is_deleted,
        product_ingredients (
          ingredient_id,
          ingredients ( ingredient_id, name )
        )
      `)
      .in('product_id', productIds);

    if (pErr) return res.status(400).json({ error: pErr.message });

    // 第三步：合併
    const productMap = {};
    (products || []).forEach(p => { productMap[p.product_id] = p; });

    const result = wList.map(w => ({
      ...w,
      products: productMap[w.product_id] || null,
    }));

    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查詢收藏失敗' });
  }
});

// 新增收藏
router.post('/', async (req, res) => {
  const { user_id, product_id } = req.body;
  if (!user_id || !product_id) {
    return res.status(400).json({ error: '缺少 user_id 或 product_id' });
  }
  try {
    // 檢查是否已收藏
    const { data: existing } = await supabase
      .from('wishlists')
      .select('wishlist_id')
      .eq('user_id', user_id)
      .eq('product_id', product_id)
      .maybeSingle();

    if (existing) {
      return res.status(400).json({ error: '已收藏過此產品' });
    }

    const { data, error } = await supabase
      .from('wishlists')
      .insert({ user_id, product_id })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '收藏成功', wishlist: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '新增收藏失敗' });
  }
});

// 取消收藏
router.delete('/', async (req, res) => {
  const { user_id, product_id } = req.body;
  if (!user_id || !product_id) {
    return res.status(400).json({ error: '缺少 user_id 或 product_id' });
  }
  try {
    const { error } = await supabase
      .from('wishlists')
      .delete()
      .eq('user_id', user_id)
      .eq('product_id', product_id);

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '已取消收藏' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '取消收藏失敗' });
  }
});

module.exports = router;
