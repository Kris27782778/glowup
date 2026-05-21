const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');

/* GET /api/posts */
router.get('/', async (req, res) => {
  const { skin_type, domain, post_type, effect, search, page = 1, limit = 20, user_id } = req.query;
  const pageNum  = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
  const from     = (pageNum - 1) * pageSize;
  const to       = from + pageSize - 1;

  try {
    let q = supabase
      .from('forum_posts')
      .select(
  `post_id, user_id, title, content, skin_type, domain, post_type,
   sub_category, effect_tags, ingredients, helpful_count, comment_count,
   views, status, created_at,
   users(nickname, department_grade)`,
        { count: 'exact' }
      )
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (skin_type) q = q.eq('skin_type', skin_type);
    if (domain)    q = q.eq('domain', domain);
    if (post_type) q = q.eq('post_type', post_type);
    if (effect)    q = q.contains('effect_tags', [effect]);
    if (search)    q = q.or(`title.ilike.%${search}%,content.ilike.%${search}%`);
    if (user_id)   q = q.eq('user_id', user_id);

    const { data, error, count } = await q;
    if (error) return res.status(400).json({ error: error.message });
    res.json({ data: data || [], total: count, page: pageNum, limit: pageSize });
  } catch (err) {
    console.error('[GET /posts]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

/* ⚠️ GET /api/posts/bookmarks/:user_id  必須在 /:id 之前 */
router.get('/bookmarks/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('post_bookmarks')
      .select(`id, created_at,
               forum_posts(post_id, title, skin_type, domain, sub_category,
                           effect_tags, helpful_count, comment_count, status, created_at,
                           users(nickname))`)
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error('[GET bookmarks]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

/* ⚠️ GET /api/posts/unsung  必須在 /:id 之前 */
router.get('/unsung', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .select('post_id, title, helpful_count, comment_count, created_at, users(nickname)')
      .eq('status', 'active')
      .order('helpful_count',  { ascending: true })
      .order('comment_count',  { ascending: true })
      .order('created_at',     { ascending: true })
      .limit(3);

    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error('[GET unsung]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

/* ⚠️ GET /api/posts/popular  必須在 /:id 之前 */
router.get('/popular', async (req, res) => {
  try {
    const since30 = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const fields  = 'post_id, title, helpful_count, comment_count, skin_type, domain, post_type, created_at, users(nickname)';

    // 先抓近 30 天
    const { data: recent } = await supabase
      .from('forum_posts')
      .select(fields)
      .eq('status', 'active')
      .gte('created_at', since30)
      .order('helpful_count', { ascending: false })
      .order('comment_count', { ascending: false })
      .limit(3);

    if (recent && recent.length >= 3) return res.json(recent);

    // fallback：全期間
    const { data: allTime, error } = await supabase
      .from('forum_posts')
      .select(fields)
      .eq('status', 'active')
      .order('helpful_count', { ascending: false })
      .order('comment_count', { ascending: false })
      .limit(3);

    if (error) return res.status(400).json({ error: error.message });
    res.json(allTime || []);
  } catch (err) {
    console.error('[GET popular]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

/* ⚠️ GET /api/posts/trending-tags  必須在 /:id 之前 */
router.get('/trending-tags', async (req, res) => {
  try {
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

    const { data, error } = await supabase
      .from('forum_posts')
      .select('skin_type, domain, sub_category, effect_tags')
      .eq('status', 'active')
      .gte('created_at', since);

    if (error) return res.status(400).json({ error: error.message });

    const counts = {};
    for (const post of data || []) {
      const tags = [post.skin_type, post.domain, post.sub_category, ...(post.effect_tags || [])].filter(Boolean);
      for (const tag of tags) counts[tag] = (counts[tag] || 0) + 1;
    }

    const result = Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag, count]) => ({ tag: `#${tag}`, count }));

    res.json(result);
  } catch (err) {
    console.error('[GET trending-tags]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

/* GET /api/posts/:id */
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    // 增加瀏覽數（先查再 +1，不用 raw）
    const { data: cur } = await supabase
      .from('forum_posts').select('views').eq('post_id', id).single();
    if (cur) {
      await supabase.from('forum_posts')
        .update({ views: (cur.views || 0) + 1 }).eq('post_id', id);
    }

    const { data, error } = await supabase
      .from('forum_posts')
      .select(
  `post_id, user_id, title, content, skin_type, domain, post_type,
   sub_category, effect_tags, ingredients, helpful_count, comment_count,
   views, status, created_at,
   users(nickname, department_grade)`,)
      .eq('post_id', id)
      .single();

    if (error) return res.status(404).json({ error: '找不到貼文' });
    res.json(data);
  } catch (err) {
    console.error('[GET /posts/:id]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

/* POST /api/posts */
router.post('/', async (req, res) => {
  const { user_id, title, content, skin_type, domain, post_type, sub_category, effect_tags, ingredients } = req.body;

  if (!user_id)                        return res.status(400).json({ error: '需要登入' });
  if (!title || title.length < 6)      return res.status(400).json({ error: '標題至少需要 6 個字' });
  if (!content || content.length < 30) return res.status(400).json({ error: '內文至少需要 30 個字' });
  if (!skin_type)                      return res.status(400).json({ error: '膚質為必選' });
  if (!domain)                         return res.status(400).json({ error: '領域為必選' });

  try {
    const { data, error } = await supabase
      .from('forum_posts')
      .insert({
        user_id,
        title,
        content,
        skin_type,
        domain,
        post_type:    post_type    || null,
        sub_category: sub_category || null,
        effect_tags:  Array.isArray(effect_tags) ? effect_tags : [],
        ingredients:  Array.isArray(ingredients) ? ingredients : [],
      })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '發表成功', post: data });
  } catch (err) {
    console.error('[POST /posts]', err.message);
    res.status(500).json({ error: '發表失敗' });
  }
});

/* PUT /api/posts/:id */
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id, title, content, skin_type, domain, post_type, sub_category, effect_tags } = req.body;

  if (!user_id)                        return res.status(400).json({ error: '需要登入' });
  if (!title || title.length < 6)      return res.status(400).json({ error: '標題至少需要 6 個字' });
  if (!content || content.length < 30) return res.status(400).json({ error: '內文至少需要 30 個字' });
  if (!skin_type)                      return res.status(400).json({ error: '膚質為必選' });
  if (!domain)                         return res.status(400).json({ error: '領域為必選' });

  try {
    const { data: existing } = await supabase
      .from('forum_posts').select('user_id').eq('post_id', id).single();
    if (!existing || String(existing.user_id) !== String(user_id))
      return res.status(403).json({ error: '無權限編輯此貼文' });

    const { data, error } = await supabase
      .from('forum_posts')
      .update({
        title, content, skin_type, domain,
        post_type:    post_type    || null,
        sub_category: sub_category || null,
        effect_tags:  Array.isArray(effect_tags) ? effect_tags : [],
      })
      .eq('post_id', id)
      .select(`post_id, user_id, title, content, skin_type, domain, post_type,
               sub_category, effect_tags, ingredients, helpful_count, comment_count,
               views, status, created_at, users(nickname, department_grade)`)
      .single();

    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '更新成功', post: data });
  } catch (err) {
    console.error('[PUT /posts/:id]', err.message);
    res.status(500).json({ error: '更新失敗' });
  }
});

/* DELETE /api/posts/:id */
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: '需要 user_id' });

  try {
    const { data: post } = await supabase
      .from('forum_posts').select('user_id').eq('post_id', id).single();

    if (!post) return res.status(404).json({ error: '找不到貼文' });
    if (String(post.user_id) !== String(user_id))
      return res.status(403).json({ error: '無權限刪除他人貼文' });

    await supabase.from('post_comments').delete().eq('post_id', id);
    await supabase.from('post_helpful').delete().eq('post_id', id);
    await supabase.from('post_bookmarks').delete().eq('post_id', id);
    const { error } = await supabase.from('forum_posts').delete().eq('post_id', id);
    if (error) return res.status(400).json({ error: error.message });

    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error('[DELETE /posts/:id]', err.message);
    res.status(500).json({ error: '刪除失敗' });
  }
});

/* POST /api/posts/:id/helpful */
router.post('/:id/helpful', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: '需要登入' });

  try {
    const { data: existing } = await supabase
      .from('post_helpful')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing) {
      await supabase.from('post_helpful').delete().eq('id', existing.id);
      const { data: cur } = await supabase
        .from('forum_posts').select('helpful_count').eq('post_id', id).single();
      const newCount = Math.max((cur?.helpful_count || 1) - 1, 0);
      await supabase.from('forum_posts')
        .update({ helpful_count: newCount }).eq('post_id', id);
      return res.json({ helpful: false, helpful_count: newCount });
    } else {
      await supabase.from('post_helpful')
        .insert({ post_id: parseInt(id), user_id: parseInt(user_id) });
      const { data: cur } = await supabase
        .from('forum_posts').select('helpful_count').eq('post_id', id).single();
      const newCount = (cur?.helpful_count || 0) + 1;
      await supabase.from('forum_posts')
        .update({ helpful_count: newCount }).eq('post_id', id);
      return res.json({ helpful: true, helpful_count: newCount });
    }
  } catch (err) {
    console.error('[POST helpful]', err.message);
    res.status(500).json({ error: '操作失敗' });
  }
});

