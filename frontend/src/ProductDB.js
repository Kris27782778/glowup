import { useState, useEffect, useRef } from 'react';
import { useLang } from './hooks/useLang';
import API_BASE from './config';
import ProductPopover from './components/ProductPopover'; //

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

useEffect(() => {
  skipNextPageEffect.current = true;
  setPage(1);
  fetchProducts(1);
}, [category, item, skinType, effect, finish, coverage]); // eslint-disable-line react-hooks/exhaustive-deps

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
        <aside style={styles.sidebar}>

          <div style={styles.filterSection}>
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
        <main style={styles.results}>
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
                  <p style={styles.resultCount}>
                    {t('共')} {totalCount} {t('項結果')}
                    {totalPages > 1 && `，第 ${page} / ${totalPages} 頁`}
                  </p>
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
                        }}
                        onMouseLeave={e => {
                          e.currentTarget.style.boxShadow = 'none';
                          e.currentTarget.style.transform = 'translateY(0)';
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
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>{t('從左側設定篩選條件')}</p>
              <p style={styles.emptySub}>{t('選擇探索領域、膚質、功效，找到最適合你的產品')}</p>
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

