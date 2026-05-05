/**
 * 完整功能測試腳本
 * 覆蓋：認證流程 / 膚質測驗 / 產品知識庫 / 收藏庫 / 問答 / 通知 / 評論 / 管理後台
 *
 * 執行方式：node test-sprint1.mjs
 * 前置條件：後端伺服器已在 localhost:5001 啟動
 */

import { createRequire } from 'module';
import { readFileSync }   from 'fs';
import { resolve }        from 'path';
// pg 裝在 backend/node_modules，從該目錄解析
const backendRequire = createRequire(resolve('./backend/index.js'));
const { Pool } = backendRequire('pg');

// ─── 載入 backend/.env ────────────────────────────────────────────────
function loadEnv(path) {
  const content = readFileSync(path, 'utf8');
  const env = {};
  content.split('\n').forEach(line => {
    const m = line.match(/^([^=\s#][^=]*?)\s*=\s*(.*)$/);
    if (m) env[m[1].trim()] = m[2].trim();
  });
  return env;
}
const backendEnv = loadEnv('./backend/.env');
const pool       = new Pool({ connectionString: backendEnv.DATABASE_URL });
const ADMIN_KEY  = backendEnv.ADMIN_KEY;

const BASE = 'http://localhost:5001';

// ─── 工具函式 ─────────────────────────────────────────────────────────
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
    console.log(`  ${GREEN}✔${RESET}  ${label}${result !== undefined ? `  ${YELLOW}→ ${result}${RESET}` : ''}`);
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

async function api(method, path, body, headers = {}) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...headers },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  return { res, data };
}

// ─── 測試資料 ─────────────────────────────────────────────────────────
const TS        = Date.now();
const TEST_USER = {
  student_id:       `T${TS}`,
  password:         'Test1234!',
  nickname:         `測試用戶_${TS}`,
  department_grade: '資傳系四乙',
  email:            `test${TS}@fju.edu.tw`,
  skin_type:        'oily',
};
// 跨測試共用狀態
const state = { userId: null, questionId: null, productId: null };

// ══════════════════════════════════════════════════════════════════════
//  一、後端健康 & 認證流程
// ══════════════════════════════════════════════════════════════════════
section('一、後端健康 & 認證流程');

await test('後端伺服器健康檢查', async () => {
  const { res, data } = await api('GET', '/');
  assert(res.ok, `HTTP ${res.status}`);
  return data.message;
});

await test('預先插入已驗證 OTP（繞過真實信件）', async () => {
  await pool.query('DELETE FROM email_verifications WHERE email = $1', [TEST_USER.email]);
  await pool.query(
    `INSERT INTO email_verifications (email, otp, expires_at, verified_at)
     VALUES ($1, '000000', NOW() + INTERVAL '30 minutes', NOW())`,
    [TEST_USER.email]
  );
  return `${TEST_USER.email} 已預置驗證記錄`;
});

await test('OTP 驗證失敗：錯誤驗證碼 → 400', async () => {
  const tmpEmail = `otp_fail_${TS}@fju.edu.tw`;
  await pool.query('DELETE FROM email_verifications WHERE email = $1', [tmpEmail]);
  await pool.query(
    `INSERT INTO email_verifications (email, otp, expires_at)
     VALUES ($1, '123456', NOW() + INTERVAL '10 minutes')`,
    [tmpEmail]
  );
  const { res } = await api('POST', '/api/auth/verify-otp', { email: tmpEmail, otp: '999999' });
  await pool.query('DELETE FROM email_verifications WHERE email = $1', [tmpEmail]);
  assert(res.status === 400, `預期 400，實際 ${res.status}`);
});

await test('OTP 驗證成功（正確驗證碼）', async () => {
  const tmpEmail = `otp_ok_${TS}@fju.edu.tw`;
  await pool.query('DELETE FROM email_verifications WHERE email = $1', [tmpEmail]);
  await pool.query(
    `INSERT INTO email_verifications (email, otp, expires_at)
     VALUES ($1, '654321', NOW() + INTERVAL '10 minutes')`,
    [tmpEmail]
  );
  const { res, data } = await api('POST', '/api/auth/verify-otp', { email: tmpEmail, otp: '654321' });
  await pool.query('DELETE FROM email_verifications WHERE email = $1', [tmpEmail]);
  assert(res.ok, `HTTP ${res.status}`);
  assert(data.message === '驗證成功', `訊息不符：${data.message}`);
  return data.message;
});

await test('註冊新帳號（email 已通過 OTP 驗證）', async () => {
  const { res, data } = await api('POST', '/api/auth/register', TEST_USER);
  assert(res.ok, `HTTP ${res.status}：${data.error || '未知錯誤'}`);
  assert(data.message === '註冊成功', `訊息不符：${data.message}`);
  assert(data.user?.student_id === TEST_USER.student_id, '回傳學號不符');
  state.userId = data.user.user_id;
  return `user_id=${state.userId}`;
});

await test('重複學號應回傳 409', async () => {
  // register 成功後 email_verifications 已被清除，補插一筆再試
  await pool.query(
    `INSERT INTO email_verifications (email, otp, expires_at, verified_at)
     VALUES ($1, '000000', NOW() + INTERVAL '30 minutes', NOW())`,
    [TEST_USER.email]
  );
  const { res, data } = await api('POST', '/api/auth/register', TEST_USER);
  await pool.query('DELETE FROM email_verifications WHERE email = $1', [TEST_USER.email]);
  assert(res.status === 409, `預期 409，實際 ${res.status}：${data.error}`);
});

await test('登入成功', async () => {
  const { res, data } = await api('POST', '/api/auth/login', {
    student_id: TEST_USER.student_id,
    password:   TEST_USER.password,
  });
  assert(res.ok, `HTTP ${res.status}：${data.error || '未知錯誤'}`);
  assert(data.user?.nickname === TEST_USER.nickname, '暱稱不符');
  return `歡迎 ${data.user.nickname}`;
});

await test('密碼錯誤應回傳 401', async () => {
  const { res } = await api('POST', '/api/auth/login', {
    student_id: TEST_USER.student_id,
    password:   'WrongPassword',
  });
  assert(res.status === 401, `預期 401，實際 ${res.status}`);
});

await test('不存在帳號應回傳 401', async () => {
  const { res } = await api('POST', '/api/auth/login', {
    student_id: 'NOTEXIST000',
    password:   'any',
  });
  assert(res.status === 401, `預期 401，實際 ${res.status}`);
});

await test('更新暱稱（PATCH profile）', async () => {
  const newNick = `改名_${TS}`;
  const { res, data } = await api('PATCH', '/api/auth/profile', {
    user_id:  state.userId,
    nickname: newNick,
  });
  assert(res.ok, `HTTP ${res.status}`);
  assert(data.user?.nickname === newNick, '暱稱未更新');
  return data.user.nickname;
});

await test('更新膚質（PATCH profile）', async () => {
  const { res, data } = await api('PATCH', '/api/auth/profile', {
    user_id:   state.userId,
    skin_type: 'dry',
  });
  assert(res.ok, `HTTP ${res.status}`);
  assert(data.user?.skin_type === 'dry', '膚質未更新');
  return data.user.skin_type;
});

// ══════════════════════════════════════════════════════════════════════
//  二、儀表板膚質測驗（前端計分邏輯）
// ══════════════════════════════════════════════════════════════════════
section('二、儀表板膚質測驗（前端計分邏輯）');

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
  const r = calcResult({ oily: 10 });
  assert(r === 'oily', `預期 oily，得到 ${r}`);
  return r;
});
await test('全乾性答案 → 乾性肌', async () => {
  const r = calcResult({ dry: 9 });
  assert(r === 'dry', `預期 dry，得到 ${r}`);
  return r;
});
await test('敏感分數 ≥ 3 → 敏感性肌', async () => {
  const r = calcResult({ sensitive: 4, oily: 2 });
  assert(r === 'sensitive', `預期 sensitive，得到 ${r}`);
  return r;
});
await test('混合偏乾 → combo_dry', async () => {
  const r = calcResult({ combo: 2, combo_dry: 4 });
  assert(r === 'combo_dry', `預期 combo_dry，得到 ${r}`);
  return r;
});
await test('混合偏油 → combo_oily', async () => {
  const r = calcResult({ combo: 2, combo_oily: 4 });
  assert(r === 'combo_oily', `預期 combo_oily，得到 ${r}`);
  return r;
});
await test('無明確偏向 → 中性肌', async () => {
  const r = calcResult({ normal: 5 });
  assert(r === 'normal', `預期 normal，得到 ${r}`);
  return r;
});
await test('所有分數為零 → 預設中性肌', async () => {
  const r = calcResult({});
  assert(r === 'normal', `預期 normal，得到 ${r}`);
  return r;
});

