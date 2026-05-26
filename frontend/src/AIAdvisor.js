import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from './config';

const SKIN_TYPES = [
  { value: 'oily',      label: '油性肌',   desc: '容易出油、毛孔明顯',   color: '#7AAFC4', bg: 'rgba(122,175,196,0.12)' },
  { value: 'dry',       label: '乾性肌',   desc: '容易緊繃、脫皮',       color: '#C4A87A', bg: 'rgba(196,168,122,0.12)' },
  { value: 'combo',     label: '混合性肌', desc: 'T 區油、兩頰乾',       color: '#7BAE8A', bg: 'rgba(123,174,138,0.12)' },
  { value: 'sensitive', label: '敏感性肌', desc: '容易泛紅、刺激',       color: '#C4897A', bg: 'rgba(196,137,122,0.12)' },
  { value: 'normal',    label: '中性肌',   desc: '油水平衡、不易過敏',   color: '#A89AC4', bg: 'rgba(168,154,196,0.12)' },
];

const CONCERNS = [
  '控油', '保濕', '痘痘', '毛孔粗大', '暗沉',
  '泛紅敏感', '抗老', '淡斑', '緊緻', '修復屏障',
];

const C = {
  bg:           '#F7F4F2',
  surface:      '#FFFFFF',
  subtle:       '#F0EBE7',
  border:       '#E5DDD9',
  accent:       '#C4897A',
  accentSub:    'rgba(196,137,122,0.12)',
  accentBorder: 'rgba(196,137,122,0.3)',
  text:         '#1C1917',
  textSub:      '#6B5E58',
  textDim:      '#A89990',
  inverse:      '#1C1917',
};

