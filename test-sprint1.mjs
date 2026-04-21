/**
 * Sprint 1 測試腳本
 * 覆蓋：一、註冊登入  二、膚質測驗流程  三、產品資料庫查詢
 *
 * 執行方式：node test-sprint1.mjs
 * 前置條件：後端伺服器已在 localhost:5001 啟動
 */

const BASE = 'http://localhost:5001';

// ─── 工具函式 ────────────────────────────────────────────────
const GREEN  = '\x1b[32m';
const RED    = '\x1b[31m';
const YELLOW = '\x1b[33m';
const CYAN   = '\x1b[36m';
const BOLD   = '\x1b[1m';
const RESET  = '\x1b[0m';

let passed = 0;
let failed = 0;

function section(title) {
  console.log(`\n${BOLD}${CYAN}══ ${title} ══${RESET}`);
}

async function test(label, fn) {
  try {
    const result = await fn();
    console.log(`  ${GREEN}✔${RESET}  ${label}${result ? `  ${YELLOW}→ ${result}${RESET}` : ''}`);
    passed++;
  } catch (err) {
    console.log(`  ${RED}✘${RESET}  ${label}`);
    console.log(`     ${RED}${err.message}${RESET}`);
    failed++;
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message || '斷言失敗');
}

async function api(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { res, data };
}

// ─── 測試資料 ────────────────────────────────────────────────
// 每次執行都用時間戳產生不同學號，避免重複鍵值衝突
const TS        = Date.now();
const TEST_USER = {
  student_id:       `T${TS}`,
  password:         'Test1234!',
  nickname:         `測試用戶_${TS}`,
  department_grade: '資傳系四乙',
  email:            `test${TS}@fju.edu.tw`,
  skin_type:        'oily',
};

// ════════════════════════════════════════════════════════════
//  一、註冊 & 登入
// ════════════════════════════════════════════════════════════
section('一、註冊 & 登入');

await test('後端伺服器健康檢查', async () => {
  const { res, data } = await api('GET', '/');
  assert(res.ok, `HTTP ${res.status}`);
  assert(data.message, '無回應訊息');
  return data.message;
});

await test('註冊新帳號', async () => {
  const { res, data } = await api('POST', '/api/auth/register', TEST_USER);
  assert(res.ok, `HTTP ${res.status}：${data.error || '未知錯誤'}`);
  assert(data.message === '註冊成功', `訊息不符：${data.message}`);
  assert(data.user?.student_id === TEST_USER.student_id, '回傳學號不符');
  return `學號 ${data.user.student_id} 建立成功`;
});

await test('重複學號應回傳 500', async () => {
  const { res } = await api('POST', '/api/auth/register', TEST_USER);
  assert(res.status === 500, `預期 500，實際 ${res.status}`);
});

await test('登入成功', async () => {
  const { res, data } = await api('POST', '/api/auth/login', {
    student_id: TEST_USER.student_id,
    password:   TEST_USER.password,
  });
  assert(res.ok, `HTTP ${res.status}：${data.error || '未知錯誤'}`);
  assert(data.message === '登入成功', `訊息不符：${data.message}`);
  assert(data.user?.nickname === TEST_USER.nickname, '暱稱不符');
  return `歡迎 ${data.user.nickname}`;
});

await test('密碼錯誤應回傳 401', async () => {
  const { res, data } = await api('POST', '/api/auth/login', {
    student_id: TEST_USER.student_id,
    password:   'WrongPassword',
  });
  assert(res.status === 401, `預期 401，實際 ${res.status}`);
  assert(data.error, '缺少 error 欄位');
});

await test('不存在帳號應回傳 401', async () => {
  const { res } = await api('POST', '/api/auth/login', {
    student_id: 'NOTEXIST000',
    password:   'any',
  });
  assert(res.status === 401, `預期 401，實際 ${res.status}`);
});

// ════════════════════════════════════════════════════════════
//  二、個人儀表板 — 膚質測驗（前端邏輯驗證）
// ════════════════════════════════════════════════════════════
section('二、儀表板膚質測驗（前端計分邏輯）');

/**
 * 與 SkinQuiz.js calcResult() 完全對齊的計分函式
 */
function calcResult(score) {
  if ((score.sensitive || 0) >= 3) return 'sensitive';
  const comboTotal =
    (score.combo || 0) + (score.combo_dry || 0) + (score.combo_oily || 0);
  if (comboTotal > 0) {
    const dryScore  = (score.combo_dry  || 0) + (score.dry  || 0) * 0.5;
    const oilyScore = (score.combo_oily || 0) + (score.oily || 0) * 0.5;
    if (dryScore  >= oilyScore + 2) return 'combo_dry';
    if (oilyScore >= dryScore  + 2) return 'combo_oily';
    return 'combo';
  }
  const candidates = [
    { key: 'oily',   val: score.oily   || 0 },
    { key: 'dry',    val: score.dry    || 0 },
    { key: 'normal', val: score.normal || 0 },
  ].sort((a, b) => b.val - a.val);
  return candidates[0].val > 0 ? candidates[0].key : 'normal';
}

await test('全油性答案 → 油性肌', async () => {
  // 選擇所有 oily 分數的選項
  const score = { oily: 10 };
  const result = calcResult(score);
  assert(result === 'oily', `預期 oily，得到 ${result}`);
  return result;
});

