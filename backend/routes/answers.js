const express  = require('express');
const router   = express.Router({ mergeParams: true });
const supabase = require('../config/supabase');

// GET /api/questions/:id/answers
router.get('/', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('answers')
      .select('answer_id, user_id, content, created_at, users(nickname, department_grade)')
      .eq('question_id', id)
      .order('created_at', { ascending: true });
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: '查詢失敗' });
  }
});

// POST /api/questions/:id/answers
router.post('/', async (req, res) => {
  const { id } = req.params;
  const { user_id, content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: '回覆內容不能為空' });
  try {
    const { data, error } = await supabase
      .from('answers')
      .insert({ question_id: id, user_id: user_id || null, content: content.trim() })
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '回覆成功', answer: data });
  } catch (err) {
    res.status(500).json({ error: '新增失敗' });
  }
});

module.exports = router;
