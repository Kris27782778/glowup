const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic(); // 自動讀 process.env.ANTHROPIC_API_KEY

const SKIN_TYPE_LABEL = {
  oily:       '油性肌',
  dry:        '乾性肌',
  combo:      '混合性肌',
  combo_dry:  '混合偏乾肌',
  combo_oily: '混合偏油肌',
  normal:     '中性肌',
  sensitive:  '敏感性肌',
};

// POST /api/ai/recommend
// body: { skin_type, concerns, products }
router.post('/recommend', async (req, res) => {
  const { skin_type, concerns = '', products = [] } = req.body;
  if (!skin_type) return res.status(400).json({ error: '缺少 skin_type' });

  const skinLabel = SKIN_TYPE_LABEL[skin_type] || skin_type;

  const productList = products.slice(0, 20).map((p, i) =>
    `${i + 1}. 【${p.name}】品牌：${p.brand}，類別：${p.sub_category}，推薦分數：${p.score ?? 'N/A'}`
  ).join('\n');

  const prompt = `
你是一位專業的保養品顧問，請根據用戶的膚質給出個人化建議。

用戶膚質：${skinLabel}
用戶需求：${concerns || '無特別說明'}

以下是可推薦的產品清單：
${productList || '（暫無產品資料）'}

請：
1. 用 2-3 句話分析這個膚質的特點與保養重點
2. 從清單中挑出最適合的 3 款產品並說明原因
3. 給出 1-2 個生活保養小建議

請用繁體中文回答，語氣親切自然。
`.trim();

  // SSE streaming
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    for await (const event of stream) {
      if (
        event.type === 'content_block_delta' &&
        event.delta.type === 'text_delta'
      ) {
        res.write(`data: ${JSON.stringify({ text: event.delta.text })}\n\n`);
      }
    }

    res.write('data: [DONE]\n\n');
    res.end();
  } catch (err) {
    console.error('[AI] Error:', err.message);
    res.write(`data: ${JSON.stringify({ error: err.message })}\n\n`);
    res.end();
  }
});

module.exports = router;