await test('全乾性答案 → 乾性肌', async () => {
  const score = { dry: 9 };
  const result = calcResult(score);
  assert(result === 'dry', `預期 dry，得到 ${result}`);
  return result;
});

await test('敏感分數 ≥ 3 → 敏感性肌', async () => {
  const score = { sensitive: 4, oily: 2 };
  const result = calcResult(score);
  assert(result === 'sensitive', `預期 sensitive，得到 ${result}`);
  return result;
});

await test('混合偏乾 → combo_dry', async () => {
  const score = { combo: 2, combo_dry: 4 };
  const result = calcResult(score);
  assert(result === 'combo_dry', `預期 combo_dry，得到 ${result}`);
  return result;
});

await test('混合偏油 → combo_oily', async () => {
  const score = { combo: 2, combo_oily: 4 };
  const result = calcResult(score);
  assert(result === 'combo_oily', `預期 combo_oily，得到 ${result}`);
  return result;
});

await test('無明確偏向 → 中性肌', async () => {
  const score = { normal: 5 };
  const result = calcResult(score);
  assert(result === 'normal', `預期 normal，得到 ${result}`);
  return result;
});

await test('所有分數為零 → 預設中性肌', async () => {
  const result = calcResult({});
  assert(result === 'normal', `預期 normal，得到 ${result}`);
  return result;
});

// ════════════════════════════════════════════════════════════
//  三、產品資料庫 — 依膚質 / 依功效查詢
// ════════════════════════════════════════════════════════════
section('三、產品資料庫查詢');

// 3-A 基礎查詢（不帶膚質/功效篩選）
await test('查詢化妝品全部產品（無篩選）', async () => {
  const { res, data } = await api('GET', '/api/products?category=化妝品');
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  return `共 ${data.length} 筆`;
});

await test('查詢保養品全部產品（無篩選）', async () => {
  const { res, data } = await api('GET', '/api/products?category=保養品');
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  return `共 ${data.length} 筆`;
});

// 3-B 依膚質篩選
const SKIN_TYPES = ['油性肌', '乾性肌', '敏感性肌', '中性肌', '混合性肌'];
for (const skin of SKIN_TYPES) {
  await test(`依膚質篩選：${skin}（保養品）`, async () => {
    const params = new URLSearchParams({ category: '保養品', skin_type: skin });
    const { res, data } = await api('GET', `/api/products?${params}`);
    assert(res.ok, `HTTP ${res.status}`);
    assert(Array.isArray(data), '回傳非陣列');
    // 如有結果，檢查 score 欄位存在且為數字
    if (data.length > 0) {
      assert(typeof data[0].score === 'number', 'score 欄位缺失或非數字');
      // 分數應由高到低排序
      const sorted = data.every((p, i) =>
        i === 0 || data[i - 1].score >= p.score
      );
      assert(sorted, '結果未按 score 由高到低排序');
    }
    return `${data.length} 筆，最高分 ${data[0]?.score ?? 'N/A'}`;
  });
}

// 3-C 依功效篩選
const EFFECTS = ['保濕', '控油', '舒緩修復', '抗痘', '去角質', '美白', '抗老'];
for (const effect of EFFECTS) {
  await test(`依功效篩選：${effect}（保養品）`, async () => {
    const params = new URLSearchParams({ category: '保養品', effect });
    const { res, data } = await api('GET', `/api/products?${params}`);
    assert(res.ok, `HTTP ${res.status}`);
    assert(Array.isArray(data), '回傳非陣列');
    if (data.length > 0) {
      assert(typeof data[0].score === 'number', 'score 欄位缺失或非數字');
    }
    return `${data.length} 筆`;
  });
}

// 3-D 膚質 + 功效組合查詢
await test('組合查詢：油性肌 + 控油（保養品）', async () => {
  const params = new URLSearchParams({
    category: '保養品',
    skin_type: '油性肌',
    effect: '控油',
  });
  const { res, data } = await api('GET', `/api/products?${params}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  if (data.length > 0) {
    assert(data[0].score >= 3, `最高分 ${data[0].score} < 過濾門檻 3`);
  }
  return `${data.length} 筆，最高分 ${data[0]?.score ?? 'N/A'}`;
});

await test('組合查詢：敏感性肌 + 舒緩修復（保養品）', async () => {
  const params = new URLSearchParams({
    category: '保養品',
    skin_type: '敏感性肌',
    effect: '舒緩修復',
  });
  const { res, data } = await api('GET', `/api/products?${params}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  return `${data.length} 筆`;
});

// 3-E 品項（sub_category）篩選
await test('化妝品品項篩選：粉底液', async () => {
  const params = new URLSearchParams({
    category: '化妝品',
    sub_category: '粉底液',
  });
  const { res, data } = await api('GET', `/api/products?${params}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  if (data.length > 0) {
    assert(
      data.every(p => p.sub_category === '粉底液'),
      '結果包含非粉底液品項'
    );
  }
  return `${data.length} 筆`;
});

// ─── 摘要 ────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(46)}`);
console.log(
  `${BOLD}測試結果：${GREEN}${passed} 通過${RESET}  ${failed > 0 ? RED : ''}${failed} 失敗${RESET}`
);
console.log('─'.repeat(46));
if (failed > 0) process.exit(1);
