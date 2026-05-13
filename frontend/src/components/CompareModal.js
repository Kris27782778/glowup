import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import API_BASE from '../config';

const T = {
  bgBase:        '#F7F4F2',
  bgSurface:     '#FFFFFF',
  bgSubtle:      '#F0EBE7',
  accent:        '#C4897A',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  border:        '#E5DDD9',
  good:          '#7BAF7B',
};

function Stars({ value }) {
  return (
    <div style={{ display: 'flex', gap: '2px' }}>
      {[1,2,3,4,5].map(n => (
        <span key={n} style={{ fontSize: '13px', color: n <= value ? '#F5A623' : T.border, lineHeight: 1 }}>★</span>
      ))}
    </div>
  );
}

function SectionLabel({ children }) {
  return (
    <p style={{
      margin: '0 0 10px',
      fontSize: '10px', fontWeight: 600,
      color: T.textTertiary,
      letterSpacing: '0.12em', textTransform: 'uppercase',
      fontFamily: '"DM Sans",sans-serif',
    }}>{children}</p>
  );
}

function Card({ highlight, children, style }) {
  return (
    <div style={{
      padding: '16px',
      backgroundColor: T.bgSurface,
      borderRadius: '12px',
      border: `1px solid ${highlight ? T.accent : T.border}`,
      ...style,
    }}>
      {children}
    </div>
  );
}

