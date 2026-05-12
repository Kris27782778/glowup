import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLang } from './hooks/useLang';
import API_BASE from './config';
import ProductPopover from './components/ProductPopover';
import ReportModal from './components/ReportModal';

const T = {
  bgBase:        '#F7F4F2',
  bgSurface:     '#FFFFFF',
  bgSubtle:      '#F0EBE7',
  bgInverse:     '#1C1917',
  accent:        '#C4897A',
  accentLight:   '#E8C4BA',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  textInverse:   '#F7F4F2',
  border:        '#E5DDD9',
};

const CATEGORIES  = ['保養品', '化妝品'];
const SKIN_TYPES  = ['油性肌', '乾性肌', '混合性肌', '敏感性肌', '中性肌'];
const SKINCARE_EFFECTS = ['保濕', '控油', '舒緩修復', '抗痘', '去角質'];
const MAKEUP_ITEMS     = ['粉底液', '遮瑕'];
const SKINCARE_ITEMS   = ['化妝水', '乳液', '霜'];
const FINISH_OPTIONS   = ['霧面', '自然', '光澤'];
const COVERAGE_OPTIONS = ['輕薄', '中等', '全遮蓋'];

function ProductDB() {
  const { t } = useLang();
  const location = useLocation();
  const [category,  setCategory]  = useState(null);
  const [skinType,  setSkinType]  = useState(null);
  const [effect,    setEffect]    = useState(null);
  const [item,      setItem]      = useState(null);
  const [finish,    setFinish]    = useState(null);
  const [coverage,  setCoverage]  = useState(null);
  const [search,    setSearch]    = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [products,    setProducts]    = useState([]);
  const [totalCount,  setTotalCount]  = useState(0);
  const [loading,     setLoading]     = useState(false);
  const [page,        setPage]        = useState(1);
  const [favorites,   setFavorites]   = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [reportTarget,    setReportTarget]    = useState(null); // { id, type }
  const [hoveredCard,     setHoveredCard]     = useState(null);
  const [sort,            setSort]            = useState('score'); // 'score' | 'newest' | 'name_asc'
  const [showScoreInfo,   setShowScoreInfo]   = useState(false);
  const [tourStep,        setTourStep]        = useState(null); // null | 0 | 1 | 2
  const tourRefs = useRef([]);
  const skipNextPageEffect = useRef(false);
  const PAGE_SIZE = 10;

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();
  const userId = currentUser?.user_id;

  useEffect(() => {
    if (!userId) return;
    fetch(`${API_BASE}/api/wishlist/${userId}`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data)) setFavorites(data.map(w => w.product_id));
      })
      .catch(() => {});
  }, [userId]);

  const toggleFavorite = async (productId) => {
    if (!currentUser?.user_id) return;
    const isFaved = favorites.includes(productId);
    setFavorites(prev =>
      isFaved ? prev.filter(id => id !== productId) : [...prev, productId]
    );
    try {
      await fetch(API_BASE + '/api/wishlist', {
        method: isFaved ? 'DELETE' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: currentUser.user_id, product_id: productId }),
      });
    } catch {
      setFavorites(prev =>
        isFaved ? [...prev, productId] : prev.filter(id => id !== productId)
      );
    }
  };

  const itemOptions   = category === '化妝品' ? MAKEUP_ITEMS : SKINCARE_ITEMS;
  const hasFilter     = category || skinType || effect || item || finish || coverage || search.trim();
  const activeTags    = [category, item, skinType, effect, finish, coverage].filter(Boolean);

  const totalPages    = Math.ceil(totalCount / PAGE_SIZE);
  const pagedProducts = products; // backend returns exactly one page
  const itemMap = {
  '粉底液': '粉底液',
  '遮瑕':   '遮瑕',
  '化妝水': '化妝水',
  '乳液':   '乳液',
  '霜':     '霜',
};

// 從 Dashboard 帶來的產品直接開 Popover
useEffect(() => {
  if (location.state?.openProduct) {
    setSelectedProduct(location.state.openProduct);
    window.history.replaceState({}, '');
  }
}, []); // eslint-disable-line react-hooks/exhaustive-deps

useEffect(() => {
  skipNextPageEffect.current = true;
  setPage(1);
  fetchProducts(1);
}, [category, item, skinType, effect, finish, coverage, sort]); // eslint-disable-line react-hooks/exhaustive-deps

