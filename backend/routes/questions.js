const express  = require('express');
const router   = express.Router();
const supabase = require('../config/supabase');
const Anthropic = require('@anthropic-ai/sdk');

const STOP_WORDS = new Set([
  '可以', '能不能', '是否', '請問', '想問', '問題', '使用', '一起', '適合', '需要',
  '怎麼', '如何', '什麼', '哪個', '哪種', '比較', '推薦', '有人', '知道', '保養',
]);

const SYNONYMS = {
  'a醇': ['a醇', '維a醇', '視黃醇', 'retinol'],
  '玻尿酸': ['玻尿酸', '透明質酸', 'hyaluronic'],
  '菸鹼醯胺': ['菸鹼醯胺', '煙酰胺', 'niacinamide'],
  '水楊酸': ['水楊酸', 'bha', 'salicylic'],
  '杏仁酸': ['杏仁酸', 'mandelic'],
  '乳酸': ['乳酸', 'lactic'],
  '維他命c': ['維他命c', '維生素c', 'vitamin c', '抗壞血酸'],
  '敏感肌': ['敏感肌', '敏感性肌', '泛紅', '刺痛'],
  '油性肌': ['油性肌', '油肌', '出油'],
  '乾性肌': ['乾性肌', '乾肌', '乾燥'],
};

