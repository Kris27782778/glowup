const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

// GET /api/notifications/unread?user_id=xxx&since=ISO日期
router.get('/unread', async (req, res) => {
  const { user_id, since } = req.query;
  if (!user_id) return res.json({ count: 0 });

  try {
    // 1. 找出這個用戶發過的所有問題 ID
    const { data: questions, error: qErr } = await supabase
      .from('questions')
      .select('question_id')
      .eq('user_id', user_id);

    if (qErr || !questions?.length) return res.json({ count: 0 });

    const questionIds = questions.map(q => q.question_id);

    // 2. 計算這些問題裡，別人（非本人）的新回覆數量
    let query = supabase
      .from('answers')
      .select('*', { count: 'exact', head: true })
      .in('question_id', questionIds)
      .neq('user_id', user_id);

    if (since) query = query.gt('created_at', since);

    const { count, error: aErr } = await query;
    if (aErr) return res.json({ count: 0 });

    res.json({ count: count || 0 });
  } catch (err) {
    console.error(err);
    res.json({ count: 0 });
  }
});

// GET /api/notifications/post-unread?user_id=xxx&since=ISO日期
// 計算我的貼文有多少新留言（別人留的）
router.get('/post-unread', async (req, res) => {
  const { user_id, since } = req.query;
  if (!user_id) return res.json({ count: 0 });
 
  try {
    // 找出這個用戶發過的所有貼文 ID
    const { data: posts, error: pErr } = await supabase
      .from('forum_posts')
      .select('post_id')
      .eq('user_id', user_id)
      .eq('status', 'active');
 
    if (pErr || !posts?.length) return res.json({ count: 0 });
 
    const postIds = posts.map(p => p.post_id);
 
    // 計算這些貼文裡，別人的新留言數
    let query = supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .in('post_id', postIds)
      .neq('user_id', user_id);
 
    if (since) query = query.gt('created_at', since);
 
    const { count, error: cErr } = await query;
    if (cErr) return res.json({ count: 0 });
 
    res.json({ count: count || 0 });
  } catch (err) {
    console.error(err);
    res.json({ count: 0 });
  }
});

module.exports = router;