export default function AIAdvisor({ onClose, embedded = false }) {
  const navigate = useNavigate();
  const [step, setStep]             = useState(1);
  const [skinType, setSkinType]     = useState('');
  const [concerns, setConcerns]     = useState([]);
  const [products, setProducts]     = useState([]);
  const [search, setSearch]         = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [loadingP, setLoadingP]     = useState(false);
  const [loading, setLoading]       = useState(false);
  const [result, setResult]         = useState('');
  const resultRef = useRef(null);

  /* 進入步驟三時載入產品 */
  useEffect(() => {
    if (step !== 3) return;
    setLoadingP(true);
    fetch(`${API_BASE}/api/products?limit=40&sort=score`)
      .then(r => r.json())
      .then(j => setAllProducts(Array.isArray(j.data) ? j.data : []))
      .catch(() => {})
      .finally(() => setLoadingP(false));
  }, [step]);

  useEffect(() => {
    if (step === 4 && resultRef.current) {
      resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [step]);

  const toggleConcern = (c) =>
    setConcerns(prev => prev.includes(c) ? prev.filter(x => x !== c) : [...prev, c]);

  const addProduct = (p) => {
    if (!products.find(x => x.product_id === p.product_id)) {
      setProducts(prev => [...prev, p]);
    }
    setSearch('');
  };

  const removeProduct = (id) => setProducts(prev => prev.filter(p => p.product_id !== id));

  const reset = () => {
    setStep(1); setSkinType(''); setConcerns([]);
    setProducts([]); setResult('');
  };

  const submit = async () => {
    setStep(4);
    setLoading(true);
    setResult('');
    try {
      const res = await fetch(`${API_BASE}/api/ai/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          skin_type: skinType,
          concerns: concerns.join('、'),
          products: products.map(p => ({
            name: p.name, brand: p.brand,
            sub_category: p.sub_category, score: p.score,
          })),
        }),
      });
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buf = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });
        const lines = buf.split('\n');
        buf = lines.pop();
        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const payload = line.slice(6).trim();
          if (payload === '[DONE]') break;
          try { const { text } = JSON.parse(payload); if (text) setResult(prev => prev + text); }
          catch { /* skip */ }
        }
      }
    } catch { setResult('分析失敗，請稍後再試。'); }
    setLoading(false);
  };

  const skinInfo = SKIN_TYPES.find(s => s.value === skinType);

  return (
    <div style={{ ...S.wrap, ...(embedded ? S.embedded : {}) }}>
      {/* Header */}
      <div style={S.header}>
        <div>
          <p style={S.eyebrow}>AI SKIN ADVISOR</p>
          <h2 style={S.title}>個人化保養顧問</h2>
        </div>
        {onClose && (
          <button style={S.closeBtn} onClick={onClose}>✕</button>
        )}
      </div>

      {/* Progress bar */}
      {step < 4 && (
        <div style={S.progressBar}>
          <div style={{ ...S.progressFill, width: `${(step / 3) * 100}%` }} />
        </div>
      )}

      <div style={S.body}>

        {/* Step 1: 膚質 */}
        {step === 1 && (
          <div>
            <h3 style={S.stepTitle}>你的膚質是？</h3>
            <div style={S.skinGrid}>
              {SKIN_TYPES.map(s => (
                <button
                  key={s.value}
                  style={{
                    ...S.skinBtn,
                    background: skinType === s.value ? s.bg : C.surface,
                    border: `1.5px solid ${skinType === s.value ? s.color : C.border}`,
                  }}
                  onClick={() => setSkinType(s.value)}
                >
                  <div style={{ ...S.skinDot, background: s.color, boxShadow: `0 0 0 4px ${s.bg}` }} />
                  <span style={{ ...S.skinLabel, color: skinType === s.value ? s.color : C.text }}>
                    {s.label}
                  </span>
                  <span style={S.skinDesc}>{s.desc}</span>
                </button>
              ))}
            </div>
            <div style={S.btnRow}>
              <button style={{ ...S.nextBtn, opacity: skinType ? 1 : 0.4 }} disabled={!skinType} onClick={() => setStep(2)}>
                下一步 →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: 需求 */}
        {step === 2 && (
          <div>
            <h3 style={S.stepTitle}>最在意的肌膚問題？</h3>
            <p style={S.hint}>可多選</p>
            <div style={S.chipWrap}>
              {CONCERNS.map(c => (
                <button
                  key={c}
                  style={{
                    ...S.chip,
                    background: concerns.includes(c) ? C.accent : C.surface,
                    color: concerns.includes(c) ? '#fff' : C.textSub,
                    border: `1.5px solid ${concerns.includes(c) ? C.accent : C.border}`,
                  }}
                  onClick={() => toggleConcern(c)}
                >
                  {c}
                </button>
              ))}
            </div>
            <div style={S.btnRow}>
              <button style={S.backBtn} onClick={() => setStep(1)}>← 上一步</button>
              <button style={{ ...S.nextBtn, opacity: concerns.length ? 1 : 0.4 }} disabled={!concerns.length} onClick={() => setStep(3)}>
                下一步 →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: 產品（可選） */}
        {step === 3 && (
          <div>
            <h3 style={S.stepTitle}>現在在用哪些產品？</h3>
            <p style={S.hint}>選填・點選加入，讓建議更精準</p>

            {/* 已選產品 */}
            {products.length > 0 && (
              <div style={S.tagsWrap}>
                {products.map(p => (
                  <div key={p.product_id} style={S.productTag}>
                    <span>{p.name}</span>
                    <button style={S.removeBtn} onClick={() => removeProduct(p.product_id)}>✕</button>
                  </div>
                ))}
              </div>
            )}

            {/* 搜尋框 */}
            <div style={S.searchWrap}>
              <span style={S.searchIcon}>⌕</span>
              <input
                style={S.searchInput}
                placeholder="搜尋產品名稱或品牌..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>

            {/* 產品清單 */}
            {loadingP ? (
              <div style={{ textAlign: 'center', padding: '24px', color: C.textDim, fontSize: '13px' }}>載入中...</div>
            ) : (
              <div style={S.productList}>
                {allProducts
                  .filter(p =>
                    !products.find(x => x.product_id === p.product_id) &&
                    (!search.trim() || p.name.includes(search) || p.brand.includes(search))
                  )
                  .slice(0, 20)
                  .map(p => (
                    <button key={p.product_id} style={S.productRow} onClick={() => addProduct(p)}>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={S.productName}>{p.name}</p>
                        <p style={S.productMeta}>{p.brand} · {p.sub_category}</p>
                      </div>
                      <span style={S.addBtn}>+</span>
                    </button>
                  ))
                }
                {allProducts.filter(p =>
                  !products.find(x => x.product_id === p.product_id) &&
                  (!search.trim() || p.name.includes(search) || p.brand.includes(search))
                ).length === 0 && (
                  <p style={{ textAlign: 'center', color: C.textDim, fontSize: '13px', padding: '20px 0' }}>找不到相關產品</p>
                )}
              </div>
            )}

            <div style={S.btnRow}>
              <button style={S.backBtn} onClick={() => setStep(2)}>← 上一步</button>
              <button style={S.nextBtn} onClick={submit}>開始分析 ✦</button>
            </div>
          </div>
        )}

        {/* Step 4: 結果 */}
        {step === 4 && (
          <div ref={resultRef}>
            <div style={S.resultMeta}>
              {skinInfo && (
                <span style={{ ...S.metaTag, background: skinInfo.bg, color: skinInfo.color, border: `1px solid ${skinInfo.color}44` }}>
                  {skinInfo.label}
                </span>
              )}
              {concerns.map(c => (
                <span key={c} style={S.metaTag}>{c}</span>
              ))}
            </div>

            {loading && !result && (
              <div style={S.loadingWrap}>
                <div style={S.dots}>
                  {[0, 200, 400].map(d => (
                    <span key={d} style={{ ...S.dot, animationDelay: `${d}ms` }} />
                  ))}
                </div>
                <p style={S.loadingText}>AI 分析中，請稍候...</p>
              </div>
            )}

            {result && (
              <div style={S.resultBox}>
                {result.split('\n').map((line, i) => {
                  if (!line.trim()) return null;
                  const isHeading = /^\d+[.、]|^#{1,3}\s/.test(line);
                  return (
                    <p key={i} style={isHeading ? S.resultH : S.resultP}>
                      {line.replace(/^#+\s*/, '')}
                    </p>
                  );
                })}
              </div>
            )}

            {!loading && result && (
              <div style={S.btnRow}>
                <button style={S.backBtn} onClick={reset}>重新分析</button>
                <button style={S.nextBtn} onClick={() => onClose ? onClose() : navigate('/products')}>
                  {onClose ? '關閉' : '瀏覽產品庫 →'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes ai-bounce {
          0%,80%,100% { transform: translateY(0); opacity:.35; }
          40% { transform: translateY(-7px); opacity:1; }
        }
      `}</style>
    </div>
  );
}

const S = {
  wrap: {
    background: '#fff',
    borderRadius: '20px',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  embedded: {
    height: '100%',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    padding: '28px 28px 0',
  },
  eyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.2em',
    color: C.accent, margin: '0 0 6px', textTransform: 'uppercase',
  },
  title: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px', fontWeight: 400, color: C.text, margin: 0,
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '16px', color: C.textDim, padding: '4px',
    lineHeight: 1,
  },
  progressBar: {
    height: '2px',
    background: C.border,
    margin: '20px 28px 0',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: C.accent,
    borderRadius: '999px',
    transition: 'width 400ms cubic-bezier(0.22,1,0.36,1)',
  },
  body: {
    padding: '24px 28px 28px',
    overflowY: 'auto',
    flex: 1,
  },
  stepTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px', fontWeight: 400, color: C.text, margin: '0 0 4px',
  },
  hint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: C.textDim, margin: '0 0 16px',
  },
  skinGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
    gap: '10px', margin: '16px 0',
  },
  skinBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
    padding: '16px 12px', borderRadius: '12px', cursor: 'pointer',
    transition: 'all 180ms',
  },
  skinDot: {
    width: '36px', height: '36px', borderRadius: '50%',
    transition: 'all 200ms',
  },
  skinLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 600, transition: 'color 180ms',
  },
  skinDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: C.textDim, textAlign: 'center', lineHeight: 1.4,
  },
  chipWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', margin: '0 0 24px' },
  chip: {
    padding: '7px 16px', borderRadius: '999px', cursor: 'pointer',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500, transition: 'all 150ms',
  },
  searchWrap: {
    display: 'flex', alignItems: 'center',
    border: `1px solid ${C.border}`, borderRadius: '10px',
    background: C.subtle, overflow: 'hidden',
    marginBottom: '0',
  },
  searchIcon: { padding: '0 10px', fontSize: '13px', flexShrink: 0 },
  searchInput: {
    flex: 1, height: '42px', border: 'none', background: 'transparent',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', color: C.text, outline: 'none',
  },
  spin: { padding: '0 12px', color: C.textDim, fontSize: '14px', flexShrink: 0 },
  searchDrop: {
    position: 'absolute', left: 0, right: 0, top: '48px',
    background: C.surface, border: `1px solid ${C.border}`,
    borderRadius: '10px', zIndex: 100,
    boxShadow: '0 8px 24px rgba(28,25,23,0.1)',
    overflow: 'hidden',
  },
  searchItem: {
    width: '100%', padding: '11px 16px', textAlign: 'left',
    background: 'none', border: 'none',
    borderBottom: `1px solid ${C.border}`,
    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: '2px',
  },
  searchName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500, color: C.text,
  },
  searchMeta: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: C.textDim,
  },
  tagsWrap: { display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '12px', marginBottom: '12px' },
  productList: {
    marginTop: '10px', marginBottom: '4px',
    maxHeight: '220px', overflowY: 'auto',
    border: `1px solid ${C.border}`, borderRadius: '10px',
    background: C.surface,
  },
  productRow: {
    width: '100%', display: 'flex', alignItems: 'center', gap: '10px',
    padding: '10px 14px', background: 'none', border: 'none',
    borderBottom: `1px solid ${C.border}`,
    cursor: 'pointer', textAlign: 'left',
    transition: 'background 120ms',
  },
  productName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500, color: C.text,
    margin: '0 0 2px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
  },
  productMeta: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: C.textDim, margin: 0,
  },
  addBtn: {
    flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%',
    background: C.accentSub, color: C.accent,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '16px', lineHeight: 1, fontWeight: 400,
  },
  productTag: {
    display: 'flex', alignItems: 'center', gap: '8px',
    padding: '5px 10px 5px 14px',
    background: 'rgba(196,137,122,0.10)', border: `1px solid rgba(196,137,122,0.28)`,
    borderRadius: '999px', fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: C.text,
  },
  removeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: C.textDim, fontSize: '11px', padding: 0, lineHeight: 1,
  },
  btnRow: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px',
  },
  nextBtn: {
    height: '40px', padding: '0 24px', background: C.inverse,
    color: '#F7F4F2', border: 'none', borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    transition: 'opacity 150ms',
  },
  backBtn: {
    height: '40px', padding: '0 18px', background: 'none',
    color: C.textSub, border: `1px solid ${C.border}`, borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', cursor: 'pointer',
  },
  resultMeta: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' },
  metaTag: {
    padding: '3px 12px', borderRadius: '999px',
    background: 'rgba(196,137,122,0.10)', border: `1px solid rgba(196,137,122,0.25)`,
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: C.accent,
  },
  loadingWrap: {
    display: 'flex', flexDirection: 'column', alignItems: 'center',
    padding: '40px 0', gap: '14px',
  },
  dots: { display: 'flex', gap: '7px' },
  dot: {
    width: '7px', height: '7px', borderRadius: '50%', background: C.accent,
    display: 'inline-block', animation: 'ai-bounce 1.2s infinite',
  },
  loadingText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: C.textDim, margin: 0,
  },
  resultBox: {
    background: C.subtle, borderRadius: '12px', padding: '20px 24px',
    maxHeight: '320px', overflowY: 'auto',
  },
  resultH: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '17px', fontWeight: 400, color: C.text,
    margin: '16px 0 4px', lineHeight: 1.4,
  },
  resultP: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: C.textSub, lineHeight: 1.8,
    margin: '0 0 6px',
  },
};
