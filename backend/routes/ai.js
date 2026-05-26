const express = require('express');
const router = express.Router();
const Anthropic = require('@anthropic-ai/sdk');

const client = new Anthropic();

const SKIN_TYPE_LABEL = {
  oily:       '油性肌',
  dry:        '乾性肌',
  combo:      '混合性肌',
  combo_dry:  '混合偏乾肌',
  combo_oily: '混合偏油肌',
  normal:     '中性肌',
  sensitive:  '敏感性肌',
};

const SYSTEM_PROMPT = `你是 GLŌW 平台的 AI 肌膚顧問，專門為大學生提供個人化、精準的保養建議。

請根據用戶資訊，輸出以下幾個段落，每個段落以「##」開頭作為標題。格式要求：
- 每段只保留最關鍵的 2-4 行，不要冗長
- 語氣親切、直接，像朋友在給建議
- 使用繁體中文
- 不要加任何 markdown 粗體（**）或列表符號（-）

必要段落：
## 膚況解析
（針對此膚質與需求，2 句話說明核心問題）

## 核心保養步驟
（早晚各列 2-3 個步驟，每步驟一行，格式：「早｜清潔 → 化妝水 → 乳液」）

## 推薦成分
（列出 3-4 個最適合的成分，每行格式：「成分名稱：功效說明」）

## 保養提醒
（1-2 個針對此膚質最常見的錯誤或注意事項）

若用戶有提供目前使用的產品，加上此段落：
## 產品評估
（逐一評估每個產品，說明是否適合此膚質、理由，並給出「✓ 適合」或「△ 注意」或「✕ 不建議」標記）`;

// POST /api/ai/recommend
router.post('/recommend', async (req, res) => {
  const { skin_type, concerns = '', products = [] } = req.body;
  if (!skin_type) return res.status(400).json({ error: '缺少 skin_type' });

  const skinLabel = SKIN_TYPE_LABEL[skin_type] || skin_type;

  const productSection = products.length > 0
    ? `\n目前使用的產品：\n${products.slice(0, 10).map((p, i) =>
        `${i + 1}. ${p.name}（${p.brand}，${p.sub_category}）`
      ).join('\n')}`
    : '';

  const userMessage = `我的膚質：${skinLabel}
保養需求：${concerns || '無特別說明'}${productSection}`;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const stream = await client.messages.stream({
      model: 'claude-opus-4-7',
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMessage }],
    });

    for await (const event of stream) {
      if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
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
