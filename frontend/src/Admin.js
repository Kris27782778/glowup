import { useState, useEffect, useCallback } from 'react';
import API_BASE from './config';

const API = `${API_BASE}/api/admin`;
const ADMIN_KEY = 'glowadmin2026';

const C = {
  bg:         '#F7F5F3',
  bgPanel:    '#FFFFFF',
  bgCard:     '#F2EFED',
  bgRow:      '#FAFAF9',
  bgRowHover: '#F5F0EE',
  border:     'rgba(0,0,0,0.08)',
  accent:     '#C4897A',
  accentDim:  'rgba(196,137,122,0.12)',
  accentText: '#A8634F',
  text:       '#1C1917',
  textSub:    '#6B5E58',
  textDim:    '#A89990',
  green:      '#3D8A52',
  red:        '#B84040',
  yellow:     '#8A6A1E',
};

const SKIN_LABELS = {
  oily:      '油性肌', dry:       '乾性肌', combo:     '混合肌（均衡）',
  combo_dry: '混合肌（偏乾）', combo_oily: '混合肌（偏油）',
  normal:    '中性肌', sensitive: '敏感肌',
};

// ── API helper ────────────────────────────────────────────────────
function adminFetch(path, opts = {}) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { 'Content-Type': 'application/json', 'x-admin-key': ADMIN_KEY, ...(opts.headers || {}) },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  }).then(r => r.json());
}

// ── 格式化時間 ────────────────────────────────────────────────────
function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return `${d.getFullYear()}/${String(d.getMonth()+1).padStart(2,'0')}/${String(d.getDate()).padStart(2,'0')}`;
}

// ── 搜尋框 ────────────────────────────────────────────────────────
function SearchBar({ value, onChange, placeholder }) {
  return (
    <div style={{ position: 'relative', width: '280px' }}>
      <svg style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', opacity:0.4 }}
        width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.text} strokeWidth="2">
        <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
      </svg>
      <input
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: '100%', boxSizing: 'border-box',
          padding: '8px 12px 8px 34px',
          background: C.bgCard, border: `1px solid ${C.border}`,
          borderRadius: '8px', color: C.text,
          fontSize: '13px', fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
          outline: 'none',
        }}
      />
    </div>
  );
}

// ── 確認刪除 Modal ────────────────────────────────────────────────
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999,
    }}>
      <div style={{
        background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:'14px',
        padding:'28px 32px', width:'340px', textAlign:'center',
      }}>
        <p style={{ color:C.text, fontSize:'15px', margin:'0 0 24px', lineHeight:1.6 }}>{message}</p>
        <div style={{ display:'flex', gap:'10px', justifyContent:'center' }}>
          <button onClick={onCancel} style={btnStyle('ghost')}>取消</button>
          <button onClick={onConfirm} style={btnStyle('danger')}>確認刪除</button>
        </div>
      </div>
    </div>
  );
}

function btnStyle(type) {
  const base = {
    height:'36px', padding:'0 20px', borderRadius:'8px', fontSize:'13px',
    fontFamily:'"DM Sans","Noto Sans TC",sans-serif', cursor:'pointer', border:'none',
  };
  if (type === 'danger')  return { ...base, background:C.red,    color:'#fff' };
  if (type === 'ghost')   return { ...base, background:'transparent', border:`1px solid ${C.border}`, color:C.textSub };
  if (type === 'accent')  return { ...base, background:C.accent, color:'#fff' };
  if (type === 'success') return { ...base, background:C.green,  color:'#fff' };
  return base;
}

