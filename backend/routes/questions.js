const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');
const Anthropic = require('@anthropic-ai/sdk');

// GET /api/questions — 取問題列表（支援 tag / search / solved 篩選）
router.get('/', async (req, res) => {
  const { tag, search, solved, user_id, include_anonymous } = req.query;
  try {
    let query = supabase
      .from('questions')
      .select('question_id, user_id, is_anonymous, title, detail, tags, solved, views, created_at, ai_answer, users(nickname, department_grade)')
      .order('created_at', { ascending: false });

    if (user_id) {
      query = query.eq('user_id', user_id);
      // 查別人的問題時排除匿名，只有本人（include_anonymous=true）才能看到自己的匿名問題
      if (include_anonymous !== 'true') query = query.eq('is_anonymous', false);
    }
    if (solved === 'true')  query = query.eq('solved', true);
    if (solved === 'false') query = query.eq('solved', false);
    if (tag)    query = query.contains('tags', [tag]);
    if (search) query = query.or(`title.ilike.%${search}%,detail.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    // 匿名問題：遮蔽公開列表的用戶資料（個人頁 include_anonymous=true 時保留）
    const masked = (data || []).map(q => {
      if (q.is_anonymous && include_anonymous !== 'true') {
        return { ...q, user_id: null, users: null };
      }
      return q;
    });

    res.json(masked);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// POST /api/questions — 新增問題（新增後背景呼叫 AI 給初步回覆）
router.post('/', async (req, res) => {
  const { user_id, title, detail, tags, is_anonymous } = req.body;
  if (!title || !detail) {
    return res.status(400).json({ error: '標題與說明為必填' });
  }
  try {
    const { data, error } = await supabase
      .from('questions')
      .insert({ user_id: user_id || null, title, detail, tags: tags || [], is_anonymous: !!is_anonymous })
      .select()
      .single();

    if (error) return res.status(400).json({ error: error.message });

    // 立即回傳，不等 AI（背景執行）
    res.json({ message: '問題新增成功', question: data });

    // 背景呼叫 Claude，完成後更新 ai_answer 欄位
    if (process.env.ANTHROPIC_API_KEY) {
      const questionId = data.question_id;
      const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
      anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `你是 GLŌW AI，輔大美妝交流平台的智能助理，專精保養成分分析。請針對以下問題，提供簡潔、科學的初步分析（150字以內），重點放在成分、膚質適合性或保養建議，語氣親切自然。\n\n問題標題：${title}\n問題說明：${detail}`,
        }],
      })
        .then(msg => {
          const aiText = msg.content?.[0]?.text || '';
          return supabase.from('questions').update({ ai_answer: aiText }).eq('question_id', questionId);
        })
        .catch(err => console.error('AI 回覆失敗:', err));
    }
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
    // 先刪所有回覆，再刪問題（避免 FK 錯誤，同時確保回覆一起消失）
    await supabase.from('answers').delete().eq('question_id', id);
    const { error } = await supabase.from('questions').delete().eq('question_id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '刪除失敗' });
  }
});

module.exports = router;