/* GET /api/posts/:id/helpful-status?user_id= */
router.get('/:id/helpful-status', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;
  if (!user_id) return res.json({ helpful: false });

  const { data } = await supabase
    .from('post_helpful')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', user_id)
    .maybeSingle();

  res.json({ helpful: !!data });
});

/* POST /api/posts/:id/bookmark */
router.post('/:id/bookmark', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: '需要登入' });

  try {
    const { data: existing } = await supabase
      .from('post_bookmarks')
      .select('id')
      .eq('post_id', id)
      .eq('user_id', user_id)
      .maybeSingle();

    if (existing) {
      await supabase.from('post_bookmarks').delete().eq('id', existing.id);
      return res.json({ bookmarked: false });
    } else {
      await supabase.from('post_bookmarks')
        .insert({ post_id: parseInt(id), user_id: parseInt(user_id) });
      return res.json({ bookmarked: true });
    }
  } catch (err) {
    console.error('[POST bookmark]', err.message);
    res.status(500).json({ error: '操作失敗' });
  }
});

/* GET /api/posts/:id/bookmark-status?user_id= */
router.get('/:id/bookmark-status', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;
  if (!user_id) return res.json({ bookmarked: false });

  const { data } = await supabase
    .from('post_bookmarks')
    .select('id')
    .eq('post_id', id)
    .eq('user_id', user_id)
    .maybeSingle();

  res.json({ bookmarked: !!data });
});