// ══════════════════════════════════════════════════════════════════════
//  三、產品知識庫
// ══════════════════════════════════════════════════════════════════════
section('三、產品知識庫');

await test('查詢化妝品全部產品（無篩選）', async () => {
  const { res, data } = await api('GET', '/api/products?category=化妝品');
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.data), '回傳格式錯誤（預期 data.data 為陣列）');
  return `共 ${data.data.length} 筆`;
});

await test('查詢保養品全部產品（無篩選）', async () => {
  const { res, data } = await api('GET', '/api/products?category=保養品');
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.data), '回傳格式錯誤');
  if (data.data.length > 0) state.productId = data.data[0].product_id;
  return `共 ${data.data.length} 筆`;
});

const SKIN_TYPES = ['油性肌', '乾性肌', '敏感性肌', '中性肌', '混合性肌'];
for (const skin of SKIN_TYPES) {
  await test(`依膚質篩選：${skin}（保養品）`, async () => {
    const params = new URLSearchParams({ category: '保養品', skin_type: skin });
    const { res, data } = await api('GET', `/api/products?${params}`);
    assert(res.ok, `HTTP ${res.status}`);
    assert(Array.isArray(data.data), '回傳格式錯誤');
    if (data.data.length > 0) {
      assert(typeof data.data[0].score === 'number', 'score 欄位缺失或非數字');
      const sorted = data.data.every((p, i) =>
        i === 0 || data.data[i - 1].score >= p.score
      );
      assert(sorted, '結果未按 score 由高到低排序');
    }
    return `${data.data.length} 筆，最高分 ${data.data[0]?.score ?? 'N/A'}`;
  });
}

