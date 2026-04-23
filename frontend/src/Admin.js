import { useState, useEffect, useCallback } from 'react';

const API = '/api/admin';
const ADMIN_KEY = 'glowadmin2026';

const C = {
  bg:         '#0F0D0C',
  bgPanel:    '#1C1917',
  bgCard:     '#232018',
  bgRow:      '#1A1713',
  bgRowHover: '#221F1A',
  border:     'rgba(255,255,255,0.07)',
  accent:     '#C4897A',
  accentDim:  'rgba(196,137,122,0.15)',
  accentText: '#D9A898',
  text:       '#F7F4F2',
  textSub:    '#A89990',
  textDim:    '#6B5E58',
  green:      '#7BAF7B',
  red:        '#C47A7A',
  yellow:     '#C4B07A',
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

  const cards = [
    { label: '總會員數', value: stats.userCount,     icon: '👥', color: C.accentText },
    { label: '產品總數', value: stats.productCount,  icon: '🧴', color: C.green },
    { label: '問答總數', value: stats.questionCount, icon: '💬', color: C.yellow },
    { label: '收藏總數', value: stats.wishlistCount, icon: '❤️', color: C.red },
  ];

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'28px' }}>
      {/* 數字卡片 */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'16px' }}>
        {cards.map(c => (
          <div key={c.label} style={cardStyle}>
            <span style={{ fontSize:'28px' }}>{c.icon}</span>
            <div>
              <p style={{ margin:0, fontSize:'28px', fontWeight:700, color:c.color,
                fontFamily:'"DM Sans",sans-serif', lineHeight:1 }}>{c.value}</p>
              <p style={{ margin:'4px 0 0', fontSize:'12px', color:C.textSub }}>{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 最新會員 */}
      <div style={sectionStyle}>
        <h3 style={sectionTitle}>最新加入會員</h3>
        <table style={tableStyle}>
          <thead><tr>
            {['暱稱','學號','系所年級','膚質','加入時間'].map(h => (
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
                <td style={tdStyle}>{fmtDate(u.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── 會員管理頁 ────────────────────────────────────────────────────
function UsersTab() {
  const [users,  setUsers]  = useState([]);
  const [q,      setQ]      = useState('');
  const [del,    setDel]    = useState(null); // { user_id, nickname }

  const load = useCallback(() => {
    adminFetch(`/users?q=${encodeURIComponent(q)}`).then(d => { if (Array.isArray(d)) setUsers(d); });
  }, [q]);

  useEffect(() => { load(); }, [load]);

  const handleDelete = async () => {
    await adminFetch(`/users/${del.user_id}`, { method:'DELETE' });
    setDel(null);
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
            {['暱稱','學號','Email','系所年級','膚質','加入時間','操作'].map(h => (
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
                <td style={tdStyle}><strong style={{ color:C.text }}>{u.nickname}</strong></td>
                <td style={tdStyle}>{u.student_id}</td>
                <td style={{ ...tdStyle, color:C.textSub, fontSize:'12px' }}>{u.email}</td>
                <td style={tdStyle}>{u.department_grade || '—'}</td>
                <td style={tdStyle}>
                  <span style={{ ...tagStyle, color:C.accentText, background:C.accentDim }}>
                    {SKIN_LABELS[u.skin_type] || u.skin_type || '未設定'}
                  </span>
                </td>
                <td style={tdStyle}>{fmtDate(u.created_at)}</td>
                <td style={tdStyle}>
                  <button onClick={() => setDel(u)} style={btnStyle('danger')}>刪除</button>
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
    </div>
  );
}

// ── 產品管理頁 ────────────────────────────────────────────────────
const P_CAT_COLOR = {
  '保養品': { color:'#7BAF7B', bg:'rgba(123,175,123,0.13)' },
  '化妝品': { color:'#C47AA0', bg:'rgba(196,122,160,0.13)' },
};
const P_SUB_COLORS = ['#C4897A','#7BAF7B','#7AAFC4','#C4B07A','#9B7AC4','#C47A9B'];

function EditProductModal({ product, meta, onSave, onCancel }) {
  const [form, setForm] = useState({
    name:         product.name,
    brand:        product.brand,
    category:     product.category,
    sub_category: product.sub_category,
  });
  const [saving, setSaving] = useState(false);

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const handleSave = async () => {
    setSaving(true);
    const res = await adminFetch(`/products/${product.product_id}`, { method:'PATCH', body: form });
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

function ProductsTab() {
  const [all,       setAll]      = useState([]);   // 全部產品（一次載入）
  const [q,         setQ]        = useState('');
  const [catFilter, setCatFilter] = useState('');  // '' = 全部
  const [subFilter, setSubFilter] = useState('');
  const [del,       setDel]      = useState(null);
  const [editing,   setEditing]  = useState(null);
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
        <span style={{ fontSize:'13px', color:C.textSub }}>
          顯示 {filtered.length} / {all.length} 筆
        </span>
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
        <EditProductModal
          product={editing} meta={meta}
          onSave={handleSave}
          onCancel={() => setEditing(null)}
        />
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
    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'10px' }}>
      <div style={{ width:'120px', fontSize:'12px', color:C.textSub, textAlign:'right', flexShrink:0,
        whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{label}</div>
      <div style={{ flex:1, background:C.bgCard, borderRadius:'999px', height:'8px', overflow:'hidden' }}>
        <div style={{
          width:`${pct}%`, height:'100%', borderRadius:'999px',
          background:color, transition:'width 600ms cubic-bezier(0.16,1,0.3,1)',
        }} />
      </div>
      <div style={{ width:'40px', fontSize:'12px', color, fontWeight:600, textAlign:'right' }}>
        {value}{suffix}
      </div>
    </div>
  );
}

function WeeklyBar({ data, color, label }) {
  const max = Math.max(...data.map(d => d.count), 1);
  return (
    <div style={sectionStyle}>
      <h3 style={sectionTitle}>{label}</h3>
      <div style={{ padding:'0 20px 20px' }}>
        {data.length === 0
          ? <p style={{ color:C.textDim, fontSize:'13px', margin:0 }}>尚無足夠資料</p>
          : (
          <div style={{ display:'flex', alignItems:'flex-end', gap:'8px', height:'120px' }}>
            {data.map((d, i) => {
              const h = Math.max(Math.round((d.count / max) * 100), 4);
              return (
                <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'6px' }}>
                  <span style={{ fontSize:'11px', color, fontWeight:600 }}>{d.count}</span>
                  <div style={{
                    width:'100%', height:`${h}px`, borderRadius:'4px 4px 0 0',
                    background:color, opacity:0.85, transition:'height 600ms',
                  }} />
                  <span style={{ fontSize:'10px', color:C.textDim }}>{d.week}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function AnalyticsTab() {
  const [data, setData] = useState(null);

  useEffect(() => {
    adminFetch('/analytics').then(setData).catch(() => {});
  }, []);

  if (!data) return <Loading />;

  const skinMax = Math.max(...(data.skinDist.map(d => d.count)), 1);
  const subMax  = Math.max(...(data.subCatDist.map(d => d.count)), 1);
  const tagMax  = Math.max(...(data.tagDist.map(d => d.count)), 1);
  const catTotal = data.categoryDist.reduce((s, d) => s + d.count, 0);

  return (
    <div style={{ display:'flex', flexDirection:'column', gap:'24px' }}>

      {/* 週成長雙欄 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        <WeeklyBar data={data.weeklyUsers}     color={C.accentText} label="週新增會員" />
        <WeeklyBar data={data.weeklyQuestions} color={C.green}      label="週新增問答" />
      </div>

      {/* 膚質分佈 + 產品分類 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* 膚質 */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>膚質分佈</h3>
          <div style={{ padding:'4px 20px 20px' }}>
            {data.skinDist.map(d => (
              <HBar key={d.key}
                label={SKIN_LABELS_FULL[d.key] || d.key}
                value={d.count} max={skinMax}
                color={SKIN_COLORS[d.key] || C.accent}
              />
            ))}
          </div>
        </div>

        {/* 產品分類 */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>產品分類佔比</h3>
          <div style={{ padding:'4px 20px 20px' }}>
            {data.categoryDist.map((d, i) => {
              const pct = catTotal > 0 ? Math.round((d.count / catTotal) * 100) : 0;
              return (
                <div key={d.category} style={{ marginBottom:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                    <span style={{ fontSize:'13px', color:C.text }}>{d.category}</span>
                    <span style={{ fontSize:'13px', color:CAT_COLORS_A[i], fontWeight:600 }}>
                      {d.count} 件 ({pct}%)
                    </span>
                  </div>
                  <div style={{ background:C.bgCard, borderRadius:'999px', height:'10px', overflow:'hidden' }}>
                    <div style={{
                      width:`${pct}%`, height:'100%', borderRadius:'999px',
                      background:CAT_COLORS_A[i], transition:'width 600ms',
                    }} />
                  </div>
                </div>
              );
            })}

            <div style={{ borderTop:`1px solid ${C.border}`, marginTop:'16px', paddingTop:'16px' }}>
              <h4 style={{ margin:'0 0 12px', fontSize:'12px', color:C.textDim, textTransform:'uppercase', letterSpacing:'0.08em' }}>
                子分類 Top 8
              </h4>
              {data.subCatDist.map((d, i) => (
                <HBar key={d.sub_category}
                  label={d.sub_category} value={d.count} max={subMax}
                  color={CAT_COLORS_A[i % CAT_COLORS_A.length]}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 熱門收藏 + 標籤分析 */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px' }}>
        {/* 熱門收藏 */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>熱門收藏排行 Top 8</h3>
          <div style={{ padding:'0 20px 20px' }}>
            {data.topWishlist.map((p, i) => (
              <div key={i} style={{
                display:'flex', alignItems:'center', gap:'12px',
                padding:'10px 0', borderBottom: i < data.topWishlist.length-1 ? `1px solid ${C.border}` : 'none',
              }}>
                <span style={{
                  width:'24px', height:'24px', borderRadius:'50%', flexShrink:0,
                  background: i < 3 ? C.accent : C.bgCard,
                  display:'flex', alignItems:'center', justifyContent:'center',
                  fontSize:'11px', fontWeight:700, color: i < 3 ? '#fff' : C.textDim,
                }}>{i+1}</span>
                <div style={{ flex:1, minWidth:0 }}>
                  <p style={{ margin:0, fontSize:'13px', color:C.text,
                    overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{p.name}</p>
                  <p style={{ margin:'2px 0 0', fontSize:'11px', color:C.textSub }}>{p.brand}</p>
                </div>
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <p style={{ margin:0, fontSize:'14px', fontWeight:700, color: p.wishlist_count > 0 ? C.accentText : C.textDim }}>
                    {p.wishlist_count}
                  </p>
                  <p style={{ margin:'1px 0 0', fontSize:'10px', color:C.textDim }}>收藏</p>
                </div>
              </div>
            ))}
            {data.topWishlist.length === 0 && <p style={{ color:C.textDim, fontSize:'13px' }}>尚無收藏資料</p>}
          </div>
        </div>

        {/* 問答標籤 */}
        <div style={sectionStyle}>
          <h3 style={sectionTitle}>問答熱門標籤</h3>
          <div style={{ padding:'4px 20px 20px' }}>
            {data.tagDist.length > 0
              ? (
                <>
                  {data.tagDist.map((d, i) => (
                    <HBar key={d.tag}
                      label={`#${d.tag}`} value={d.count} max={tagMax}
                      color={CAT_COLORS_A[i % CAT_COLORS_A.length]}
                      suffix=" 題"
                    />
                  ))}
                  <div style={{ marginTop:'20px', display:'flex', flexWrap:'wrap', gap:'8px' }}>
                    {data.tagDist.map((d, i) => (
                      <span key={d.tag} style={{
                        padding:'5px 14px', borderRadius:'999px',
                        background:C.bgCard,
                        border:`1px solid ${CAT_COLORS_A[i % CAT_COLORS_A.length]}40`,
                        color:CAT_COLORS_A[i % CAT_COLORS_A.length],
                        fontSize:'12px', fontWeight:500,
                        fontFamily:'"DM Sans","Noto Sans TC",sans-serif',
                      }}>
                        #{d.tag} · {d.count}
                      </span>
                    ))}
                  </div>
                </>
              )
              : <p style={{ color:C.textDim, fontSize:'13px' }}>尚無標籤資料</p>
            }
          </div>
        </div>
      </div>
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
          color:C.accent, fontFamily:'"DM Sans",sans-serif' }}>ADMIN PANEL</p>
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
  { key:'overview',   label:'概覽',    icon:'◈' },
  { key:'analytics',  label:'行銷數據', icon:'◐' },
  { key:'users',      label:'會員管理', icon:'◉' },
  { key:'products',   label:'產品管理', icon:'◧' },
  { key:'questions',  label:'問答管理', icon:'◫' },
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
                  padding:'10px 14px', borderRadius:'8px', border:'none',
                  background: active ? C.accentDim : 'transparent',
                  color: active ? C.accentText : C.textSub,
                  fontSize:'13px', fontFamily:'inherit', cursor:'pointer',
                  textAlign:'left', transition:'all 150ms',
                }}
              >
                <span style={{ fontSize:'16px', opacity:0.8 }}>{t.icon}</span>
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
            {tab === 'overview'   && 'GLŌW 平台數據總覽'}
            {tab === 'analytics'  && '用戶行為、產品與內容的數據分析'}
            {tab === 'users'      && '管理所有已註冊的輔大同學'}
            {tab === 'products'   && '管理美妝產品資料庫'}
            {tab === 'questions'  && '管理問答討論內容'}
          </p>
        </div>

        {/* 分頁內容 */}
        {tab === 'overview'   && <OverviewTab />}
        {tab === 'analytics'  && <AnalyticsTab />}
        {tab === 'users'      && <UsersTab />}
        {tab === 'products'   && <ProductsTab />}
        {tab === 'questions'  && <QuestionsTab />}
      </main>
    </div>
  );
}