/* GET /api/posts/:id/comments */
router.get('/:id/comments', async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from('post_comments')
      .select('comment_id, user_id, content, created_at, users(nickname, department_grade)')
      .eq('post_id', id)
      .order('created_at', { ascending: true });

    if (error) return res.status(400).json({ error: error.message });
    res.json(data || []);
  } catch (err) {
    console.error('[GET comments]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});

/* POST /api/posts/:id/comments */
router.post('/:id/comments', async (req, res) => {
  const { id } = req.params;
  const { user_id, content } = req.body;
  if (!user_id) return res.status(400).json({ error: '需要登入' });
  if (!content || content.trim().length < 1) return res.status(400).json({ error: '留言不可為空' });

  try {
    const { data, error } = await supabase
      .from('post_comments')
      .insert({ post_id: parseInt(id), user_id: parseInt(user_id), content: content.trim() })
      .select('comment_id, user_id, content, created_at, users(nickname, department_grade)')
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // 更新 comment_count（先查再 +1）
    const { data: cur } = await supabase
      .from('forum_posts').select('comment_count').eq('post_id', id).single();
    await supabase.from('forum_posts')
      .update({ comment_count: (cur?.comment_count || 0) + 1 }).eq('post_id', id);

    res.json({ message: '留言成功', comment: data });
  } catch (err) {
    console.error('[POST comments]', err.message);
    res.status(500).json({ error: '留言失敗' });
  }
});

module.exports = router;