useEffect(() => {
  const timer = setTimeout(() => {
    skipNextPageEffect.current = true;
    setPage(1);
    fetchProducts(1);
  }, 400);
  return () => clearTimeout(timer);
}, [search]); // eslint-disable-line react-hooks/exhaustive-deps

// 分頁按鈕觸發：page 改變時重新撈取（filter/search 重置 page 時跳過，避免重複請求）
useEffect(() => {
  if (skipNextPageEffect.current) { skipNextPageEffect.current = false; return; }
  if (!category && !item && !search.trim()) return;
  fetchProducts(page);
}, [page]); // eslint-disable-line react-hooks/exhaustive-deps

const fetchProducts = async (pageNum = page) => {
  if (!category && !item && !search.trim()) { setProducts([]); setTotalCount(0); return; }
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (category)      params.append('category', category);
    if (item)          params.append('sub_category', itemMap[item] || item);
    if (skinType)      params.append('skin_type', skinType);
    if (effect)        params.append('effect', effect);
    if (finish)        params.append('finish', finish);
    if (coverage)      params.append('coverage', coverage);
    if (search.trim()) params.append('search', search.trim());
    params.append('sort', sort);
    params.append('page', pageNum);
    params.append('limit', PAGE_SIZE);

    const res  = await fetch(`${API_BASE}/api/products?${params}`);
    const data = await res.json();
    setProducts(Array.isArray(data?.data) ? data.data : []);
    setTotalCount(typeof data?.total === 'number' ? data.total : 0);
  } catch (err) {
    console.error('撈取產品失敗', err);
    setProducts([]);
    setTotalCount(0);
  } finally {
    setLoading(false);
  }
};

  const clearAll = () => {
    setCategory(null); setSkinType(null); setEffect(null); setItem(null);
    setFinish(null); setCoverage(null);
  };

  return (
    <div style={styles.page}>
      {/* 搜尋 Hero */}
      <div style={styles.searchHero}>
        <p style={styles.heroEyebrow}>INGREDIENT LIBRARY</p>
        <h1 style={styles.heroTitle}>{t('產品資料庫')}</h1>
        <p style={styles.heroSub}>{t('依膚質、功效找到真正適合你的產品')}</p>
        <div style={{
          ...styles.searchBox,
          ...(searchFocus ? styles.searchBoxFocus : {}),
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
            <circle cx="7" cy="7" r="5" stroke="rgba(247,244,242,0.5)" strokeWidth="1.5"/>
            <path d="M10.5 10.5L13.5 13.5" stroke="rgba(247,244,242,0.5)" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <input
            style={styles.searchInput}
            type="text"
            placeholder={t('搜尋產品、成分、功效…')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            onFocus={() => setSearchFocus(true)}
            onBlur={() => setSearchFocus(false)}
          />
        </div>
      </div>

      {/* 主體：篩選 + 結果 */}
      <div style={styles.body}>
        {/* 側欄篩選 */}
        <aside style={styles.sidebar} ref={el => (tourRefs.current[1] = el)}>

          <div style={styles.filterSection} ref={el => (tourRefs.current[0] = el)}>
            <p style={styles.filterTitle}>{t('探索領域')}</p>
            <div style={styles.filterGroup}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  style={{ ...styles.filterChip, ...(category === cat ? styles.filterChipActive : {}) }}
                  onClick={() => { setCategory(category === cat ? null : cat); setItem(null); setSkinType(null); setEffect(null); setFinish(null); setCoverage(null); }}
                >
                  {cat === '化妝品' ? '💄 ' : '🧴 '}{t(cat)}
                </button>
              ))}
            </div>
          </div>

          {category && (
            <>
              <div style={styles.filterDivider} />
              <div style={styles.filterSection}>
                <p style={styles.filterTitle}>{t('品項')}</p>
                <div style={styles.filterGroup}>
                  {itemOptions.map(i => (
                    <button
                      key={i}
                      style={{ ...styles.filterChip, ...(item === i ? styles.filterChipActive : {}) }}
                      onClick={() => { setItem(item === i ? null : i); setFinish(null); setCoverage(null); }}
                    >
                      {t(i)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {category !== '化妝品' && (
            <>
              <div style={styles.filterDivider} />
              <div style={styles.filterSection}>
                <p style={styles.filterTitle}>{t('適合膚質')}</p>
                <div style={styles.filterGroup}>
                  {SKIN_TYPES.map(s => (
                    <button
                      key={s}
                      style={{ ...styles.filterChip, ...(skinType === s ? styles.filterChipActive : {}) }}
                      onClick={() => setSkinType(skinType === s ? null : s)}
                    >
                      {t(s)}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          <div style={styles.filterDivider} />

          {category === '化妝品' ? (
            <>
              <div style={styles.filterSection}>
                <p style={styles.filterTitle}>妝感</p>
                <div style={styles.filterGroup}>
                  {FINISH_OPTIONS.map(f => (
                    <button
                      key={f}
                      style={{ ...styles.filterChip, ...(finish === f ? styles.filterChipActive : {}) }}
                      onClick={() => setFinish(finish === f ? null : f)}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div style={styles.filterDivider} />
              <div style={styles.filterSection}>
                <p style={styles.filterTitle}>遮蓋度</p>
                <div style={styles.filterGroup}>
                  {COVERAGE_OPTIONS.map(c => (
                    <button
                      key={c}
                      style={{ ...styles.filterChip, ...(coverage === c ? styles.filterChipActive : {}) }}
                      onClick={() => setCoverage(coverage === c ? null : c)}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={styles.filterSection}>
              <p style={styles.filterTitle}>{t('功效')}</p>
              <div style={styles.filterGroup}>
                {SKINCARE_EFFECTS.map(e => (
                  <button
                    key={e}
                    style={{ ...styles.filterChip, ...(effect === e ? styles.filterChipActive : {}) }}
                    onClick={() => setEffect(effect === e ? null : e)}
                  >
                    {t(e)}
                  </button>
                ))}
              </div>
            </div>
          )}

          {hasFilter && (
            <button style={styles.clearBtn} onClick={clearAll}>
              {t('清除所有篩選')}
            </button>
          )}
        </aside>

        {/* 結果區 */}
        <main style={styles.results} ref={el => (tourRefs.current[2] = el)}>
          {hasFilter ? (
            <>
              {/* 已選標籤 */}
              <div style={styles.activeTagRow}>
                {activeTags.map(tag => (
                  <span key={tag} style={styles.activeTag}>{tag}</span>
                ))}
              </div>

              {/* 產品清單 */}
              {loading ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyTitle}>{t('載入中...')}</p>
                </div>
              ) : products.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyTitle}>{t('找不到符合條件的產品')}</p>
                  <p style={styles.emptySub}>{t('試試調整篩選條件')}</p>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', marginBottom: '4px' }}>
                    <p style={{ ...styles.resultCount, margin: 0 }}>
                      {t('共')} {totalCount} {t('項結果')}
                      {totalPages > 1 && `，第 ${page} / ${totalPages} 頁`}
                    </p>
                    <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                      {[
                        { key: 'score',    label: '推薦分數' },
                        { key: 'newest',   label: '最新'     },
                        { key: 'name_asc', label: '名稱 A-Z' },
                      ].map(opt => (
                        <button
                          key={opt.key}
                          onClick={() => setSort(opt.key)}
                          style={{
                            padding: '4px 10px', borderRadius: '999px', fontSize: '11px',
                            fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
                            cursor: 'pointer', letterSpacing: '0.02em',
                            border: sort === opt.key ? `1px solid ${T.accent}` : `1px solid ${T.border}`,
                            backgroundColor: sort === opt.key ? 'rgba(196,137,122,0.1)' : 'transparent',
                            color: sort === opt.key ? T.accent : T.textTertiary,
                            transition: 'all 150ms',
                          }}
                        >{t(opt.label) || opt.label}</button>
                      ))}
                      <div style={{ position: 'relative' }}>
                        <button
                          onMouseEnter={() => setShowScoreInfo(true)}
                          onMouseLeave={() => setShowScoreInfo(false)}
                          style={{
                            width: '18px', height: '18px', borderRadius: '50%', fontSize: '11px',
                            fontFamily: '"DM Sans",sans-serif', fontWeight: 600,
                            border: `1px solid ${T.border}`, background: 'none',
                            color: T.textTertiary, cursor: 'default', lineHeight: 1,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                          }}
                        >?</button>
                        {showScoreInfo && (
                          <div style={{
                            position: 'absolute', right: 0, top: '24px', zIndex: 100,
                            width: '220px', padding: '12px 14px',
                            background: T.bgSurface, border: `1px solid ${T.border}`,
                            borderRadius: '10px', boxShadow: '0 4px 16px rgba(28,25,23,0.10)',
                          }}>
                            <p style={{ margin: '0 0 6px', fontSize: '11px', fontWeight: 600, color: T.textPrimary, fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>
                              推薦分數說明
                            </p>
                            <p style={{ margin: 0, fontSize: '11px', color: T.textSecondary, lineHeight: 1.65, fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>
                              基礎分 3 分，依你選擇的<strong>膚質</strong>與<strong>功效</strong>篩選條件，累加產品中每個成分的對應評分。分數反映該產品對目前篩選條件的契合程度，未選篩選時所有產品同分。
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={styles.productGrid}>
                    {pagedProducts.map(p => {
                      const scoreNum = parseFloat(p.score);
                      const scorePct = isNaN(scoreNum) ? 0 : Math.min(100, Math.max(0, scoreNum * 10));
                      const scoreColor = scorePct >= 80 ? '#7BAF7B' : scorePct >= 50 ? T.accent : T.textTertiary;
                      return (
                        <div
                        key={p.product_id}
                        style={{ ...styles.productCard, position: 'relative', cursor: 'pointer' }}
                        onClick={() => setSelectedProduct(p)}
                        onMouseEnter={e => {
                          e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.10)';
                          e.currentTarget.style.transform = 'translateY(-3px)';
                          setHoveredCard(p.product_id);
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
                          setHoveredCard(null);
                        }}
                      >
                          {/* 品牌 + 品項 */}
                          <div style={styles.cardHeader}>
                            <span style={styles.productBrand}>{p.brand}</span>
                            <span style={styles.productSubBadge}>{p.sub_category}</span>
                          </div>

                          {/* 產品名稱 */}
                          <p style={styles.productName}>{p.name}</p>

                          {/* 推薦分數進度條 */}
                          {(skinType || effect) && !isNaN(scoreNum) && p.category !== '化妝品' && (
                            <div style={styles.scoreSection}>
                              <div style={styles.scoreLabelRow}>
                                <span style={styles.scoreLabel}>{t('推薦分數')}</span>
                                <span style={{ ...styles.scoreValue, color: scoreColor }}>
                                  {scoreNum.toFixed(1)}
                                </span>
                              </div>
                              <div style={styles.progressTrack}>
                                <div style={{
                                  ...styles.progressFill,
                                  width: `${scorePct}%`,
                                  backgroundColor: scoreColor,
                                }} />
                              </div>
                            </div>
                          )}

                          {/* 成分標籤 */}
                          {p.product_ingredients?.length > 0 && p.category !== '化妝品' && (
                            <div style={styles.ingredientRow}>
                              {p.product_ingredients.map(pi => (
                                <span key={pi.ingredient_id} style={styles.conditionTag}>
                                  {pi.ingredients?.name}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* 收藏愛心 */}
                          <button
                          style={styles.favoriteBtn}
                          onClick={e => { e.stopPropagation(); toggleFavorite(p.product_id); }}
                            title={favorites.includes(p.product_id) ? '取消收藏' : '加入收藏'}
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill={favorites.includes(p.product_id) ? T.accent : 'none'} stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </button>
                          {/* 檢舉 */}
                          <button
                            style={{
                              ...styles.reportBtn,
                              opacity: hoveredCard === p.product_id ? 1 : 0,
                              pointerEvents: hoveredCard === p.product_id ? 'auto' : 'none',
                            }}
                            onClick={e => { e.stopPropagation(); setReportTarget({ id: p.product_id, type: 'product' }); }}
                          >
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                              <line x1="4" y1="22" x2="4" y2="15"/>
                            </svg>
                            檢舉
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* 分頁列 */}
                  {totalPages > 1 && (
                    <div style={styles.pagination}>
                      <button
                        style={{ ...styles.pageBtn, ...(page === 1 ? styles.pageBtnDisabled : {}) }}
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                      >‹</button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
                        <button
                          key={n}
                          style={{ ...styles.pageBtn, ...(n === page ? styles.pageBtnActive : {}) }}
                          onClick={() => setPage(n)}
                        >{n}</button>
                      ))}

                      <button
                        style={{ ...styles.pageBtn, ...(page === totalPages ? styles.pageBtnDisabled : {}) }}
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                      >›</button>
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <div style={styles.onboardWrap}>
              <h2 style={styles.onboardTitle}>{t('探索你的完美美妝')}</h2>

              <button
                onClick={() => setTourStep(0)}
                style={{
                  marginBottom: '8px',
                  padding: '10px 24px',
                  background: T.accent,
                  color: '#fff',
                  border: 'none',
                  borderRadius: '999px',
                  fontSize: '13px',
                  cursor: 'pointer',
                  fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
                  letterSpacing: '0.04em',
                }}
              >
                開始引導 →
              </button>

              <div style={styles.onboardSteps}>
                {[
                  {
                    num: '01',
                    icon: (
                      <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                        <rect x="2" y="6" width="11" height="16" rx="3" stroke={T.accent} strokeWidth="1.3"/>
                        <rect x="15" y="6" width="11" height="16" rx="3" stroke={T.accent} strokeWidth="1.3" strokeDasharray="3 2"/>
                        <path d="M7.5 12h4M7.5 15h2.5" stroke={T.accent} strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    ),
                    title: t('選擇領域'),
                  },
                  {
                    num: '02',
                    icon: (
                      <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                        <line x1="4" y1="9"  x2="24" y2="9"  stroke={T.accent} strokeWidth="1.3" strokeLinecap="round"/>
                        <line x1="4" y1="14" x2="24" y2="14" stroke={T.accent} strokeWidth="1.3" strokeLinecap="round"/>
                        <line x1="4" y1="19" x2="24" y2="19" stroke={T.accent} strokeWidth="1.3" strokeLinecap="round"/>
                        <circle cx="10" cy="9"  r="2.5" fill={T.bgBase} stroke={T.accent} strokeWidth="1.3"/>
                        <circle cx="18" cy="14" r="2.5" fill={T.bgBase} stroke={T.accent} strokeWidth="1.3"/>
                        <circle cx="10" cy="19" r="2.5" fill={T.bgBase} stroke={T.accent} strokeWidth="1.3"/>
                      </svg>
                    ),
                    title: t('設定條件'),
                  },
                  {
                    num: '03',
                    icon: (
                      <svg width="30" height="30" viewBox="0 0 28 28" fill="none">
                        <rect x="3" y="5" width="22" height="14" rx="3" stroke={T.accent} strokeWidth="1.3"/>
                        <path d="M8 11h5M8 14.5h3" stroke={T.accent} strokeWidth="1.2" strokeLinecap="round"/>
                        <rect x="16" y="8" width="5" height="8" rx="1.5" fill={T.accent} fillOpacity="0.15" stroke={T.accent} strokeWidth="1.2"/>
                        <path d="M9 22l10 0" stroke={T.accent} strokeWidth="1.2" strokeLinecap="round"/>
                      </svg>
                    ),
                    title: t('查看推薦'),
                  },
                ].map((step, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                      <div style={styles.onboardCircle}>{step.icon}</div>
                      <p style={styles.onboardNum}>{step.num}</p>
                      <p style={styles.onboardCardTitle}>{step.title}</p>
                    </div>
                    {i < 2 && (
                      <svg width="36" height="12" viewBox="0 0 24 10" fill="none" style={{ marginBottom: '52px', flexShrink: 0 }}>
                        <path d="M0 5h20M16 1l4 4-4 4" stroke={T.accentLight} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
      {/* 產品詳細 Modal */}
      {selectedProduct && (
        <ProductPopover
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          currentUser={currentUser}
        />
      )}
      {reportTarget && (
        <ReportModal
          targetType={reportTarget.type}
          targetId={reportTarget.id}
          onClose={() => setReportTarget(null)}
        />
      )}
      {tourStep !== null && (
        <TourOverlay
          step={tourStep}
          targetRefs={tourRefs}
          onNext={() => tourStep < TOUR_STEPS.length - 1 ? setTourStep(tourStep + 1) : setTourStep(null)}
          onSkip={() => setTourStep(null)}
        />
      )}
    </div>
  );
}

// ── 引導遊覽 Overlay ───────────────────────────────────────────────
const TOUR_STEPS = [
  { title: '選擇探索領域', desc: '先決定要找保養品還是化妝品，後續篩選條件會自動切換。' },
  { title: '設定篩選條件', desc: '選擇膚質、功效或妝感，條件越多推薦越精準。' },
  { title: '查看推薦清單', desc: '篩選後結果出現在這裡，依成分評分由高到低排列。' },
];

function TourOverlay({ step, targetRefs, onNext, onSkip }) {
  const [rect, setRect] = useState(null);

  useEffect(() => {
    const el = targetRefs.current?.[step];
    if (!el) return;
    const update = () => setRect(el.getBoundingClientRect());
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, [step, targetRefs]);

  if (!rect) return null;

  const PAD = 10;
  const TW  = 230;
  const info = TOUR_STEPS[step];

  const spotLeft = rect.left - PAD;
  const spotTop  = rect.top  - PAD;
  const spotW    = rect.width  + PAD * 2;
  const spotH    = rect.height + PAD * 2;

  // tooltip: 右邊放得下就右邊，否則左邊
  const spaceRight = window.innerWidth - rect.right - PAD - 20;
  const tooltipLeft = spaceRight >= TW
    ? rect.right + PAD + 12
    : rect.left  - PAD - 12 - TW;
  const tooltipTop  = Math.min(rect.top, window.innerHeight - 200);

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 1000 }}
      onClick={onSkip}
    >
      {/* spotlight */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          left:   spotLeft,
          top:    spotTop,
          width:  spotW,
          height: spotH,
          borderRadius: '12px',
          boxShadow: '0 0 0 9999px rgba(28,25,23,0.6)',
          zIndex: 1001,
          pointerEvents: 'none',
          transition: 'left 350ms ease, top 350ms ease, width 350ms ease, height 350ms ease',
        }}
      />

      {/* tooltip */}
      <div
        onClick={e => e.stopPropagation()}
        style={{
          position: 'fixed',
          left:    tooltipLeft,
          top:     tooltipTop,
          width:   TW,
          zIndex:  1002,
          background: '#FFFFFF',
          borderRadius: '14px',
          padding: '18px 20px',
          boxShadow: '0 12px 40px rgba(28,25,23,0.14)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
          transition: 'left 350ms ease, top 350ms ease',
        }}
      >
        <span style={{ fontSize: '10px', letterSpacing: '0.14em', color: T.accent }}>
          {step + 1} / {TOUR_STEPS.length}
        </span>
        <p style={{ margin: 0, fontSize: '14px', fontWeight: 500, color: T.textPrimary }}>
          {info.title}
        </p>
        <p style={{ margin: 0, fontSize: '12px', color: T.textSecondary, lineHeight: 1.65 }}>
          {info.desc}
        </p>
        <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
          <button
            onClick={onSkip}
            style={{ flex: 1, padding: '8px', background: 'none', border: `1px solid ${T.border}`,
              borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: T.textSecondary }}
          >
            跳過
          </button>
          <button
            onClick={onNext}
            style={{ flex: 2, padding: '8px', background: T.accent, border: 'none',
              borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#fff' }}
          >
            {step < TOUR_STEPS.length - 1 ? '下一步 →' : '完成 ✓'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: '64px',
    backgroundColor: 'var(--bg-base)',
    minHeight: '100vh',
  },
  /* 搜尋 Hero */
  searchHero: {
    backgroundColor: T.bgInverse,
    padding: '56px 40px 48px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  heroEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.16em',
    color: T.accent,
    margin: 0,
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '48px',
    fontWeight: 300,
    color: T.textInverse,
    margin: 0,
    letterSpacing: '0.04em',
  },
  heroSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'rgba(247,244,242,0.5)',
    margin: '0 0 16px 0',
  },
  searchBox: {
    width: '100%',
    maxWidth: '560px',
    height: '52px',
    backgroundColor: 'rgba(247,244,242,0.08)',
    border: '1px solid rgba(247,244,242,0.15)',
    borderRadius: '999px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: '12px',
    transition: 'border-color 150ms, background-color 150ms',
  },
  searchBoxFocus: {
    backgroundColor: 'rgba(247,244,242,0.12)',
    borderColor: 'rgba(196,137,122,0.6)',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    color: T.textInverse,
    '::placeholder': { color: 'rgba(247,244,242,0.4)' },
  },
  /* 主體 */
  body: {
    display: 'flex',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px',
    gap: '40px',
    alignItems: 'flex-start',
  },
  /* 篩選側欄 */
  sidebar: {
    width: '260px',
    flexShrink: 0,
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    padding: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    position: 'sticky',
    top: '80px',
  },
  filterSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '16px 0',
  },
  filterTitle: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.1em',
    color: 'var(--text-tertiary)',
    margin: 0,
    textTransform: 'uppercase',
  },
  filterGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  filterChip: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    padding: '5px 12px',
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  filterChipActive: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#FFFFFF',
    fontWeight: 500,
  },
  filterDivider: {
    height: '1px',
    backgroundColor: 'var(--border)',
  },
  clearBtn: {
    marginTop: '16px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    padding: '4px 0',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  /* 結果區 */
  results: {
    flex: 1,
  },
  activeTagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    marginBottom: '24px',
  },
  activeTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--accent)',
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: '1px solid rgba(196,137,122,0.25)',
    borderRadius: '999px',
    padding: '4px 12px',
  },
  comingSoon: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    padding: '56px 40px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  },
  comingSoonIcon: {
    fontSize: '32px',
    lineHeight: 1,
    marginBottom: '4px',
  },
  comingSoonTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
  },
  comingSoonSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  conditionSummary: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    marginTop: '8px',
    justifyContent: 'center',
  },
  conditionTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: '999px',
    padding: '3px 10px',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '10px',
    minHeight: '320px',
  },
  emptyTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
  },
  emptySub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-tertiary)',
    margin: 0,
    textAlign: 'center',
  },
  onboardWrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '64px 24px 56px',
    gap: '6px',
  },
  onboardEyebrow: {
    margin: 0,
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 400,
    letterSpacing: '0.18em',
    color: T.accent,
    opacity: 0.8,
  },
  onboardTitle: {
    margin: '0 0 40px',
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '26px',
    fontWeight: 400,
    color: T.textPrimary,
  },
  onboardSteps: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  onboardCircle: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.35)`,
    backgroundColor: T.bgSurface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  onboardNum: {
    margin: 0,
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 400,
    letterSpacing: '0.16em',
    color: T.accent,
    opacity: 0.6,
  },
  onboardCardTitle: {
    margin: 0,
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 400,
    color: T.textSecondary,
  },
  resultCount: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    marginBottom: '16px',
  },
  productGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '20px',
  },
  productCard: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '16px',
    border: '1px solid var(--border)',
    padding: '24px 24px 52px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'box-shadow 200ms, transform 200ms',
    cursor: 'pointer',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
  },
  productBrand: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
    letterSpacing: '0.08em',
  },
  productSubBadge: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--accent)',
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: '1px solid rgba(196,137,122,0.2)',
    borderRadius: '999px',
    padding: '2px 10px',
    whiteSpace: 'nowrap',
  },
  productName: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '18px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.4,
  },
  scoreSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '4px',
  },
  scoreLabelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  scoreLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.06em',
  },
  scoreValue: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    fontWeight: 600,
  },
  progressTrack: {
    width: '100%',
    height: '5px',
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: '999px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: '999px',
    transition: 'width 600ms ease',
  },
  favoriteBtn: {
    position: 'absolute',
    bottom: '16px',
    right: '16px',
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    border: `1px solid ${T.border}`,
    backgroundColor: T.bgSurface,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    transition: 'border-color 150ms, transform 150ms',
  },
  reportBtn: {
    position: 'absolute',
    bottom: '14px',
    left: '14px',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '4px 10px',
    border: `1px solid rgba(196,137,122,0.4)`,
    borderRadius: '999px',
    backgroundColor: 'rgba(255,255,255,0.82)',
    backdropFilter: 'blur(6px)',
    color: T.textSecondary,
    fontSize: '11px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    cursor: 'pointer',
    letterSpacing: '0.02em',
    transition: 'opacity 180ms ease, background-color 150ms',
    boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
  },
  ingredientRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginTop: '4px',
    paddingTop: '10px',
    borderTop: '1px solid var(--border)',
  },
  pagination: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    gap: '6px',
    marginTop: '36px',
    paddingBottom: '8px',
  },
  pageBtn: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    minWidth: '36px',
    height: '36px',
    padding: '0 10px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  pageBtnActive: {
    backgroundColor: T.accent,
    borderColor: T.accent,
    color: '#FFFFFF',
  },
  pageBtnDisabled: {
    opacity: 0.35,
    cursor: 'not-allowed',
  },
};

export default ProductDB;