const EFFECTS = ['保濕', '控油', '舒緩修復', '抗痘', '去角質', '美白', '抗老'];
for (const effect of EFFECTS) {
  await test(`依功效篩選：${effect}（保養品）`, async () => {
    const params = new URLSearchParams({ category: '保養品', effect });
    const { res, data } = await api('GET', `/api/products?${params}`);
    assert(res.ok, `HTTP ${res.status}`);
    assert(Array.isArray(data.data), '回傳格式錯誤');
    return `${data.data.length} 筆`;
  });
}

await test('組合查詢：油性肌 + 控油（保養品）', async () => {
  const params = new URLSearchParams({ category: '保養品', skin_type: '油性肌', effect: '控油' });
  const { res, data } = await api('GET', `/api/products?${params}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.data), '回傳格式錯誤');
  return `${data.data.length} 筆，最高分 ${data.data[0]?.score ?? 'N/A'}`;
});

await test('組合查詢：敏感性肌 + 舒緩修復（保養品）', async () => {
  const params = new URLSearchParams({ category: '保養品', skin_type: '敏感性肌', effect: '舒緩修復' });
  const { res, data } = await api('GET', `/api/products?${params}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.data), '回傳格式錯誤');
  return `${data.data.length} 筆`;
});

await test('化妝品品項篩選：粉底液', async () => {
  const params = new URLSearchParams({ category: '化妝品', sub_category: '粉底液' });
  const { res, data } = await api('GET', `/api/products?${params}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.data), '回傳格式錯誤');
  if (data.data.length > 0) {
    assert(data.data.every(p => p.sub_category === '粉底液'), '結果包含非粉底液品項');
  }
  return `${data.data.length} 筆`;
});

// ══════════════════════════════════════════════════════════════════════
//  四、個人收藏庫
// ══════════════════════════════════════════════════════════════════════
section('四、個人收藏庫');

await test('新增收藏', async () => {
  assert(state.userId && state.productId, '缺少 userId 或 productId（前置測試未通過）');
  const { res, data } = await api('POST', '/api/wishlist', {
    user_id:    state.userId,
    product_id: state.productId,
  });
  assert(res.ok, `HTTP ${res.status}：${data.error}`);
  assert(data.message === '收藏成功', `訊息不符：${data.message}`);
  return `wishlist_id=${data.wishlist?.wishlist_id}`;
});

await test('查看收藏清單（含產品資料）', async () => {
  const { res, data } = await api('GET', `/api/wishlist/${state.userId}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  assert(data.length >= 1, '收藏清單應至少有 1 筆');
  assert(data[0].products !== undefined, '缺少 products 巢狀欄位');
  return `${data.length} 筆`;
});

await test('重複收藏應回傳 400', async () => {
  const { res } = await api('POST', '/api/wishlist', {
    user_id:    state.userId,
    product_id: state.productId,
  });
  assert(res.status === 400, `預期 400，實際 ${res.status}`);
});

await test('取消收藏', async () => {
  const { res, data } = await api('DELETE', '/api/wishlist', {
    user_id:    state.userId,
    product_id: state.productId,
  });
  assert(res.ok, `HTTP ${res.status}：${data.error}`);
  assert(data.message === '已取消收藏', `訊息不符：${data.message}`);
});

await test('取消後收藏清單應為空', async () => {
  const { res, data } = await api('GET', `/api/wishlist/${state.userId}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data) && data.length === 0, `預期 0 筆，實際 ${data.length ?? '?'} 筆`);
  return '清單已清空';
});

// ══════════════════════════════════════════════════════════════════════
//  五、問答系統
// ══════════════════════════════════════════════════════════════════════
section('五、問答系統');

await test('新增問題', async () => {
  const { res, data } = await api('POST', '/api/questions', {
    user_id:      state.userId,
    title:        `測試問題_${TS}`,
    detail:       '這是一個自動化測試產生的問題，請忽略。',
    tags:         ['油性肌', '成分討論'],
    is_anonymous: false,
  });
  assert(res.ok, `HTTP ${res.status}：${data.error}`);
  assert(data.question?.question_id, '缺少 question_id');
  state.questionId = data.question.question_id;
  return `question_id=${state.questionId}`;
});

await test('標題或說明為空應回傳 400', async () => {
  const { res } = await api('POST', '/api/questions', {
    user_id: state.userId,
    title:   '',
    detail:  '',
  });
  assert(res.status === 400, `預期 400，實際 ${res.status}`);
});

await test('取得全部問題列表（分頁格式）', async () => {
  const { res, data } = await api('GET', '/api/questions');
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.data), '回傳格式錯誤（預期 data.data 為陣列）');
  assert(typeof data.total === 'number', '缺少 total 欄位');
  return `共 ${data.total} 筆`;
});

await test('依 user_id 篩選我的提問', async () => {
  const { res, data } = await api('GET',
    `/api/questions?user_id=${state.userId}&include_anonymous=true`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data.data), '回傳格式錯誤');
  assert(data.data.some(q => q.question_id === state.questionId), '找不到剛建立的問題');
  return `${data.data.length} 筆`;
});

await test('新增社群回覆', async () => {
  const { res, data } = await api('POST',
    `/api/questions/${state.questionId}/answers`, {
      user_id: state.userId,
      content: '這是一則自動化測試回覆，請忽略。',
    });
  assert(res.ok, `HTTP ${res.status}：${data.error}`);
  assert(data.message === '回覆成功', `訊息不符：${data.message}`);
  return `answer_id=${data.answer?.answer_id}`;
});

await test('回覆內容為空應回傳 400', async () => {
  const { res } = await api('POST',
    `/api/questions/${state.questionId}/answers`, {
      user_id: state.userId,
      content: '   ',
    });
  assert(res.status === 400, `預期 400，實際 ${res.status}`);
});

await test('取得問題的回覆列表', async () => {
  const { res, data } = await api('GET',
    `/api/questions/${state.questionId}/answers`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  assert(data.length >= 1, '應至少有 1 則回覆');
  return `${data.length} 則回覆`;
});

await test('非本人刪除問題應回傳 403', async () => {
  const { res } = await api('DELETE',
    `/api/questions/${state.questionId}`, { user_id: 999999 });
  assert(res.status === 403 || res.status === 404,
    `預期 403/404，實際 ${res.status}`);
});

// ══════════════════════════════════════════════════════════════════════
//  六、通知系統
// ══════════════════════════════════════════════════════════════════════
section('六、通知系統');

await test('自己回覆自己的問題不計入未讀', async () => {
  const since = encodeURIComponent(new Date(0).toISOString());
  const { res, data } = await api('GET',
    `/api/notifications/unread?user_id=${state.userId}&since=${since}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(typeof data.count === 'number', '缺少 count 欄位');
  assert(data.count === 0, `預期 0（自問自答 neq 過濾），實際 ${data.count}`);
  return `未讀數：${data.count}`;
});

await test('不存在的 user_id 未讀數應為 0', async () => {
  const { res, data } = await api('GET', '/api/notifications/unread?user_id=999999');
  assert(res.ok, `HTTP ${res.status}`);
  assert(data.count === 0, `預期 0，實際 ${data.count}`);
});

// ══════════════════════════════════════════════════════════════════════
//  七、產品評論
// ══════════════════════════════════════════════════════════════════════
section('七、產品評論');

await test('新增產品評論', async () => {
  assert(state.productId, '缺少 productId（前置測試未通過）');
  const { res, data } = await api('POST', '/api/reviews', {
    product_id: state.productId,
    user_id:    state.userId,
    rating:     4,
    content:    '自動化測試評論，請忽略。',
  });
  assert(res.ok, `HTTP ${res.status}：${data.error}`);
  assert(data.rating === 4, `評分不符，預期 4，實際 ${data.rating}`);
  return `rating=${data.rating}`;
});

await test('取得產品評論列表', async () => {
  const { res, data } = await api('GET', `/api/reviews/${state.productId}`);
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  assert(data.length >= 1, '應至少有 1 則評論');
  return `${data.length} 則評論`;
});

await test('UPSERT：更新同一用戶的評論', async () => {
  const { res, data } = await api('POST', '/api/reviews', {
    product_id: state.productId,
    user_id:    state.userId,
    rating:     5,
    content:    '自動化測試評論（更新版），請忽略。',
  });
  assert(res.ok, `HTTP ${res.status}：${data.error}`);
  assert(data.rating === 5, `評分應更新為 5，實際 ${data.rating}`);
  return `更新後 rating=${data.rating}`;
});

await test('缺少 rating 應回傳 400', async () => {
  const { res } = await api('POST', '/api/reviews', {
    product_id: state.productId,
    user_id:    state.userId,
    // 缺 rating
  });
  assert(res.status === 400, `預期 400，實際 ${res.status}`);
});

// ══════════════════════════════════════════════════════════════════════
//  八、管理員後台
// ══════════════════════════════════════════════════════════════════════
section('八、管理員後台');

await test('無金鑰存取應回傳 401', async () => {
  const { res } = await api('GET', '/api/admin/stats');
  assert(res.status === 401, `預期 401，實際 ${res.status}`);
});

await test('統計概覽', async () => {
  const { res, data } = await api('GET', '/api/admin/stats', null,
    { 'x-admin-key': ADMIN_KEY });
  assert(res.ok, `HTTP ${res.status}`);
  assert(typeof data.userCount    === 'number', '缺少 userCount');
  assert(typeof data.productCount === 'number', '缺少 productCount');
  assert(typeof data.questionCount === 'number', '缺少 questionCount');
  return `會員 ${data.userCount}，產品 ${data.productCount}，問題 ${data.questionCount}`;
});

await test('會員列表查詢', async () => {
  const { res, data } = await api('GET', '/api/admin/users', null,
    { 'x-admin-key': ADMIN_KEY });
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data), '回傳非陣列');
  return `${data.length} 位會員`;
});