export default function CompareModal({ products, onClose }) {
  const [reviewsMap, setReviewsMap] = useState({});

  useEffect(() => {
    products.forEach(p => {
      fetch(`${API_BASE}/api/reviews/${p.product_id}`)
        .then(r => r.json())
        .then(d => Array.isArray(d) && setReviewsMap(prev => ({ ...prev, [p.product_id]: d })))
        .catch(() => {});
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const handler = e => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const isSkincare = products[0]?.category !== '化妝品';

  // 找出所有產品共同有的成分
  const ingredientSets = products.map(p =>
    new Set((p.product_ingredients || []).map(pi => pi.ingredients?.name).filter(Boolean))
  );
  const sharedIngredients = new Set(
    ingredientSets.length > 1
      ? [...ingredientSets[0]].filter(name => ingredientSets.every(s => s.has(name)))
      : []
  );

  // 找最高分 / 最高評分（用來標示「最高」）
  const scores = products.map(p => parseFloat(p.score) || 0);
  const bestScore = Math.max(...scores);

  const avgRatings = products.map(p => {
    const revs = reviewsMap[p.product_id] || [];
    return revs.length ? revs.reduce((s, r) => s + r.rating, 0) / revs.length : null;
  });
  const validRatings = avgRatings.filter(r => r !== null);
  const bestRating = validRatings.length ? Math.max(...validRatings) : null;

  return ReactDOM.createPortal(
    <>
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 1100,
          backgroundColor: 'rgba(28,25,23,0.55)',
        }}
      />
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '5vh', left: '50%',
          transform: 'translateX(-50%)',
          width: '90vw', maxWidth: '900px',
          maxHeight: '88vh',
          zIndex: 1101,
          backgroundColor: T.bgBase,
          borderRadius: '20px',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(28,25,23,0.18)',
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px 28px',
          borderBottom: `1px solid ${T.border}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
          backgroundColor: T.bgSurface,
        }}>
          <div>
            <p style={{ margin: 0, fontSize: '10px', color: T.accent, letterSpacing: '0.16em', fontFamily: '"DM Sans",sans-serif' }}>
              COMPARE
            </p>
            <h2 style={{
              margin: '3px 0 0', fontSize: '20px', fontWeight: 400,
              fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
              color: T.textPrimary,
            }}>
              產品比較
            </h2>
          </div>

          {isSkincare && sharedIngredients.size > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: T.accent }} />
              <span style={{ fontSize: '12px', color: T.textSecondary, fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>
                共同成分已標示
              </span>
            </div>
          )}

          <button
            onClick={onClose}
            style={{
              width: '32px', height: '32px', borderRadius: '50%',
              border: `1px solid ${T.border}`, backgroundColor: T.bgSurface,
              cursor: 'pointer', fontSize: '14px', color: T.textSecondary,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              lineHeight: 1,
            }}
          >✕</button>
        </div>

        {/* 比較欄位 */}
        <div style={{
          flex: 1, overflowY: 'auto',
          padding: '28px',
          display: 'grid',
          gridTemplateColumns: `repeat(${products.length}, 1fr)`,
          gap: '20px',
          alignItems: 'start',
        }}>
          {products.map((p, idx) => {
            const reviews = reviewsMap[p.product_id] || [];
            const avgRating = avgRatings[idx];
            const scoreNum = parseFloat(p.score);
            const hasScore = isSkincare && !isNaN(scoreNum);
            const scorePct = hasScore ? Math.min(100, Math.max(0, scoreNum * 10)) : 0;
            const scoreColor = scorePct >= 80 ? T.good : scorePct >= 50 ? T.accent : T.textTertiary;
            const isBestScore = hasScore && scoreNum === bestScore && bestScore > 3 && products.length > 1;
            const isBestRating = avgRating !== null && avgRating === bestRating && products.length > 1;

            return (
              <div key={p.product_id} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

                {/* 品牌 / 品名 */}
                <Card>
                  <span style={{
                    fontSize: '10px', fontWeight: 600, color: T.textTertiary,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    fontFamily: '"DM Sans",sans-serif',
                  }}>
                    {p.brand}
                  </span>
                  <p style={{
                    margin: '6px 0 10px',
                    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
                    fontSize: '18px', fontWeight: 400,
                    color: T.textPrimary, lineHeight: 1.35,
                  }}>
                    {p.name}
                  </p>
                  <span style={{
                    fontSize: '11px', color: T.accent,
                    backgroundColor: 'rgba(196,137,122,0.1)',
                    border: '1px solid rgba(196,137,122,0.2)',
                    borderRadius: '999px', padding: '2px 10px',
                  }}>
                    {p.sub_category}
                  </span>
                </Card>

                {/* 推薦分數（保養品） */}
                {isSkincare && (
                  <Card highlight={isBestScore}>
                    <SectionLabel>推薦分數</SectionLabel>
                    {hasScore ? (
                      <>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginBottom: '10px' }}>
                          <span style={{
                            fontSize: '32px', fontWeight: 700,
                            color: scoreColor,
                            fontFamily: '"DM Sans",sans-serif', lineHeight: 1,
                          }}>
                            {scoreNum.toFixed(1)}
                          </span>
                          {isBestScore && (
                            <span style={{ fontSize: '11px', color: T.accent, fontWeight: 500 }}>最高</span>
                          )}
                        </div>
                        <div style={{ height: '5px', backgroundColor: T.bgSubtle, borderRadius: '999px', overflow: 'hidden' }}>
                          <div style={{
                            width: `${scorePct}%`, height: '100%',
                            backgroundColor: scoreColor, borderRadius: '999px',
                            transition: 'width 600ms ease',
                          }} />
                        </div>
                      </>
                    ) : (
                      <span style={{ fontSize: '13px', color: T.textTertiary }}>—（篩選後才會顯示）</span>
                    )}
                  </Card>
                )}

                {/* 妝感 / 遮蓋度（化妝品） */}
                {!isSkincare && (p.finish || p.coverage) && (
                  <Card>
                    {p.finish && (
                      <div style={{ marginBottom: p.coverage ? '12px' : 0 }}>
                        <SectionLabel>妝感</SectionLabel>
                        <span style={{ fontSize: '15px', color: T.textPrimary, fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>
                          {p.finish}
                        </span>
                      </div>
                    )}
                    {p.coverage && (
                      <div>
                        <SectionLabel>遮蓋度</SectionLabel>
                        <span style={{ fontSize: '15px', color: T.textPrimary, fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>
                          {p.coverage}
                        </span>
                      </div>
                    )}
                  </Card>
                )}

                {/* 用戶評分 */}
                <Card highlight={isBestRating}>
                  <SectionLabel>用戶評分</SectionLabel>
                  {avgRating !== null ? (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '6px' }}>
                        <span style={{
                          fontSize: '32px', fontWeight: 700,
                          color: T.textPrimary,
                          fontFamily: '"DM Sans",sans-serif', lineHeight: 1,
                        }}>
                          {avgRating.toFixed(1)}
                        </span>
                        {isBestRating && (
                          <span style={{ fontSize: '11px', color: T.accent, fontWeight: 500 }}>最高</span>
                        )}
                      </div>
                      <Stars value={Math.round(avgRating)} />
                      <p style={{ margin: '8px 0 0', fontSize: '12px', color: T.textTertiary, fontFamily: '"DM Sans",sans-serif' }}>
                        {reviews.length} 則評論
                      </p>
                    </>
                  ) : (
                    <span style={{ fontSize: '13px', color: T.textTertiary }}>尚無評論</span>
                  )}
                </Card>

                {/* 成分標籤（保養品） */}
                {isSkincare && p.product_ingredients?.length > 0 && (
                  <Card>
                    <SectionLabel>成分標籤</SectionLabel>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {p.product_ingredients.map(pi => {
                        const name = pi.ingredients?.name;
                        const isShared = sharedIngredients.has(name);
                        return (
                          <span key={pi.ingredient_id} style={{
                            fontSize: '12px', borderRadius: '999px', padding: '3px 10px',
                            backgroundColor: isShared ? 'rgba(196,137,122,0.12)' : T.bgSubtle,
                            color: isShared ? T.accent : T.textSecondary,
                            border: `1px solid ${isShared ? 'rgba(196,137,122,0.3)' : T.border}`,
                            fontWeight: isShared ? 500 : 400,
                            fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
                          }}>
                            {name}
                          </span>
                        );
                      })}
                    </div>
                  </Card>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </>,
    document.body
  );
}