const normalizeText = (value = '') =>
  String(value)
    .toLowerCase()
    .replace(/[Ａ-Ｚａ-ｚ０-９]/g, ch => String.fromCharCode(ch.charCodeAt(0) - 0xFEE0))
    .replace(/[^\p{Script=Han}a-z0-9%+\s]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const addToken = (map, token, weight = 1) => {
  if (!token || token.length < 2 || STOP_WORDS.has(token)) return;
  map.set(token, (map.get(token) || 0) + weight);
};

const tokenize = (text = '', baseWeight = 1) => {
  const normalized = normalizeText(text);
  const tokens = new Map();

  Object.entries(SYNONYMS).forEach(([canonical, variants]) => {
    if (variants.some(v => normalized.includes(v))) addToken(tokens, canonical, baseWeight * 2.4);
  });

  normalized.split(/\s+/).forEach(part => {
    if (!part) return;
    addToken(tokens, part, baseWeight * 1.4);
    if (/^[\p{Script=Han}]+$/u.test(part)) {
      for (let size = 2; size <= Math.min(4, part.length); size += 1) {
        for (let i = 0; i <= part.length - size; i += 1) {
          addToken(tokens, part.slice(i, i + size), baseWeight / size);
        }
      }
    }
  });

  return tokens;
};

const mergeTokenMaps = (...maps) => {
  const merged = new Map();
  maps.forEach(map => {
    map.forEach((value, key) => addToken(merged, key, value));
  });
  return merged;
};

const cosine = (a, b) => {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  a.forEach((value, key) => {
    normA += value * value;
    dot += value * (b.get(key) || 0);
  });
  b.forEach(value => { normB += value * value; });
  if (!normA || !normB) return 0;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
};

const tagSimilarity = (inputTags = [], candidateTags = []) => {
  const a = new Set(inputTags);
  const b = new Set(candidateTags || []);
  if (!a.size || !b.size) return 0;
  let overlap = 0;
  a.forEach(tag => { if (b.has(tag)) overlap += 1; });
  return overlap / Math.max(a.size, b.size);
};

const topMatchedTokens = (a, b) =>
  [...a.entries()]
    .filter(([key]) => b.has(key))
    .sort((x, y) => (y[1] + b.get(y[0])) - (x[1] + b.get(x[0])))
    .slice(0, 4)
    .map(([key]) => key);

const scoreQuestionSimilarity = (input, question) => {
  const inputTitle = tokenize(input.title, 2.2);
  const inputDetail = tokenize(input.detail, 1);
  const candidateTitle = tokenize(question.title, 2.2);
  const candidateDetail = tokenize(question.detail, 1);
  const inputAll = mergeTokenMaps(inputTitle, inputDetail);
  const candidateAll = mergeTokenMaps(candidateTitle, candidateDetail);

  const titleScore = cosine(inputTitle, candidateTitle);
  const detailScore = cosine(inputAll, candidateAll);
  const tagsScore = tagSimilarity(input.tags, question.tags);
  const exactTitleBoost = normalizeText(input.title).includes(normalizeText(question.title))
    || normalizeText(question.title).includes(normalizeText(input.title))
    ? 0.12
    : 0;
  const solvedBoost = question.solved ? 0.03 : 0;
  const answerBoost = Number(question.answer_count || 0) > 0 ? 0.02 : 0;
  const score = Math.min(1, titleScore * 0.5 + detailScore * 0.25 + tagsScore * 0.18 + exactTitleBoost + solvedBoost + answerBoost);

  return {
    score,
    matched_terms: topMatchedTokens(inputAll, candidateAll),
  };
};

// GET /api/questions — 取問題列表（支援 tag / search / solved / unanswered 篩選，分頁）
router.get('/', async (req, res) => {
  const { tag, search, solved, unanswered, user_id, include_anonymous, page = 1, limit = 20 } = req.query;
  const pageNum = Math.max(1, parseInt(page));
  const pageSize = Math.min(50, Math.max(1, parseInt(limit)));
  const from = (pageNum - 1) * pageSize;
  const to = from + pageSize - 1;

  try {
    let query = supabase
      .from('questions')
      .select('question_id, user_id, is_anonymous, title, tags, solved, views, created_at, ai_answer, users(nickname, department_grade), answers(count)', { count: 'exact' });

    if (user_id) {
      query = query.eq('user_id', user_id);
      if (include_anonymous !== 'true') query = query.eq('is_anonymous', false);
    }
    if (solved === 'true')  query = query.eq('solved', true);
    if (solved === 'false') query = query.eq('solved', false);
    if (tag)    query = query.contains('tags', [tag]);
    if (search) query = query.or(`title.ilike.%${search}%`);

    if (unanswered === 'true') {
      const { data: answeredRows } = await supabase.from('answers').select('question_id');
      const answeredIds = [...new Set((answeredRows || []).map(r => r.question_id))];
      if (answeredIds.length > 0) {
        query = query.not('question_id', 'in', `(${answeredIds.join(',')})`);
      }
      query = query.eq('solved', false).order('created_at', { ascending: true });
    } else {
      query = query.order('created_at', { ascending: false });
    }
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const masked = (data || []).map(q => {
      const base = { ...q, answer_count: q.answers?.[0]?.count ?? 0 };
      delete base.answers;
      if (q.is_anonymous && include_anonymous !== 'true') {
        return { ...base, user_id: null, users: null };
      }
      return base;
    });

    res.json({ data: masked, total: count, page: pageNum, limit: pageSize });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '查詢失敗' });
  }
});