await test('關鍵字搜尋會員', async () => {
  const q = encodeURIComponent(TEST_USER.student_id);
  const { res, data } = await api('GET', `/api/admin/users?q=${q}`, null,
    { 'x-admin-key': ADMIN_KEY });
  assert(res.ok, `HTTP ${res.status}`);
  assert(Array.isArray(data) && data.length >= 1, '應找到測試用戶');
  return `找到 ${data.length} 位`;
});

// ══════════════════════════════════════════════════════════════════════
//  清理測試資料
// ══════════════════════════════════════════════════════════════════════
section('清理測試資料');

await test('刪除測試問題（含回覆）', async () => {
  if (!state.questionId) return '無 questionId，跳過';
  await pool.query('DELETE FROM answers  WHERE question_id = $1', [state.questionId]);
  await pool.query('DELETE FROM questions WHERE question_id = $1', [state.questionId]);
  return `question_id=${state.questionId} 已刪除`;
});

await test('刪除測試評論', async () => {
  if (!state.userId || !state.productId) return '跳過';
  await pool.query(
    'DELETE FROM reviews WHERE user_id = $1 AND product_id = $2',
    [state.userId, state.productId]
  );
  return '評論已清除';
});

await test('刪除測試帳號', async () => {
  if (!state.userId) return '無 userId，跳過';
  await pool.query('DELETE FROM wishlists WHERE user_id = $1', [state.userId]);
  await pool.query('DELETE FROM users     WHERE user_id = $1', [state.userId]);
  return `user_id=${state.userId} 已刪除`;
});

await pool.end();

// ─── 摘要 ─────────────────────────────────────────────────────────────
console.log(`\n${'─'.repeat(50)}`);
console.log(
  `${BOLD}測試結果：${GREEN}${passed} 通過${RESET}  ${failed > 0 ? RED : ''}${failed} 失敗${RESET}`
);
console.log('─'.repeat(50));
if (failed > 0) process.exit(1);
