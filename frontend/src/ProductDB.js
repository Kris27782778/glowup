import { useState, useEffect } from 'react';

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

const CATEGORIES  = ['化妝品', '保養品'];
const SKIN_TYPES  = ['油性肌', '乾性肌', '混合性肌', '敏感性肌', '中性肌'];
const MAKEUP_EFFECTS   = ['保濕', '控油', '舒緩修復'];
const SKINCARE_EFFECTS = ['保濕', '控油', '舒緩修復', '抗痘', '去角質'];
const MAKEUP_ITEMS    = ['粉底液', '遮瑕', '防曬'];
const SKINCARE_ITEMS  = ['化妝水', '乳液', '霜'];

function ProductDB() {
  const [category,  setCategory]  = useState(null);
  const [skinType,  setSkinType]  = useState(null);
  const [effect,    setEffect]    = useState(null);
  const [item,      setItem]      = useState(null);
  const [search,    setSearch]    = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [products,    setProducts]    = useState([]);
  const [loading,     setLoading]     = useState(false);

  const itemOptions = category === '化妝品' ? MAKEUP_ITEMS : SKINCARE_ITEMS;
  const hasFilter   = category || skinType || effect || item;
  const activeTags  = [category, item, skinType, effect].filter(Boolean);
  const itemMap = {
  '粉底液': '粉底液',
  '遮瑕':   '遮瑕',
  '防曬':   '防曬',
  '化妝水': '化妝水',
  '乳液':   '乳液',
  '霜':     '霜',
};

useEffect(() => {
  fetchProducts();
}, [category, item, skinType, effect]); // ← 加上 skinType, effect

const fetchProducts = async () => {
  if (!category && !item) { setProducts([]); return; }
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (category)  params.append('category', category);
    if (item)      params.append('sub_category', itemMap[item] || item);
    if (skinType)  params.append('skin_type', skinType);   // ← 新增
    if (effect)    params.append('effect', effect);         // ← 新增

    const res  = await fetch(`http://localhost:5001/api/products?${params}`);
    const data = await res.json();
    setProducts(Array.isArray(data) ? data : []);
  } catch (err) {
    console.error('撈取產品失敗', err);
    setProducts([]);
  } finally {
    setLoading(false);
  }
};



  const clearAll = () => {
    setCategory(null); setSkinType(null); setEffect(null); setItem(null);
  };

  return (
    <div style={styles.page}>
      {/* 搜尋 Hero */}
      <div style={styles.searchHero}>
        <p style={styles.heroEyebrow}>INGREDIENT LIBRARY</p>
        <h1 style={styles.heroTitle}>產品資料庫</h1>
        <p style={styles.heroSub}>依膚質、功效找到真正適合你的產品</p>
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
            placeholder="搜尋產品、成分、功效…"
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
            <p style={styles.filterTitle}>探索領域</p>
            <div style={styles.filterGroup}>
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  style={{ ...styles.filterChip, ...(category === cat ? styles.filterChipActive : {}) }}
                  onClick={() => { setCategory(category === cat ? null : cat); setItem(null); }}
                >
                  {cat === '化妝品' ? '💄 ' : '🧴 '}{cat}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterDivider} />

          <div style={styles.filterSection}>
            <p style={styles.filterTitle}>適合膚質</p>
            <div style={styles.filterGroup}>
              {SKIN_TYPES.map(s => (
                <button
                  key={s}
                  style={{ ...styles.filterChip, ...(skinType === s ? styles.filterChipActive : {}) }}
                  onClick={() => setSkinType(skinType === s ? null : s)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={styles.filterDivider} />

          <div style={styles.filterSection}>
            <p style={styles.filterTitle}>功效</p>
            <div style={styles.filterGroup}>
             {(category === '化妝品' ? MAKEUP_EFFECTS : SKINCARE_EFFECTS).map(e => (
                <button
                  key={e}
                  style={{ ...styles.filterChip, ...(effect === e ? styles.filterChipActive : {}) }}
                  onClick={() => setEffect(effect === e ? null : e)}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {category && (
            <>
              <div style={styles.filterDivider} />
              <div style={styles.filterSection}>
                <p style={styles.filterTitle}>品項</p>
                <div style={styles.filterGroup}>
                  {itemOptions.map(i => (
                    <button
                      key={i}
                      style={{ ...styles.filterChip, ...(item === i ? styles.filterChipActive : {}) }}
                      onClick={() => setItem(item === i ? null : i)}
                    >
                      {i}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {hasFilter && (
            <button style={styles.clearBtn} onClick={clearAll}>
              清除所有篩選
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
                  <p style={styles.emptyTitle}>載入中...</p>
                </div>
              ) : products.length === 0 ? (
                <div style={styles.emptyState}>
                  <p style={styles.emptyTitle}>找不到符合條件的產品</p>
                  <p style={styles.emptySub}>試試調整篩選條件</p>
                </div>
              ) : (
                <div style={styles.productGrid}>
                  {products.map(p => (
                    <div key={p.product_id} style={styles.productCard}>
                      <p style={styles.productBrand}>{p.brand}</p>
                      <p style={styles.productName}>{p.name}</p>
                      <p style={styles.productSub}>{p.sub_category}</p>
                      {(skinType || effect) && (
                      <p style={styles.productScore}>推薦分數：{p.score} 分</p>
                      )}
                      <div style={styles.ingredientRow}>
                        {p.product_ingredients?.map(pi => (
                          <span key={pi.ingredient_id} style={styles.conditionTag}>
                            {pi.ingredients?.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div style={styles.emptyState}>
              <p style={styles.emptyTitle}>從左側設定篩選條件</p>
              <p style={styles.emptySub}>選擇探索領域、膚質、功效，找到最適合你的產品</p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

const styles = {
  page: {
    paddingTop: '64px',
    backgroundColor: T.bgBase,
    minHeight: '100vh',
  },
  productScore: {
  fontSize: '12px',
  color: T.accent,
  fontWeight: 'bold',
  margin: 0,
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
    backgroundColor: T.bgSurface,
    borderRadius: '12px',
    border: `1px solid ${T.border}`,
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
    color: T.textTertiary,
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
    color: T.textSecondary,
    backgroundColor: 'transparent',
    border: `1px solid ${T.border}`,
    borderRadius: '999px',
    padding: '5px 12px',
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  filterChipActive: {
    backgroundColor: 'rgba(196,137,122,0.1)',
    borderColor: T.accent,
    color: T.accent,
    fontWeight: 500,
  },
  filterDivider: {
    height: '1px',
    backgroundColor: T.border,
  },
  clearBtn: {
    marginTop: '16px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: T.textTertiary,
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
    color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: `1px solid rgba(196,137,122,0.25)`,
    borderRadius: '999px',
    padding: '4px 12px',
  },
  comingSoon: {
    backgroundColor: T.bgSurface,
    borderRadius: '12px',
    border: `1px solid ${T.border}`,
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
    color: T.textPrimary,
    margin: 0,
  },
  comingSoonSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.textTertiary,
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
    color: T.textSecondary,
    backgroundColor: T.bgSubtle,
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
    color: T.textPrimary,
    margin: 0,
  },
  emptySub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.textTertiary,
    margin: 0,
    textAlign: 'center',
  },
   productGrid: {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
  gap: '16px',
},
productCard: {
  backgroundColor: T.bgSurface,
  borderRadius: '12px',
  border: `1px solid ${T.border}`,
  padding: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
},
productBrand: {
  fontSize: '11px',
  fontWeight: 500,
  color: T.textTertiary,
  margin: 0,
  textTransform: 'uppercase',
},
productName: {
  fontSize: '17px',
  color: T.textPrimary,
  margin: 0,
},
productSub: {
  fontSize: '12px',
  color: T.accent,
  margin: 0,
},
ingredientRow: {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '4px',
  marginTop: '6px',
},
};

export default ProductDB;