// POST /api/questions/similar — AI 智能相似問題偵測
router.post('/similar', async (req, res) => {
  const { title = '', detail = '', tags = [], limit = 5, exclude_id } = req.body || {};
  const cleanTitle = String(title).trim();
  const cleanDetail = String(detail).trim();
  if (cleanTitle.length < 4 && cleanDetail.length < 12) {
    return res.json({ data: [], total: 0 });
  }

  try {
    // 第一步：關鍵字預篩，取候選問題
    let query = supabase
      .from('questions')
      .select('question_id, title, detail, tags, solved, views, created_at, answers(count)')
      .order('created_at', { ascending: false })
      .limit(200);

    if (exclude_id) query = query.neq('question_id', exclude_id);

    const { data, error } = await query;
    if (error) return res.status(400).json({ error: error.message });

    const inputTags = Array.isArray(tags) ? tags : [];
    const preScored = (data || [])
      .map(q => {
        const answerCount = q.answers?.[0]?.count ?? 0;
        const result = scoreQuestionSimilarity(
          { title: cleanTitle, detail: cleanDetail, tags: inputTags },
          { ...q, answer_count: answerCount },
        );
        return {
          question_id: q.question_id,
          title: q.title,
          excerpt: (q.detail || '').slice(0, 120),
          tags: q.tags || [],
          solved: q.solved,
          views: q.views || 0,
          answer_count: answerCount,
          keywordScore: result.score,
          matched_terms: result.matched_terms,
        };
      })
      .filter(q => q.keywordScore >= 0.1)
      .sort((a, b) => b.keywordScore - a.keywordScore)
      .slice(0, 12);

    if (preScored.length === 0) return res.json({ data: [], total: 0 });

    // 第二步：Claude AI 重新評分
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (!apiKey) {
      // 無 API key，退回關鍵字結果
      const fallback = preScored
        .filter(q => q.keywordScore >= 0.18)
        .slice(0, Number(limit) || 5)
        .map(q => ({ ...q, id: q.question_id, score: q.keywordScore }));
      return res.json({ data: fallback, total: fallback.length });
    }

    const anthropic = new Anthropic({ apiKey, timeout: 15000 });
    const candidateList = preScored.map((q, i) =>
      `${i + 1}. 標題：「${q.title}」　標籤：[${q.tags.join(', ')}]`
    ).join('\n');

    const msg = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 512,
      messages: [{
        role: 'user',
        content: `你是一個美妝保養問答系統的相似問題判斷引擎。

用戶新問題：
標題：「${cleanTitle}」
${cleanDetail ? `說明：「${cleanDetail.slice(0, 200)}」` : ''}
標籤：[${inputTags.join(', ')}]

以下是候選問題，請評估每題與用戶問題的語意相似度（0.0～1.0）：
${candidateList}

只輸出 JSON 陣列，格式：[{"index":1,"score":0.85},{"index":2,"score":0.42}]
僅包含 score >= 0.35 的項目，其餘省略。不要輸出其他文字。`,
      }],
    });

    let aiScores = [];
    try {
      const text = msg.content[0]?.text || '[]';
      const match = text.match(/\[[\s\S]*\]/);
      aiScores = match ? JSON.parse(match[0]) : [];
    } catch {
      aiScores = [];
    }

    const scoreMap = new Map(aiScores.map(s => [s.index - 1, s.score]));

    const result = preScored
      .map((q, i) => {
        const aiScore = scoreMap.get(i);
        if (aiScore === undefined) return null;
        return {
          id: q.question_id,
          question_id: q.question_id,
          title: q.title,
          excerpt: q.excerpt,
          tags: q.tags,
          solved: q.solved,
          views: q.views,
          answer_count: q.answer_count,
          answers: q.answer_count,
          score: Number(aiScore.toFixed(3)),
          matched_terms: q.matched_terms,
        };
      })
      .filter(Boolean)
      .sort((a, b) => b.score - a.score || b.answer_count - a.answer_count)
      .slice(0, Math.min(10, Math.max(1, Number(limit) || 5)));

    res.json({ data: result, total: result.length });
  } catch (err) {
    console.error('[similar]', err.message);
    res.status(500).json({ error: '相似問題偵測失敗' });
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

    // 立即回傳，不等 AI
    res.json({ message: '問題新增成功', question: data });

    // 背景呼叫 Claude（完全獨立，任何錯誤都不影響主流程）
    const apiKey = process.env.ANTHROPIC_API_KEY?.trim();
    if (apiKey) {
      const questionId = data.question_id;
      (async () => {
        try {
          const anthropic = new Anthropic({ apiKey, timeout: 30000 });
          const msg = await anthropic.messages.create({
            model: 'claude-haiku-4-5-20251001',
            max_tokens: 400,
            messages: [{
              role: 'user',
              content: `你是 GLŌW AI，輔大美妝交流平台的智能助理，專精保養成分分析。請針對以下問題，提供簡潔、科學的初步分析（150字以內），重點放在成分、膚質適合性或保養建議，語氣親切自然。\n\n重要規則：直接給出分析結論，不要詢問使用者是否有更多問題，不要邀請追問，不要以「如果有任何問題」或類似句子結尾。\n\n問題標題：${title}\n問題說明：${detail}`,
            }],
          });
          const aiText = msg.content?.[0]?.text || '';
          await supabase.from('questions').update({ ai_answer: aiText }).eq('question_id', questionId);
          console.log(`AI 回覆完成 (question ${questionId})`);
        } catch (err) {
          console.error('AI 回覆失敗:', err.message || err);
        }
      })();
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '新增失敗' });
  }
});

