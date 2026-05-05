// frontend/src/components/ProductPopover.js
import { useState, useEffect, useCallback } from 'react';
import ReactDOM from 'react-dom';
import API_BASE from '../config';

const T = {
  bgSurface:     '#FFFFFF',
  bgSubtle:      '#F0EBE7',
  accent:        '#C4897A',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  border:        '#E5DDD9',
};

const EMOJI = { '粉底液':'💄','遮瑕':'✨','防曬':'🌞','化妝水':'💧','乳液':'🧴','霜':'🫙' };

function Stars({ value, onChange, readonly = false }) {
  return (
    <div style={{ display:'flex', gap:'3px' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n}
          onClick={() => !readonly && onChange?.(n)}
          style={{
            fontSize: readonly ? '13px' : '22px',
            cursor: readonly ? 'default' : 'pointer',
            color: n <= value ? '#F5A623' : '#E5DDD9',
            lineHeight: 1,
            userSelect: 'none',
          }}>★</span>
      ))}
    </div>
  );
}

export default function ProductPopover({ product, onClose, currentUser }) {
  const [reviews,    setReviews]    = useState([]);
  const [myRating,   setMyRating]   = useState(0);
  const [myContent,  setMyContent]  = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [visible,    setVisible]    = useState(false); // 控制滑入動畫

  // 掛載後觸發滑入
  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
  }, []);

  const handleClose = useCallback(() => {
    setVisible(false);
    setTimeout(onClose, 280);
  }, [onClose]);

  const loadReviews = useCallback(() => {
    if (!product?.product_id) return;
    fetch(`${API_BASE}/api/reviews/${product.product_id}`)
      .then(r => r.json())
      .then(d => Array.isArray(d) && setReviews(d))
      .catch(() => {});
  }, [product?.product_id]);

  useEffect(() => { loadReviews(); }, [loadReviews]);

  useEffect(() => {
    const handler = e => e.key === 'Escape' && handleClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleClose]);

  if (!product) return null;

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  const scoreNum   = parseFloat(product.score);
  const hasScore   = !isNaN(scoreNum);
  const scorePct   = hasScore ? Math.min(100, Math.max(0, scoreNum * 10)) : 0;
  const scoreColor = scorePct >= 80 ? '#7BAF7B' : scorePct >= 50 ? T.accent : T.textTertiary;

  const handleSubmit = async () => {
    if (!myRating || !currentUser?.user_id) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          product_id: product.product_id,
          user_id:    currentUser.user_id,
          rating:     myRating,
          content:    myContent.trim(),
        }),
      });
      if (res.ok) { setSubmitted(true); setMyContent(''); loadReviews(); }
    } finally { setSubmitting(false); }
  };

  return ReactDOM.createPortal(
  <>
    {/* 半透明遮罩 */}
    <div
      onClick={handleClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 999,
        backgroundColor: 'rgba(28,25,23,0.4)',
        opacity: visible ? 1 : 0,
        transition: 'opacity 280ms ease',
      }}
    />

    {/* Drawer 本體 — 其餘內容完全不動 */}
    <div
      onClick={e => e.stopPropagation()}
      style={{
        position: 'fixed',
        top: 0, right: 0, bottom: 0,
        zIndex: 1000,
        width: '420px',
        maxWidth: '92vw',
        backgroundColor: T.bgSurface,
        boxShadow: '-12px 0 40px rgba(0,0,0,0.12)',
        display: 'flex',
        flexDirection: 'column',
        transform: visible ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 280ms cubic-bezier(0.32,0,0.15,1)',
        overflowY: 'auto',
      }}
    >
        {/* 圖片 Banner */}
        <div style={{
          height: '200px',
          flexShrink: 0,
          backgroundColor: T.bgSubtle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
        }}>
          {product.image_url
            ? <img src={product.image_url} alt={product.name}
                style={{ width:'100%', height:'100%', objectFit:'contain', padding:'20px' }}
                onError={e => { e.target.style.display='none'; }}
              />
            : <span style={{ fontSize:'72px' }}>{EMOJI[product.sub_category] || '🧴'}</span>
          }

          {/* 關閉按鈕 */}
          <button onClick={handleClose} style={{
            position: 'absolute', top: '14px', right: '14px',
            width: '32px', height: '32px', borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.9)',
            border: `1px solid ${T.border}`,
            cursor: 'pointer', fontSize: '14px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: T.textSecondary, lineHeight: 1,
          }}>✕</button>
        </div>

        {/* 內容區 */}
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* 品牌 + 品項 */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <span style={{ fontSize:'11px', fontWeight:600, color:T.textTertiary,
              textTransform:'uppercase', letterSpacing:'0.1em' }}>
              {product.brand}
            </span>
            <span style={{ fontSize:'11px', color:T.accent,
              backgroundColor:'rgba(196,137,122,0.1)',
              border:'1px solid rgba(196,137,122,0.2)',
              borderRadius:'999px', padding:'3px 10px' }}>
              {product.sub_category}
            </span>
          </div>

          {/* 產品名稱 */}
          <p style={{ margin:0, fontFamily:'"Cormorant Garamond","Noto Serif TC",serif',
            fontSize:'24px', fontWeight:400, color:T.textPrimary, lineHeight:1.3 }}>
            {product.name}
          </p>

          {/* 推薦分數 */}
          {hasScore && (
            <div>
              <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'6px' }}>
                <span style={{ fontSize:'11px', color:T.textTertiary, letterSpacing:'0.06em' }}>推薦分數</span>
                <span style={{ fontSize:'13px', fontWeight:600, color:scoreColor }}>
                  {scoreNum.toFixed(1)}
                </span>
              </div>
              <div style={{ height:'5px', backgroundColor:T.bgSubtle,
                borderRadius:'999px', overflow:'hidden' }}>
                <div style={{ width:`${scorePct}%`, height:'100%',
                  backgroundColor:scoreColor, borderRadius:'999px',
                  transition:'width 600ms ease' }} />
              </div>
            </div>
          )}

          {/* 平均星等 */}
          {avgRating && (
            <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
              <Stars value={Math.round(parseFloat(avgRating))} readonly />
              <span style={{ fontSize:'13px', fontWeight:600, color:T.textPrimary }}>{avgRating}</span>
              <span style={{ fontSize:'12px', color:T.textTertiary }}>({reviews.length} 則評論)</span>
            </div>
          )}

          {/* 價格 */}
          {product.price_min && (
            <p style={{ margin:0, fontSize:'20px', fontWeight:600, color:T.accent }}>
              NT${product.price_min}
              {product.price_max && product.price_max !== product.price_min &&
                <span style={{ fontSize:'15px', color:T.textTertiary, fontWeight:400 }}>
                  {' '}– {product.price_max}
                </span>}
            </p>
          )}

          {/* 推薦成分標籤（評分用） */}
          {product.product_ingredients?.length > 0 && (
            <div style={{ paddingTop:'12px', borderTop:`1px solid ${T.border}` }}>
              <p style={{ margin:'0 0 8px', fontSize:'11px', fontWeight:600,
                color:T.textTertiary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                推薦依據成分
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {product.product_ingredients.map(pi => (
                  <span key={pi.ingredient_id}
                    style={{ fontSize:'12px', color:T.textSecondary,
                      backgroundColor:T.bgSubtle, borderRadius:'999px',
                      padding:'3px 10px', border:`1px solid ${T.border}` }}>
                    {pi.ingredients?.name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 完整成分清單 */}
          {product.raw_ingredients?.length > 0 && (
            <div style={{ paddingTop:'12px', borderTop:`1px solid ${T.border}` }}>
              <p style={{ margin:'0 0 8px', fontSize:'11px', fontWeight:600,
                color:T.textTertiary, letterSpacing:'0.08em', textTransform:'uppercase' }}>
                完整成分
              </p>
              <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                {product.raw_ingredients.map((name, i) => (
                  <span key={i}
                    style={{ fontSize:'12px', color:T.textSecondary,
                      backgroundColor:T.bgSubtle, borderRadius:'999px',
                      padding:'3px 10px', border:`1px solid ${T.border}` }}>
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 描述 */}
          {product.description && (
            <p style={{ margin:0, fontSize:'13px', color:T.textSecondary, lineHeight:1.7,
              padding:'12px 14px', backgroundColor:T.bgSubtle, borderRadius:'10px' }}>
              {product.description}
            </p>
          )}

          {/* ── 評論區 ── */}
          <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:'16px',
            display:'flex', flexDirection:'column', gap:'12px' }}>

            <p style={{ margin:0, fontSize:'12px', fontWeight:600, color:T.textPrimary,
              letterSpacing:'0.08em', textTransform:'uppercase' }}>
              用戶評論 {reviews.length > 0 && `(${reviews.length})`}
            </p>

            {/* 評論列表 — 先顯示 */}
            {reviews.length === 0 ? (
              <p style={{ margin:0, fontSize:'13px', color:T.textTertiary,
                textAlign:'center', padding:'16px 0' }}>
                還沒有評論，成為第一個！
              </p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {reviews.map(r => (
                  <div key={r.review_id}
                    style={{ padding:'12px 14px', backgroundColor:T.bgSubtle,
                      borderRadius:'10px' }}>
                    <div style={{ display:'flex', alignItems:'center',
                      justifyContent:'space-between', marginBottom:'6px' }}>
                      <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
                        <div style={{ width:'26px', height:'26px', borderRadius:'50%',
                          backgroundColor:T.accent, display:'flex', alignItems:'center',
                          justifyContent:'center', color:'white', fontSize:'11px', fontWeight:600 }}>
                          {(r.users?.nickname || '?')[0].toUpperCase()}
                        </div>
                        <span style={{ fontSize:'13px', fontWeight:500, color:T.textPrimary }}>
                          {r.users?.nickname || '匿名'}
                        </span>
                      </div>
                      <Stars value={r.rating} readonly />
                    </div>
                    {r.content && (
                      <p style={{ margin:0, fontSize:'13px', color:T.textSecondary, lineHeight:1.6 }}>
                        {r.content}
                      </p>
                    )}
                    <p style={{ margin:'6px 0 0', fontSize:'11px', color:T.textTertiary }}>
                      {new Date(r.created_at).toLocaleDateString('zh-TW')}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* 新增評論表單 — 評論列表之後 */}
            {currentUser && !submitted && (
              <div style={{ padding:'14px', backgroundColor:T.bgSubtle,
                borderRadius:'10px', display:'flex', flexDirection:'column', gap:'10px',
                border:`1px solid ${T.border}` }}>
                <p style={{ margin:0, fontSize:'12px', fontWeight:500, color:T.textSecondary }}>
                  {currentUser.nickname}，分享心得
                </p>
                <Stars value={myRating} onChange={setMyRating} />
                <textarea
                  value={myContent}
                  onChange={e => setMyContent(e.target.value)}
                  placeholder="使用心得（選填）"
                  rows={3}
                  style={{ width:'100%', boxSizing:'border-box',
                    border:`1px solid ${T.border}`, borderRadius:'8px',
                    padding:'10px 12px', fontSize:'13px', color:T.textPrimary,
                    backgroundColor:T.bgSurface, resize:'none', outline:'none',
                    fontFamily:'"DM Sans","Noto Sans TC",sans-serif', lineHeight:1.5 }}
                />
                <button
                  onClick={handleSubmit}
                  disabled={!myRating || submitting}
                  style={{ alignSelf:'flex-end',
                    backgroundColor: myRating ? T.accent : T.border,
                    color:'white', border:'none', borderRadius:'999px',
                    padding:'8px 20px', fontSize:'13px', fontWeight:500,
                    cursor: myRating ? 'pointer' : 'not-allowed' }}>
                  {submitting ? '送出中...' : '送出評論'}
                </button>
              </div>
            )}

            {submitted && (
              <p style={{ margin:0, fontSize:'13px', color:T.accent }}>✓ 評論已送出！</p>
            )}

            {!currentUser && (
              <p style={{ margin:0, fontSize:'12px', color:T.textTertiary }}>登入後才能評論</p>
            )}
          </div>
        </div>
      </div>
    </>,
    document.body   // ← 掛到 body，完全脫離任何父層
  );
}