// ── 概覽頁 ────────────────────────────────────────────────────────
function OverviewTab() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    adminFetch('/stats').then(setStats).catch(() => {});
  }, []);

  if (!stats) return <Loading />;

  const todayCards = [
    { label: '今日新增會員', value: stats.todayUsers     ?? '—', color: C.accentText, sub: '24h 內' },
    { label: '今日新增問答', value: stats.todayQuestions ?? '—', color: C.green,      sub: '24h 內' },
    { label: '待處理檢舉',  value: stats.pendingReports ?? 0,   color: stats.pendingReports > 0 ? C.red : C.textSub, sub: 'pending' },
    { label: '成分庫產品數', value: stats.productCount,          color: C.yellow,     sub: '總計' },
  ];

  const totalCards = [
    { label: '總會員數', value: stats.userCount,     color: C.accentText },
    { label: '問答總數', value: stats.questionCount, color: C.green },
    { label: '收藏總數', value: stats.wishlistCount, color: C.yellow },
    { label: '產品總數', value: stats.productCount,  color: C.textSub },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
      {/* 今日 KPI */}
      <div>
        <p style={{ margin:'0 0 10px', fontSize:'11px', color:C.textDim, letterSpacing:'0.1em', textTransform:'uppercase' }}>今日狀況</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          {todayCards.map(c => (
            <div key={c.label} style={{ ...cardStyle, flexDirection:'column', alignItems:'flex-start', gap:'8px' }}>
              <p style={{ margin:0, fontSize:'30px', fontWeight:700, color:c.color,
                fontFamily:'"DM Sans",sans-serif', lineHeight:1 }}>{c.value}</p>
              <div>
                <p style={{ margin:0, fontSize:'13px', color:C.text }}>{c.label}</p>
                <p style={{ margin:'2px 0 0', fontSize:'11px', color:C.textDim }}>{c.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 累計總覽 */}
      <div>
        <p style={{ margin:'0 0 10px', fontSize:'11px', color:C.textDim, letterSpacing:'0.1em', textTransform:'uppercase' }}>累計數據</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'12px' }}>
          {totalCards.map(c => (
            <div key={c.label} style={cardStyle}>
              <div>
                <p style={{ margin:0, fontSize:'26px', fontWeight:700, color:c.color,
                  fontFamily:'"DM Sans",sans-serif', lineHeight:1 }}>{c.value}</p>
                <p style={{ margin:'4px 0 0', fontSize:'12px', color:C.textSub }}>{c.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 最新會員 */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>最新加入會員</h3>
        <table style={tableStyle}>
          <thead><tr>
            {['暱稱','學號','系所年級','膚質','狀態','加入時間'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {stats.newUsers.map(u => (
              <tr key={u.user_id} style={{ borderBottom:`1px solid ${C.border}` }}>
                <td style={tdStyle}><strong style={{ color:C.text }}>{u.nickname}</strong></td>
                <td style={tdStyle}>{u.student_id}</td>
                <td style={tdStyle}>{u.department_grade || '—'}</td>
                <td style={tdStyle}>
                  <span style={{ ...tagStyle, color:C.accentText, background:C.accentDim }}>
                    {SKIN_LABELS[u.skin_type] || u.skin_type || '未設定'}
                  </span>
                </td>
                <td style={tdStyle}>
                  {u.is_banned
                    ? <span style={{ ...tagStyle, color:C.red, background:'rgba(196,122,122,0.12)' }}>已停權</span>
                    : <span style={{ ...tagStyle, color:C.green, background:'rgba(123,175,123,0.12)' }}>正常</span>
                  }
                </td>
                <td style={tdStyle}>{fmtDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 停權 Modal ────────────────────────────────────────────────────
function BanModal({ user, onBan, onCancel }) {
  const [reason, setReason] = useState('');
  const [days,   setDays]   = useState('');
  const inputSt = {
    width:'100%', boxSizing:'border-box', padding:'9px 12px',
    background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px',
    color:C.text, fontSize:'13px', fontFamily:'"DM Sans","Noto Sans TC",sans-serif', outline:'none',
  };
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <div style={{ background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:'14px',
        padding:'28px 32px', width:'360px', display:'flex', flexDirection:'column', gap:'16px' }}>
        <h3 style={{ margin:0, fontSize:'16px', color:C.text }}>停權會員：{user.nickname}</h3>
        <div>
          <label style={{ fontSize:'11px', color:C.textDim, display:'block', marginBottom:'6px' }}>停權原因（必填）</label>
          <input style={inputSt} value={reason} onChange={e => setReason(e.target.value)} placeholder="請填入停權原因" />
        </div>
        <div>
          <label style={{ fontSize:'11px', color:C.textDim, display:'block', marginBottom:'6px' }}>停權天數（空白 = 永久）</label>
          <input style={inputSt} type="number" min="1" value={days} onChange={e => setDays(e.target.value)} placeholder="例：7、30、90" />
        </div>
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={btnStyle('ghost')}>取消</button>
          <button onClick={() => onBan({ reason, days: days ? parseInt(days) : null })}
            disabled={!reason.trim()} style={{ ...btnStyle('danger'), opacity: reason.trim() ? 1 : 0.5 }}>
            確認停權
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 會員管理頁 ────────────────────────────────────────────────────
function UsersTab() {
  const [users,    setUsers]    = useState([]);
  const [q,        setQ]        = useState('');
  const [del,      setDel]      = useState(null);
  const [banning,  setBanning]  = useState(null);

  const load = useCallback(() => {
    adminFetch(`/users?q=${encodeURIComponent(q)}`).then(d => { if (Array.isArray(d)) setUsers(d); });
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    await adminFetch(`/users/${del.user_id}`, { method:'DELETE' });
    setDel(null);
    load();
  };

  const handleBan = async ({ reason, days }) => {
    await adminFetch(`/users/${banning.user_id}/ban`, { method:'PATCH', body: { reason, days } });
    setBanning(null);
    load();
  };

  const handleUnban = async (u) => {
    await adminFetch(`/users/${u.user_id}/unban`, { method:'PATCH' });
    load();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <SearchBar value={q} onChange={setQ} placeholder="搜尋暱稱 / 學號 / Email" />
        <span style={{ fontSize:'13px', color:C.textSub }}>{users.length} 筆</span>
      </div>

      <div style={sectionStyle}>
        <table style={tableStyle}>
          <thead><tr>
            {['姓名','暱稱','學號','Email','系所年級','狀態','加入時間','操作'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {users.map(u => (
              <tr key={u.user_id}
                style={{ borderBottom:`1px solid ${C.border}`, transition:'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgRowHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={tdStyle}><strong style={{ color:C.text }}>{u.real_name || '—'}</strong></td>
                <td style={tdStyle}>{u.nickname}</td>
                <td style={tdStyle}>{u.student_id}</td>
                <td style={{ ...tdStyle, color:C.textSub, fontSize:'12px' }}>{u.email}</td>
                <td style={tdStyle}>{u.department_grade || '—'}</td>
                <td style={tdStyle}>
                  {u.is_banned
                    ? <span style={{ ...tagStyle, color:C.red, background:'rgba(196,122,122,0.12)' }}
                        title={u.ban_reason || ''}>已停權</span>
                    : <span style={{ ...tagStyle, color:C.green, background:'rgba(123,175,123,0.12)' }}>正常</span>
                  }
                </td>
                <td style={tdStyle}>{fmtDate(u.created_at)}</td>
                <td style={tdStyle}>
                  <div style={{ display:'flex', gap:'6px' }}>
                    {u.is_banned
                      ? <button onClick={() => handleUnban(u)} style={btnStyle('success')}>解除停權</button>
                      : <button onClick={() => setBanning(u)} style={btnStyle('ghost')}>停權</button>
                    }
                    <button onClick={() => setDel(u)} style={btnStyle('danger')}>刪除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <EmptyState text="沒有符合的會員" />}
      </div>

      {del && (
        <ConfirmModal
          message={`確定要刪除會員「${del.nickname}」？\n此操作將同時刪除其問答與收藏紀錄，且無法復原。`}
          onConfirm={handleDelete}
          onCancel={() => setDel(null)}
        />
      )}
      {banning && (
        <BanModal user={banning} onBan={handleBan} onCancel={() => setBanning(null)} />
      )}
    </div>
  );
}

// ── 產品管理頁 ────────────────────────────────────────────────────
const P_CAT_COLOR = {
  '保養品': { color:'#7BAF7B', bg:'rgba(123,175,123,0.13)' },
  '化妝品': { color:'#C47AA0', bg:'rgba(196,122,160,0.13)' },
};
const P_SUB_COLORS = ['#C4897A','#7BAF7B','#7AAFC4','#C4B07A','#9B7AC4','#C47A9B'];

const MAKEUP_ATTR_ITEMS = ['粉底液', '遮瑕'];
const FINISH_OPTIONS    = ['霧面', '自然', '光澤'];
const COVERAGE_OPTIONS  = ['輕薄', '中等', '全遮蓋'];

function EditProductModal({ product, meta, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:         product.name,
    brand:        product.brand,
    category:     product.category,
    sub_category: product.sub_category,
    finish:       product.finish   || '',
    coverage:     product.coverage || '',
  });
  const [rawText, setRawText] = useState(
    (product.raw_ingredients || []).join(', ')
  );
  const [saving, setSaving] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const isMakeupAttr = MAKEUP_ATTR_ITEMS.includes(form.sub_category);

  const handleSave = async () => {
    setSaving(true);
    const raw_ingredients = rawText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);
    const body = { ...form, raw_ingredients };
    if (!isMakeupAttr) { body.finish = null; body.coverage = null; }
    const res = await adminFetch(`/products/${product.product_id}`, {
      method: 'PATCH',
      body,
    });
    setSaving(false);
    if (res.product) onSave(res.product);
  };

  const inputSt = {
    width:'100%', boxSizing:'border-box', padding:'9px 12px',
    background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px',
    color:C.text, fontSize:'13px', fontFamily:'"DM Sans","Noto Sans TC",sans-serif',
    outline:'none',
  };
  const labelSt = { fontSize:'11px', color:C.textDim, letterSpacing:'0.06em',
    textTransform:'uppercase', marginBottom:'6px', display:'block' };

  return (
    <div style={{
      position:'fixed', inset:0, background:'rgba(0,0,0,0.65)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999,
    }}>
      <div style={{
        background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:'16px',
        padding:'32px', width:'480px', display:'flex', flexDirection:'column', gap:'20px',
      }}>
        <div>
          <h3 style={{ margin:0, fontSize:'17px', fontWeight:600, color:C.text }}>編輯產品</h3>
          <p style={{ margin:'4px 0 0', fontSize:'12px', color:C.textDim }}>#{product.product_id}</p>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={labelSt}>產品名稱</label>
            <input style={inputSt} value={form.name} onChange={set('name')} />
          </div>
          <div>
            <label style={labelSt}>品牌</label>
            <input style={inputSt} value={form.brand} onChange={set('brand')} />
          </div>
          <div>
            <label style={labelSt}>分類</label>
            <select style={inputSt} value={form.category} onChange={set('category')}>
              {(meta.categories || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>子分類</label>
            <select style={inputSt} value={form.sub_category} onChange={set('sub_category')}>
              {(meta.sub_categories || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          {isMakeupAttr && (
            <>
              <div>
                <label style={labelSt}>妝感</label>
                <select style={inputSt} value={form.finish} onChange={set('finish')}>
                  <option value="">-- 未設定 --</option>
                  {FINISH_OPTIONS.map(f => <option key={f} value={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label style={labelSt}>遮蓋度</label>
                <select style={inputSt} value={form.coverage} onChange={set('coverage')}>
                  <option value="">-- 未設定 --</option>
                  {COVERAGE_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </>
          )}
          <div style={{ gridColumn:'1/-1' }}>
            <label style={labelSt}>完整成分清單（逗號分隔）</label>
            <textarea
              style={{ ...inputSt, resize:'vertical', minHeight:'80px', lineHeight:1.6 }}
              value={rawText}
              onChange={e => setRawText(e.target.value)}
              placeholder="Water, Glycerin, Niacinamide, ..."
            />
            <p style={{ margin:'4px 0 0', fontSize:'11px', color:C.textDim }}>
              用逗號分隔每個成分，儲存後自動轉為清單
            </p>
          </div>
        </div>

        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={btnStyle('ghost')}>取消</button>
          <button onClick={handleSave} disabled={saving}
            style={{ ...btnStyle('accent'), opacity: saving ? 0.6 : 1 }}>
            {saving ? '儲存中…' : '儲存'}
          </button>
        </div>
      </div>
    </div>
  );
}

function FilterChip({ label, count, active, onClick, color }) {
  return (
    <button onClick={onClick} style={{
      display:'inline-flex', alignItems:'center', gap:'5px',
      padding:'5px 13px', borderRadius:'999px', border:'none', cursor:'pointer',
      fontFamily:'"DM Sans","Noto Sans TC",sans-serif', fontSize:'12px', fontWeight:500,
      background: active ? (color || C.accent) : C.bgCard,
      color:      active ? '#fff'               : C.textSub,
      transition:'all 150ms',
    }}>
      {label}
      {count !== undefined && (
        <span style={{
          background: active ? 'rgba(255,255,255,0.25)' : C.bgPanel,
          color:       active ? '#fff' : C.textDim,
          borderRadius:'999px', padding:'0 6px', fontSize:'10px', fontWeight:600,
        }}>{count}</span>
      )}
    </button>
  );
}

function AddProductModal({ meta, onAdd, onCancel }) {
  const [form, setForm] = useState({ name:'', brand:'', category: meta.categories[0] || '', sub_category: meta.sub_categories[0] || '' });
  const [saving, setSaving] = useState(false);
  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));
  const inputSt = { width:'100%', boxSizing:'border-box', padding:'9px 12px',
    background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px',
    color:C.text, fontSize:'13px', fontFamily:'"DM Sans","Noto Sans TC",sans-serif', outline:'none' };
  const labelSt = { fontSize:'11px', color:C.textDim, letterSpacing:'0.06em', textTransform:'uppercase', marginBottom:'6px', display:'block' };

  const handleAdd = async () => {
    if (!form.name.trim() || !form.brand.trim()) return;
    setSaving(true);
    const res = await adminFetch('/products', { method:'POST', body: form });
    setSaving(false);
    if (res.product) onAdd(res.product);
  };

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.65)',
      display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
      <div style={{ background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:'16px',
        padding:'32px', width:'480px', display:'flex', flexDirection:'column', gap:'20px' }}>
        <h3 style={{ margin:0, fontSize:'17px', fontWeight:600, color:C.text }}>新增產品</h3>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={labelSt}>產品名稱</label>
            <input style={inputSt} value={form.name} onChange={set('name')} placeholder="請輸入產品名稱" />
          </div>
          <div>
            <label style={labelSt}>品牌</label>
            <input style={inputSt} value={form.brand} onChange={set('brand')} placeholder="請輸入品牌名稱" />
          </div>
          <div>
            <label style={labelSt}>分類</label>
            <select style={inputSt} value={form.category} onChange={set('category')}>
              {(meta.categories || []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={labelSt}>子分類</label>
            <select style={inputSt} value={form.sub_category} onChange={set('sub_category')}>
              {(meta.sub_categories || []).map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
        <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
          <button onClick={onCancel} style={btnStyle('ghost')}>取消</button>
          <button onClick={handleAdd} disabled={saving || !form.name.trim() || !form.brand.trim()}
            style={{ ...btnStyle('accent'), opacity: saving || !form.name.trim() || !form.brand.trim() ? 0.5 : 1 }}>
            {saving ? '新增中…' : '新增'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductsTab() {
  const [all,       setAll]      = useState([]);
  const [q,         setQ]        = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [subFilter, setSubFilter] = useState('');
  const [del,       setDel]      = useState(null);
  const [editing,   setEditing]  = useState(null);
  const [adding,    setAdding]   = useState(false);
  const [meta,      setMeta]     = useState({ categories:[], sub_categories:[] });

  // 一次載入全部，之後只做 client-side 篩選
  useEffect(() => {
    adminFetch('/products?q=').then(d => { if (Array.isArray(d)) setAll(d); });
    adminFetch('/products/meta').then(d => { if (d.categories) setMeta(d); });
  }, []);

  const handleDelete = async () => {
    await adminFetch(`/products/${del.product_id}`, { method:'DELETE' });
    setAll(prev => prev.filter(p => p.product_id !== del.product_id));
    setDel(null);
  };

  const handleSave = (updated) => {
    setAll(prev => prev.map(p => p.product_id === updated.product_id ? { ...p, ...updated } : p));
    setEditing(null);
  };

  const handleAdd = (newProduct) => {
    setAll(prev => [newProduct, ...prev]);
    setAdding(false);
  };

  // client-side 篩選
  const filtered = all.filter(p => {
    const qLow = q.toLowerCase();
    const matchQ = !q || p.name.toLowerCase().includes(qLow) ||
      p.brand.toLowerCase().includes(qLow) || p.category.includes(q) || p.sub_category.includes(q);
    const matchCat = !catFilter || p.category === catFilter;
    const matchSub = !subFilter || p.sub_category === subFilter;
    return matchQ && matchCat && matchSub;
  });

  // 各 tag 的數量（基於搜尋後）
  const qFiltered = all.filter(p => {
    const qLow = q.toLowerCase();
    return !q || p.name.toLowerCase().includes(qLow) || p.brand.toLowerCase().includes(qLow);
  });
  const catCounts = {};
  const subCounts = {};
  qFiltered.forEach(p => {
    catCounts[p.category] = (catCounts[p.category] || 0) + 1;
    subCounts[p.sub_category] = (subCounts[p.sub_category] || 0) + 1;
  });

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
      {/* 搜尋列 */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <SearchBar value={q} onChange={v => { setQ(v); setCatFilter(''); setSubFilter(''); }}
          placeholder="搜尋名稱 / 品牌" />
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'13px', color:C.textSub }}>顯示 {filtered.length} / {all.length} 筆</span>
          <button onClick={() => setAdding(true)} style={btnStyle('accent')}>＋ 新增產品</button>
        </div>
      </div>

      {/* 標籤篩選 */}
      <div style={{
        background:C.bgPanel, border:`1px solid ${C.border}`,
        borderRadius:'12px', padding:'14px 16px',
        display:'flex', flexDirection:'column', gap:'10px',
      }}>
        {/* 分類 */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'11px', color:C.textDim, letterSpacing:'0.06em',
            textTransform:'uppercase', minWidth:'40px' }}>分類</span>
          <FilterChip label="全部" count={qFiltered.length}
            active={!catFilter} onClick={() => { setCatFilter(''); setSubFilter(''); }} />
          {meta.categories.map((cat, i) => (
            <FilterChip key={cat} label={cat} count={catCounts[cat] || 0}
              active={catFilter === cat} color={Object.values(P_CAT_COLOR)[i]?.color}
              onClick={() => { setCatFilter(cat === catFilter ? '' : cat); setSubFilter(''); }} />
          ))}
        </div>

        {/* 子分類 */}
        <div style={{ display:'flex', alignItems:'center', gap:'8px', flexWrap:'wrap' }}>
          <span style={{ fontSize:'11px', color:C.textDim, letterSpacing:'0.06em',
            textTransform:'uppercase', minWidth:'40px' }}>子類</span>
          <FilterChip label="全部"
            active={!subFilter} onClick={() => setSubFilter('')} />
          {meta.sub_categories
            .filter(s => !catFilter || (subCounts[s] > 0))
            .map((sub, i) => (
            <FilterChip key={sub} label={sub} count={subCounts[sub] || 0}
              active={subFilter === sub} color={P_SUB_COLORS[i % P_SUB_COLORS.length]}
              onClick={() => setSubFilter(sub === subFilter ? '' : sub)} />
          ))}
        </div>
      </div>

      {/* 表格 */}
      <div style={sectionStyle}>
        <table style={tableStyle}>
          <thead><tr>
            {['名稱','品牌','分類','子分類','加入時間','操作'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {filtered.map(p => {
              const cc = P_CAT_COLOR[p.category] || { color:C.textSub, bg:C.bgCard };
              const si = meta.sub_categories.indexOf(p.sub_category);
              const sc = P_SUB_COLORS[si % P_SUB_COLORS.length];
              return (
                <tr key={p.product_id}
                  style={{ borderBottom:`1px solid ${C.border}`, transition:'background 150ms' }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bgRowHover}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ ...tdStyle, maxWidth:'200px', overflow:'hidden',
                    textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                    <strong style={{ color:C.text }}>{p.name}</strong>
                  </td>
                  <td style={tdStyle}>{p.brand}</td>
                  <td style={tdStyle}>
                    <span style={{ ...tagStyle, color:cc.color, background:cc.bg }}>{p.category}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ ...tagStyle, color:sc, background:`${sc}18` }}>{p.sub_category}</span>
                  </td>
                  <td style={tdStyle}>{fmtDate(p.created_at)}</td>
                  <td style={tdStyle}>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={() => setEditing(p)} style={btnStyle('accent')}>編輯</button>
                      <button onClick={() => setDel(p)} style={btnStyle('danger')}>刪除</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && <EmptyState text="沒有符合的產品" />}
      </div>

      {del && (
        <ConfirmModal
          message={`確定要刪除產品「${del.name}」？\n此操作無法復原。`}
          onConfirm={handleDelete}
          onCancel={() => setDel(null)}
        />
      )}
      {editing && (
        <EditProductModal product={editing} meta={meta} onSave={handleSave} onCancel={() => setEditing(null)} />
      )}
      {adding && (
        <AddProductModal meta={meta} onAdd={handleAdd} onCancel={() => setAdding(false)} />
      )}
    </div>
  );
}

// ── 行銷數據頁 ────────────────────────────────────────────────────
const SKIN_LABELS_FULL = {
  oily:       '油性肌', dry:        '乾性肌', combo:      '混合肌（均衡）',
  combo_dry:  '混合肌（偏乾）', combo_oily: '混合肌（偏油）',
  normal:     '中性肌', sensitive:  '敏感肌', unknown:    '未設定',
};
const SKIN_COLORS = {
  oily:'#C4B07A', dry:'#7AAFC4', combo:'#C4897A', combo_dry:'#9B7AC4',
  combo_oily:'#C47A9B', normal:'#7BAF7B', sensitive:'#C47A7A', unknown:C.textDim,
};
const CAT_COLORS_A = ['#C4897A','#7BAF7B','#7AAFC4','#C4B07A','#9B7AC4','#C47A9B','#C47A7A','#7AC4C0'];

function HBar({ label, value, max, color, suffix = '' }) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
      <div style={{ width:'100px', fontSize:'12px', color:C.textSub, flexShrink:0,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
      <div style={{ flex:1, background:C.bgCard, borderRadius:'4px', height:'6px', overflow:'hidden' }}>
        <div style={{
          width:`${pct}%`, height:'100%', borderRadius:'4px',
          background:`linear-gradient(90deg, ${color}cc, ${color})`,
          transition:'width 700ms cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
      <div style={{ width:'36px', fontSize:'12px', color, fontWeight:600, textAlign:'right', flexShrink:0 }}>
        {value}{suffix}
      </div>
    </div>
  );
}

function WeeklyBar({ data, color, label, total }) {
  const max = Math.max(...data.map(d => d.count), 1);
  const CHART_H = 160;
  return (
    <div style={{ ...sectionStyle, padding:'20px 24px 16px' }}>
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:'20px' }}>
        <div>
          <p style={{ margin:0, fontSize:'11px', color:C.textDim, letterSpacing:'0.08em', textTransform:'uppercase' }}>{label}</p>
          {total != null && (
            <p style={{ margin:'4px 0 0', fontSize:'28px', fontWeight:700, color, fontFamily:'"DM Sans",sans-serif', lineHeight:1 }}>{total}</p>
          )}
        </div>
        <span style={{ fontSize:'11px', color:C.textDim, marginTop:'2px' }}>近 12 週</span>
      </div>
      {data.length === 0 ? (
        <p style={{ color:C.textDim, fontSize:'13px', margin:0, textAlign:'center', padding:'20px 0' }}>尚無足夠資料</p>
      ) : (
        <div style={{ position:'relative' }}>
          {/* 格線 */}
          {[0.25, 0.5, 0.75, 1].map(r => (
            <div key={r} style={{
              position:'absolute', left:0, right:0,
              bottom: `${r * CHART_H}px`,
              borderTop: `1px dashed ${C.border}`,
              pointerEvents:'none',
            }} />
          ))}
          <div style={{ display:'flex', alignItems:'flex-end', gap:'4px', height:`${CHART_H}px`, position:'relative' }}>
            {data.map((d, i) => {
              const h = Math.max(Math.round((d.count / max) * CHART_H), 3);
              const isLast = i === data.length - 1;
              return (
                <div key={i} title={`${d.week}: ${d.count}`}
                  style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'flex-end', height:'100%' }}>
                  <div style={{
                    width:'100%', height:`${h}px`,
                    borderRadius:'3px 3px 0 0',
                    background: isLast
                      ? `linear-gradient(180deg, ${color}, ${color}99)`
                      : `${color}55`,
                    transition:'height 600ms cubic-bezier(0.16,1,0.3,1)',
                    position:'relative',
                  }}>
                    {isLast && d.count > 0 && (
                      <span style={{
                        position:'absolute', top:'-18px', left:'50%', transform:'translateX(-50%)',
                        fontSize:'10px', fontWeight:700, color, whiteSpace:'nowrap',
                      }}>{d.count}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          {/* X 軸標籤（只顯示首尾）*/}
          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'6px' }}>
            <span style={{ fontSize:'10px', color:C.textDim }}>{data[0]?.week}</span>
            <span style={{ fontSize:'10px', color:C.textDim }}>{data[data.length-1]?.week}</span>
          </div>
        </div>
      )}
    </div>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminFetch('/analytics').then(setData).catch(() => {});
  }, []);

  if (!data) return <Loading />;

  const skinMax  = Math.max(...data.skinDist.map(d => d.count), 1);
  const subMax   = Math.max(...data.subCatDist.map(d => d.count), 1);
  const tagMax   = Math.max(...data.tagDist.map(d => d.count), 1);
  const catTotal = data.categoryDist.reduce((s, d) => s + d.count, 0);
  const totalUsers     = data.weeklyUsers.reduce((s, d) => s + d.count, 0);
  const totalQuestions = data.weeklyQuestions.reduce((s, d) => s + d.count, 0);

  const SectionHeader = ({ title }) => (
    <div style={{ padding:'20px 24px 0', marginBottom:'16px' }}>
      <p style={{ margin:0, fontSize:'13px', fontWeight:600, color:C.text,
        fontFamily:'"DM Sans","Noto Sans TC",sans-serif' }}>{title}</p>
    </div>
  );

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>

      {/* 成長趨勢 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <WeeklyBar data={data.weeklyUsers}     color={C.accentText} label="會員成長" total={totalUsers} />
        <WeeklyBar data={data.weeklyQuestions} color={C.green}      label="問答成長" total={totalQuestions} />
      </div>

      {/* 膚質 + 熱門收藏 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

        {/* 膚質分佈 */}
        <div style={sectionStyle}>
          <SectionHeader title="膚質分佈" />
          <div style={{ padding:'0 24px 20px' }}>
            {data.skinDist.length === 0
              ? <p style={{ color:C.textDim, fontSize:'13px', margin:0 }}>尚無資料</p>
              : data.skinDist.map(d => (
                <HBar key={d.key}
                  label={SKIN_LABELS_FULL[d.key] || d.key}
                  value={d.count} max={skinMax}
                  color={SKIN_COLORS[d.key] || C.accent}
                />
              ))
            }
          </div>
        </div>

        {/* 熱門收藏 */}
        <div style={sectionStyle}>
          <SectionHeader title="熱門收藏 Top 8" />
          <div style={{ padding:'0 24px 20px' }}>
            {data.topWishlist.length === 0
              ? <p style={{ color:C.textDim, fontSize:'13px', margin:0 }}>尚無資料</p>
              : data.topWishlist.map((p, i) => (
                <div key={i} style={{
                  display:'flex', alignItems:'center', gap:'12px',
                  padding:'9px 0',
                  borderBottom: i < data.topWishlist.length - 1 ? `1px solid ${C.border}` : 'none',
                }}>
                  <span style={{
                    width:'22px', height:'22px', borderRadius:'6px', flexShrink:0,
                    background: i === 0 ? '#C4897A' : i === 1 ? '#A89990' : i === 2 ? '#B8966A' : C.bgCard,
                    display:'flex', alignItems:'center', justifyContent:'center',
                    fontSize:'11px', fontWeight:700,
                    color: i < 3 ? '#fff' : C.textDim,
                  }}>{i + 1}</span>
                  <div style={{ flex:1, minWidth:0 }}>
                    <p style={{ margin:0, fontSize:'13px', color:C.text, fontWeight:500,
                      overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                    <p style={{ margin:'1px 0 0', fontSize:'11px', color:C.textSub }}>{p.brand}</p>
                  </div>
                  <div style={{ flexShrink:0, textAlign:'right' }}>
                    <span style={{ fontSize:'15px', fontWeight:700, color: p.wishlist_count > 0 ? C.accentText : C.textDim,
                      fontFamily:'"DM Sans",sans-serif' }}>{p.wishlist_count}</span>
                    <p style={{ margin:'1px 0 0', fontSize:'10px', color:C.textDim }}>收藏</p>
                  </div>
                </div>
              ))
            }
          </div>
        </div>
      </div>

      {/* 產品分類 + 標籤 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>

        {/* 產品分類 */}
        <div style={sectionStyle}>
          <SectionHeader title="產品分類" />
          <div style={{ padding:'0 24px 20px' }}>
            {data.categoryDist.map((d, i) => {
              const pct = catTotal > 0 ? Math.round((d.count / catTotal) * 100) : 0;
              return (
                <div key={d.category} style={{ marginBottom:'14px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'5px' }}>
                    <span style={{ fontSize:'13px', color:C.text, fontWeight:500 }}>{d.category}</span>
                    <span style={{ fontSize:'12px', color:CAT_COLORS_A[i], fontWeight:600,
                      fontFamily:'"DM Sans",sans-serif' }}>{pct}% · {d.count} 件</span>
                  </div>
                  <div style={{ background:C.bgCard, borderRadius:'4px', height:'6px', overflow:'hidden' }}>
                    <div style={{
                      width:`${pct}%`, height:'100%', borderRadius:'4px',
                      background:`linear-gradient(90deg,${CAT_COLORS_A[i]}99,${CAT_COLORS_A[i]})`,
                      transition:'width 700ms cubic-bezier(0.16,1,0.3,1)',
                    }} />
                  </div>
                </div>
              );
            })}
            <div style={{ borderTop:`1px solid ${C.border}`, marginTop:'16px', paddingTop:'16px' }}>
              <p style={{ margin:'0 0 12px', fontSize:'11px', color:C.textDim, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                子分類 Top 8
              </p>
              {data.subCatDist.map((d, i) => (
                <HBar key={d.sub_category}
                  label={d.sub_category} value={d.count} max={subMax}
                  color={CAT_COLORS_A[i % CAT_COLORS_A.length]}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 熱門標籤 */}
        <div style={sectionStyle}>
          <SectionHeader title="問答熱門標籤" />
          <div style={{ padding:'0 24px 20px' }}>
            {data.tagDist.length === 0
              ? <p style={{ color:C.textDim, fontSize:'13px', margin:0 }}>尚無資料</p>
              : (
                <>
                  {data.tagDist.map((d, i) => (
                    <HBar key={d.tag}
                      label={`#${d.tag}`} value={d.count} max={tagMax}
                      color={CAT_COLORS_A[i % CAT_COLORS_A.length]}
                      suffix=" 題"
                    />
                  ))}
                  <div style={{ marginTop:'20px', display:'flex', flexWrap:'wrap', gap:'6px' }}>
                    {data.tagDist.map((d, i) => (
                      <span key={d.tag} style={{
                        padding:'4px 12px', borderRadius:'6px',
                        background:`${CAT_COLORS_A[i % CAT_COLORS_A.length]}12`,
                        border:`1px solid ${CAT_COLORS_A[i % CAT_COLORS_A.length]}30`,
                        color:CAT_COLORS_A[i % CAT_COLORS_A.length],
                        fontSize:'12px', fontWeight:500,
                        fontFamily:'"DM Sans","Noto Sans TC",sans-serif',
                      }}>
                        #{d.tag} <span style={{ opacity:0.6 }}>·</span> {d.count}
                      </span>
                    ))}
                  </div>
                </>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

// ── 成分管理頁 ────────────────────────────────────────────────────
const SCORE_COLS = [
  { key:'skin_oily', label:'油性' }, { key:'skin_dry', label:'乾性' },
  { key:'skin_sensitive', label:'敏感' }, { key:'skin_normal', label:'中性' },
  { key:'skin_combo', label:'混合' },
];

function IngredientsTab() {
  const [ingredients, setIngredients] = useState([]);
  const [q, setQ] = useState('');

  const load = useCallback(() => {
    adminFetch(`/ingredients?q=${encodeURIComponent(q)}`).then(d => { if (Array.isArray(d)) setIngredients(d); });
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const scoreColor = (v) => {
    if (v == null) return C.textDim;
    if (v >= 3) return C.green;
    if (v >= 1) return C.yellow;
    return C.red;
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <SearchBar value={q} onChange={setQ} placeholder="搜尋成分名稱" />
        <span style={{ fontSize:'13px', color:C.textSub }}>{ingredients.length} 筆</span>
      </div>
      <div style={sectionStyle}>
        <table style={tableStyle}>
          <thead><tr>
            {['成分名稱', '油性', '乾性', '敏感', '中性', '混合'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {ingredients.map(ing => (
              <tr key={ing.ingredient_id}
                style={{ borderBottom:`1px solid ${C.border}`, transition:'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgRowHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...tdStyle, color:C.text, fontWeight:500 }}>{ing.name}</td>
                {SCORE_COLS.map(col => (
                  <td key={col.key} style={{ ...tdStyle, textAlign:'center' }}>
                    <span style={{ color: scoreColor(ing[col.key]), fontWeight:600, fontSize:'13px' }}>
                      {ing[col.key] ?? '—'}
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {ingredients.length === 0 && <EmptyState text="沒有符合的成分" />}
      </div>
    </div>
  );
}

// ── 貼文審核頁 ────────────────────────────────────────────────────
function PostsTab() {
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{
        ...sectionStyle, padding:'60px 40px', textAlign:'center',
        display:'flex', flexDirection:'column', alignItems:'center', gap:'16px',
      }}>
        <div style={{ fontSize:'40px', opacity:0.3 }}>◫</div>
        <p style={{ margin:0, fontSize:'15px', color:C.text, fontWeight:500 }}>社群貼文審核</p>
        <p style={{ margin:0, fontSize:'13px', color:C.textSub, maxWidth:'360px', lineHeight:1.6 }}>
          Community 社群功能目前使用模擬資料。<br />
          待社群貼文正式儲存至資料庫後，此頁面將顯示貼文列表、下架與恢復操作。
        </p>
        <span style={{ ...tagStyle, color:C.yellow, background:'rgba(196,176,122,0.12)',
          fontSize:'11px', letterSpacing:'0.08em' }}>COMING SOON — v2</span>
      </div>
    </div>
  );
}

// ── 檢舉管理頁 ────────────────────────────────────────────────────
const REPORT_STATUS = {
  pending:    { label:'待處理', color: C.yellow },
  reviewing:  { label:'審核中', color: C.accentText },
  resolved:   { label:'已成立', color: C.green },
  dismissed:  { label:'不成立', color: C.textDim },
};

function ReportsTab() {
  const [reports,   setReports]   = useState([]);
  const [filter,    setFilter]    = useState('pending');
  const [resolving, setResolving] = useState(null); // { report, action: 'resolve'|'dismiss' }
  const [note,      setNote]      = useState('');

  const load = useCallback(() => {
    adminFetch(`/reports?status=${filter}`).then(d => { if (Array.isArray(d)) setReports(d); });
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  const handleAction = async () => {
    const path = resolving.action === 'resolve' ? 'resolve' : 'dismiss';
    await adminFetch(`/reports/${resolving.report.report_id}/${path}`, {
      method:'PATCH', body: { admin_note: note },
    });
    setResolving(null);
    setNote('');
    load();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{ display:'flex', gap:'8px' }}>
        {['pending','reviewing','resolved','dismissed'].map(s => (
          <FilterChip key={s} label={REPORT_STATUS[s].label} active={filter === s}
            color={REPORT_STATUS[s].color} onClick={() => setFilter(s)} />
        ))}
      </div>

      {reports.length === 0 ? (
        <div style={{ ...sectionStyle, padding:'60px 40px', textAlign:'center' }}>
          <p style={{ margin:0, color:C.textDim, fontSize:'13px' }}>
            {filter === 'pending' ? '目前沒有待處理的檢舉（或 reports 資料表尚未建立）' : '沒有符合的紀錄'}
          </p>
        </div>
      ) : (
        <div style={sectionStyle}>
          <table style={tableStyle}>
            <thead><tr>
              {['類型','內容預覽','原因','檢舉人','狀態','時間','操作'].map(h => (
                <th key={h} style={thStyle}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {reports.map(r => {
                const st = REPORT_STATUS[r.status] || REPORT_STATUS.pending;
                const preview = r.preview_text || `#${r.target_id}`;
                return (
                  <tr key={r.report_id}
                    style={{ borderBottom:`1px solid ${C.border}`, transition:'background 150ms' }}
                    onMouseEnter={e => e.currentTarget.style.background = C.bgRowHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <td style={tdStyle}><span style={{ ...tagStyle, color:C.accentText, background:C.accentDim }}>{r.target_type}</span></td>
                    <td style={{ ...tdStyle, maxWidth:'220px', color:C.text }}>
                      <span title={preview} style={{ display:'block', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {preview}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, maxWidth:'160px' }}>
                      <div>{r.reason}</div>
                      {r.description && (
                        <div style={{ fontSize:'11px', color:C.textDim, marginTop:'2px', wordBreak:'break-all' }}>
                          {r.description}
                        </div>
                      )}
                    </td>
                    <td style={tdStyle}>{r.reporter_name || '匿名'}</td>
                    <td style={tdStyle}><span style={{ ...tagStyle, color:st.color, background:`${st.color}18` }}>{st.label}</span></td>
                    <td style={tdStyle}>{fmtDate(r.created_at)}</td>
                    <td style={tdStyle}>
                      {r.status === 'pending' || r.status === 'reviewing' ? (
                        <div style={{ display:'flex', gap:'6px' }}>
                          <button onClick={() => { setResolving({ report:r, action:'resolve' }); setNote(''); }}
                            style={btnStyle('danger')}>成立</button>
                          <button onClick={() => { setResolving({ report:r, action:'dismiss' }); setNote(''); }}
                            style={btnStyle('ghost')}>不成立</button>
                        </div>
                      ) : (
                        <span style={{ fontSize:'12px', color:C.textDim }}>{r.admin_note || '—'}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {resolving && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)',
          display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999 }}>
          <div style={{ background:C.bgPanel, border:`1px solid ${C.border}`, borderRadius:'14px',
            padding:'28px 32px', width:'440px', display:'flex', flexDirection:'column', gap:'16px' }}>
            <h3 style={{ margin:0, fontSize:'16px', color:C.text }}>
              {resolving.action === 'resolve' ? '確認成立檢舉' : '關閉檢舉（不成立）'}
            </h3>
            {resolving.action === 'resolve' && (
              <p style={{ margin:0, fontSize:'12px', padding:'8px 12px', borderRadius:'6px',
                background:'rgba(185,112,112,0.1)', color:'#B97070', lineHeight:1.6 }}>
                ⚠️ 成立後將自動刪除被檢舉的
                {resolving.report.target_type === 'question' ? '問題及其所有回覆' : '社群回覆'}，此操作不可還原。
              </p>
            )}

            {/* 案件摘要 */}
            <div style={{ background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px', padding:'12px 14px',
              display:'flex', flexDirection:'column', gap:'6px' }}>
              <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
                <span style={{ ...tagStyle, color:C.accentText, background:C.accentDim, flexShrink:0 }}>
                  {resolving.report.target_type}
                </span>
                <span style={{ fontSize:'12px', color:C.textDim }}>原因：{resolving.report.reason}</span>
                <span style={{ fontSize:'12px', color:C.textDim, marginLeft:'auto' }}>
                  by {resolving.report.reporter_name || '匿名'}
                </span>
              </div>
              {resolving.report.preview_text && (
                <p style={{ margin:0, fontSize:'13px', color:C.text, lineHeight:1.6,
                  borderTop:`1px solid ${C.border}`, paddingTop:'8px', wordBreak:'break-all' }}>
                  {resolving.report.preview_text}
                </p>
              )}
              {resolving.report.description && (
                <p style={{ margin:0, fontSize:'12px', color:C.textDim, fontStyle:'italic', wordBreak:'break-all' }}>
                  補充：{resolving.report.description}
                </p>
              )}
            </div>

            <textarea
              value={note} onChange={e => setNote(e.target.value)}
              placeholder="處理備註（選填）"
              style={{ width:'100%', boxSizing:'border-box', padding:'9px 12px', minHeight:'70px',
                background:C.bgCard, border:`1px solid ${C.border}`, borderRadius:'8px',
                color:C.text, fontSize:'13px', fontFamily:'"DM Sans","Noto Sans TC",sans-serif',
                outline:'none', resize:'vertical' }}
            />
            <div style={{ display:'flex', gap:'10px', justifyContent:'flex-end' }}>
              <button onClick={() => setResolving(null)} style={btnStyle('ghost')}>取消</button>
              <button onClick={handleAction}
                style={btnStyle(resolving.action === 'resolve' ? 'danger' : 'accent')}>
                確認
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── 問答管理頁 ────────────────────────────────────────────────────
function QuestionsTab() {
  const [questions, setQuestions] = useState([]);
  const [q,         setQ]         = useState('');
  const [del,       setDel]       = useState(null);

  const load = useCallback(() => {
    adminFetch(`/questions?q=${encodeURIComponent(q)}`).then(d => { if (Array.isArray(d)) setQuestions(d); });
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const toggleSolved = async (item) => {
    await adminFetch(`/questions/${item.question_id}`, {
      method: 'PATCH', body: { solved: !item.solved },
    });
    load();
  };

  const handleDelete = async () => {
    await adminFetch(`/questions/${del.question_id}`, { method:'DELETE' });
    setDel(null);
    load();
  };

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'20px' }}>
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <SearchBar value={q} onChange={setQ} placeholder="搜尋標題 / 發問者" />
        <span style={{ fontSize:'13px', color:C.textSub }}>{questions.length} 筆</span>
      </div>

      <div style={sectionStyle}>
        <table style={tableStyle}>
          <thead><tr>
            {['標題','發問者','標籤','狀態','瀏覽','發問時間','操作'].map(h => (
              <th key={h} style={thStyle}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {questions.map(item => (
              <tr key={item.question_id}
                style={{ borderBottom:`1px solid ${C.border}`, transition:'background 150ms' }}
                onMouseEnter={e => e.currentTarget.style.background = C.bgRowHover}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ ...tdStyle, maxWidth:'220px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  <strong style={{ color:C.text }}>{item.title}</strong>
                </td>
                <td style={tdStyle}>{item.nickname || '—'}</td>
                <td style={tdStyle}>
                  <div style={{ display:'flex', gap:'4px', flexWrap:'wrap' }}>
                    {(item.tags || []).slice(0,2).map(tag => (
                      <span key={tag} style={{ ...tagStyle, fontSize:'11px', color:C.textSub, background:C.bgCard }}>
                        #{tag}
                      </span>
                    ))}
                  </div>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    ...tagStyle,
                    color:    item.solved ? C.green  : C.yellow,
                    background: item.solved ? 'rgba(123,175,123,0.12)' : 'rgba(196,176,122,0.12)',
                  }}>
                    {item.solved ? '已解決' : '未解決'}
                  </span>
                </td>
                <td style={{ ...tdStyle, color:C.textSub }}>{item.views}</td>
                <td style={tdStyle}>{fmtDate(item.created_at)}</td>
                <td style={tdStyle}>
                  <div style={{ display:'flex', gap:'6px' }}>
                    <button
                      onClick={() => toggleSolved(item)}
                      style={btnStyle(item.solved ? 'ghost' : 'success')}
                    >
                      {item.solved ? '標為未解決' : '標為已解決'}
                    </button>
                    <button onClick={() => setDel(item)} style={btnStyle('danger')}>刪除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {questions.length === 0 && <EmptyState text="沒有符合的問答" />}
      </div>

      {del && (
        <ConfirmModal
          message={`確定要刪除問答「${del.title}」？\n此操作無法復原。`}
          onConfirm={handleDelete}
          onCancel={() => setDel(null)}
        />
      )}
    </div>
  );
}

// ── 小元件 ────────────────────────────────────────────────────────
function Loading() {
  return (
    <div style={{ textAlign:'center', padding:'60px 0', color:C.textSub, fontSize:'14px' }}>
      載入中…
    </div>
  );
}

function EmptyState({ text }) {
  return (
    <div style={{ textAlign:'center', padding:'48px 0', color:C.textDim, fontSize:'13px' }}>
      {text}
    </div>
  );
}

// ── 共用樣式 ──────────────────────────────────────────────────────
const cardStyle = {
  background: C.bgCard, border: `1px solid ${C.border}`,
  borderRadius: '12px', padding: '20px 24px',
  display: 'flex', alignItems: 'center', gap: '16px',
};
const sectionStyle = {
  background: C.bgPanel, border: `1px solid ${C.border}`,
  borderRadius: '12px', overflow: 'hidden',
};
const sectionTitle = {
  margin: '0 0 16px', fontSize: '14px', fontWeight: 600,
  color: C.text, fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
  padding: '20px 20px 0',
};
const tableStyle = { width: '100%', borderCollapse: 'collapse' };
const thStyle = {
  textAlign: 'left', padding: '10px 16px',
  fontSize: '11px', fontWeight: 600, letterSpacing: '0.06em',
  color: C.textDim, textTransform: 'uppercase',
  borderBottom: `1px solid ${C.border}`,
  fontFamily: '"DM Sans",sans-serif',
  background: C.bgCard,
  whiteSpace: 'nowrap',
};
const tdStyle = {
  padding: '12px 16px', fontSize: '13px',
  color: C.textSub, fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
  verticalAlign: 'middle',
};
const tagStyle = {
  display: 'inline-block', padding: '2px 10px',
  borderRadius: '999px', fontSize: '12px', fontWeight: 500,
  fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
};

// ── 登入畫面 ──────────────────────────────────────────────────────
function AdminLogin({ onSuccess }) {
  const [pw, setPw]     = useState('');
  const [err, setErr]   = useState('');

  const handleLogin = () => {
    if (pw === ADMIN_KEY) { onSuccess(); }
    else { setErr('密碼錯誤'); }
  };

  return (
    <div style={{
      minHeight: '100vh', background: C.bg,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: C.bgPanel, border: `1px solid ${C.border}`,
        borderRadius: '16px', padding: '48px 40px', width: '340px', textAlign: 'center',
      }}>
        <p style={{ margin:'0 0 4px', fontFamily:'"Cormorant Garamond",serif',
          fontSize:'36px', fontWeight:300, letterSpacing:'0.18em', color:C.text }}>GL&#332;W</p>
        <p style={{ margin:'0 0 32px', fontSize:'11px', letterSpacing:'0.2em',
          color:C.accent, fontFamily:'"DM Sans",sans-serif', fontWeight:500 }}>ADMIN PANEL</p>
        <input
          type="password"
          value={pw}
          onChange={e => { setPw(e.target.value); setErr(''); }}
          onKeyDown={e => e.key === 'Enter' && handleLogin()}
          placeholder="管理員密碼"
          style={{
            width: '100%', boxSizing:'border-box',
            padding: '12px 16px', borderRadius:'10px',
            background: C.bgCard, border:`1px solid ${err ? C.red : C.border}`,
            color: C.text, fontSize:'14px',
            fontFamily:'"DM Sans",sans-serif', outline:'none',
            marginBottom: err ? '8px' : '20px',
          }}
        />
        {err && <p style={{ color:C.red, fontSize:'12px', marginBottom:'12px' }}>{err}</p>}
        <button onClick={handleLogin} style={{
          ...btnStyle('accent'), width:'100%', height:'44px', fontSize:'14px',
        }}>
          登入
        </button>
      </div>
    </div>
  );
}

// ── 主元件 ────────────────────────────────────────────────────────
const TABS = [
  { key:'overview',     label:'概覽',    icon:'▦' },
  { key:'analytics',   label:'行銷數據', icon:'↗' },
  { key:'users',       label:'會員管理', icon:'♡' },
  { key:'products',    label:'產品管理', icon:'◻' },
  { key:'ingredients', label:'成分管理', icon:'✦' },
  { key:'questions',   label:'問答管理', icon:'?' },
  { key:'posts',       label:'貼文審核', icon:'≡' },
  { key:'reports',     label:'檢舉管理', icon:'!' },
];

export default function Admin() {
  const [authed, setAuthed] = useState(
    () => sessionStorage.getItem('admin_authed') === '1'
  );
  const [tab, setTab] = useState('overview');

  const handleLogin = () => {
    sessionStorage.setItem('admin_authed', '1');
    setAuthed(true);
  };
  const handleLogout = () => {
    sessionStorage.removeItem('admin_authed');
    setAuthed(false);
  };

  if (!authed) return <AdminLogin onSuccess={handleLogin} />;

  return (
    <div style={{ display:'flex', minHeight:'100vh', background:C.bg, fontFamily:'"DM Sans","Noto Sans TC",sans-serif' }}>

      {/* ── 側欄 ── */}
      <aside style={{
        width: '220px', minHeight:'100vh', flexShrink:0,
        background: C.bgPanel, borderRight:`1px solid ${C.border}`,
        display:'flex', flexDirection:'column',
        position:'sticky', top:0, alignSelf:'flex-start', height:'100vh',
      }}>
        {/* Logo */}
        <div style={{ padding:'28px 24px 20px', borderBottom:`1px solid ${C.border}` }}>
          <p style={{ margin:0, fontFamily:'"Cormorant Garamond",serif',
            fontSize:'24px', fontWeight:300, letterSpacing:'0.18em', color:C.text }}>GL&#332;W</p>
          <p style={{ margin:'2px 0 0', fontSize:'10px', letterSpacing:'0.18em',
            color:C.accent, textTransform:'uppercase' }}>Admin Panel</p>
        </div>

        {/* 導航 */}
        <nav style={{ flex:1, padding:'16px 12px', display:'flex', flexDirection:'column', gap:'4px' }}>
          {TABS.map(t => {
            const active = tab === t.key;
            return (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                style={{
                  display:'flex', alignItems:'center', gap:'10px',
                  padding:'9px 12px', borderRadius:'8px', border:'none',
                  background: active ? C.accentDim : 'transparent',
                  color: active ? C.accentText : C.textSub,
                  fontSize:'13px', fontFamily:'inherit', cursor:'pointer',
                  textAlign:'left', transition:'all 150ms', width:'100%',
                }}
              >
                <span style={{
                  width:'20px', height:'20px', flexShrink:0,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'13px', fontWeight:600,
                  background: active ? C.accent : C.bgCard,
                  color: active ? '#fff' : C.textDim,
                  borderRadius:'5px',
                }}>{t.icon}</span>
                {t.label}
              </button>
            );
          })}
        </nav>

        {/* 登出 */}
        <div style={{ padding:'16px 12px', borderTop:`1px solid ${C.border}` }}>
          <button onClick={handleLogout} style={{
            ...btnStyle('ghost'), width:'100%', fontSize:'12px',
          }}>
            登出
          </button>
        </div>
      </aside>

      {/* ── 主內容 ── */}
      <main style={{ flex:1, padding:'32px 36px', overflowX:'auto' }}>
        {/* 頁頭 */}
        <div style={{ marginBottom:'28px' }}>
          <h1 style={{
            margin:0, fontSize:'22px', fontWeight:600, color:C.text,
            fontFamily:'"Cormorant Garamond","Noto Serif TC",serif',
            letterSpacing:'0.04em',
          }}>
            {TABS.find(t => t.key === tab)?.label}
          </h1>
          <p style={{ margin:'4px 0 0', fontSize:'12px', color:C.textDim }}>
            {tab === 'overview'     && 'GLŌW 平台數據總覽'}
            {tab === 'analytics'   && '用戶行為、產品與內容的數據分析'}
            {tab === 'users'       && '管理所有已註冊的輔大同學，支援停權與刪除'}
            {tab === 'products'    && '管理美妝產品資料庫，支援新增、編輯、刪除'}
            {tab === 'ingredients' && '管理成分知識庫，查看各成分的膚質適合分數'}
            {tab === 'questions'   && '管理問答討論內容'}
            {tab === 'posts'       && '審核社群貼文，下架違規內容'}
            {tab === 'reports'     && '處理用戶檢舉案件'}
          </p>
        </div>

        {/* 分頁內容 */}
        {tab === 'overview'     && <OverviewTab />}
        {tab === 'analytics'   && <AnalyticsTab />}
        {tab === 'users'       && <UsersTab />}
        {tab === 'products'    && <ProductsTab />}
        {tab === 'ingredients' && <IngredientsTab />}
        {tab === 'questions'   && <QuestionsTab />}
        {tab === 'posts'       && <PostsTab />}
        {tab === 'reports'     && <ReportsTab />}
      </main>
    </div>
  );
}