// POST /api/questions/:id/bookmark — 收藏 / 取消收藏問答（toggle）
router.post('/:id/bookmark', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: '需要登入' });
  try {
    const { data: existing, error: selErr } = await supabase
      .from('question_bookmarks')
      .select('id')
      .eq('question_id', id)
      .eq('user_id', user_id)
      .maybeSingle();
    if (selErr) {
      console.error('[POST question bookmark] select error:', selErr);
      return res.status(500).json({ error: selErr.message, hint: selErr.hint, code: selErr.code });
    }

    if (existing) {
      const { error: delErr } = await supabase
        .from('question_bookmarks').delete().eq('id', existing.id);
      if (delErr) {
        console.error('[POST question bookmark] delete error:', delErr);
        return res.status(500).json({ error: delErr.message, hint: delErr.hint, code: delErr.code });
      }
      return res.json({ bookmarked: false });
    }

    const { error: insErr } = await supabase
      .from('question_bookmarks')
      .insert({ question_id: parseInt(id), user_id: parseInt(user_id) });
    if (insErr) {
      console.error('[POST question bookmark] insert error:', insErr);
      return res.status(500).json({ error: insErr.message, hint: insErr.hint, code: insErr.code });
    }
    res.json({ bookmarked: true });
  } catch (err) {
    console.error('[POST question bookmark] unexpected:', err);
    res.status(500).json({ error: err.message || '操作失敗' });
  }
});

// GET /api/questions/bookmarks/:user_id — 取得使用者收藏的問答清單
router.get('/bookmarks/:user_id', async (req, res) => {
  const { user_id } = req.params;
  try {
    const { data, error } = await supabase
      .from('question_bookmarks')
      .select('question_id, questions(question_id, user_id, is_anonymous, title, tags, solved, views, created_at, ai_answer, users(nickname, department_grade), answers(count))')
      .eq('user_id', user_id)
      .order('created_at', { ascending: false });
    if (error) {
      console.error('[GET question bookmarks]', error);
      return res.status(400).json({ error: error.message, hint: error.hint, code: error.code });
    }
    const result = (data || [])
      .filter(d => d.questions)
      .map(d => ({
        ...d.questions,
        answer_count: d.questions?.answers?.[0]?.count ?? 0,
      }));
    res.json(result);
  } catch (err) {
    console.error('[GET question bookmarks]', err.message);
    res.status(500).json({ error: '查詢失敗' });
  }
});
// GET /api/questions/:id — 取得單筆問題（含 ai_answer）
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from('questions')
    .select('question_id, user_id, is_anonymous, title, detail, tags, solved, views, created_at, ai_answer, users(nickname, department_grade), answers(count)')
    .eq('question_id', id)
    .single();
  if (error) return res.status(404).json({ error: '找不到問題' });
  res.json(data);
});

// GET /api/questions/:id/bookmark-status?user_id= — 查詢是否已收藏
router.get('/:id/bookmark-status', async (req, res) => {
  const { id } = req.params;
  const { user_id } = req.query;
  if (!user_id) return res.json({ bookmarked: false });
  const { data } = await supabase
    .from('question_bookmarks')
    .select('id')
    .eq('question_id', id)
    .eq('user_id', user_id)
    .maybeSingle();
  res.json({ bookmarked: !!data });
});

// PATCH /api/questions/:id/solved — 發問者標記問題為已解決
router.patch('/:id/solved', async (req, res) => {
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
      return res.status(403).json({ error: '只有發問者可以標記已解決' });
    }
    const { error } = await supabase
      .from('questions')
      .update({ solved: true })
      .eq('question_id', id);
    if (error) return res.status(400).json({ error: error.message });
    res.json({ message: '已標記為已解決' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: '操作失敗' });
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
