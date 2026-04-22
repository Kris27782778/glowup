const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

// GET /api/questions — 取問題列表（支援 tag / search / solved 篩選）
router.get('/', async (req, res) => {
  const { tag, search, solved, user_id } = req.query;
  try {
    let query = supabase
      .from('questions')
      .select('question_id, user_id, title, detail, tags, solved, views, created_at')
      .order('created_at', { ascending: false });

    if (user_id) query = query.eq('user_id', user_id);
    if (solved === 'true')  query = query.eq('solved', true);
    if (solved === 'false') query = query.eq('solved', false);
    if (tag)    query = query.contains('tags', [tag]);
    if (search) query = query.or(`title.ilike.%${search}%,detail.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// POST /api/questions — 新增問題
router.post('/', async (req, res) => {
  const { user_id, title, detail, tags } = req.body;
  if (!title || !detail) {
    return res.status(400).json({ error: '標題與說明為必填' });
  }
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert({ user_id: user_id || null, title, detail, tags: tags || [] })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '問題新增成功', question: data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '新增失敗' });
  }
});

// DELETE /api/questions/:id — 刪除自己的問題（需帶 user_id 驗證）
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: '需要 user_id' });
  try {
    const { data: existing, error: fetchErr } = await supabase
      .from('questions')
      .select('user_id')
      .eq('question_id', id)
      .single();
    if (fetchErr || !existing) return res.status(404).json({ error: '找不到問題' });
    if (String(existing.user_id) !== String(user_id)) {
      return res.status(403).json({ error: '無權限刪除他人的問題' });
    }
    const { error } = await supabase.from('questions').delete().eq('question_id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '刪除失敗' });
  }
});

module.exports = router;
