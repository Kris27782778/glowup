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
const EFFECTS     = ['保濕', '控油', '舒緩修復', '抗痘', '去角質', '美白', '抗老'];
const MAKEUP_ITEMS    = ['粉底液', '遮瑕膏', '防曬乳', '蜜粉', '腮紅', '眼影'];
const SKINCARE_ITEMS  = ['化妝水', '精華液', '乳液', '面霜', '面膜', '眼霜'];

function ProductDB() {
  const [category,    setCategory]    = useState(null);
  const [skinType,    setSkinType]    = useState(null);
  const [effect,      setEffect]      = useState(null);
  const [item,        setItem]        = useState(null);
  const [search,      setSearch]      = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  const itemOptions = category === '化妝品' ? MAKEUP_ITEMS : SKINCARE_ITEMS;
  const hasFilter   = category || skinType || effect || item;
  const activeTags  = [category, item, skinType, effect].filter(Boolean);

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
        <div style={{ ...styles.searchBox, ...(searchFocus ? styles.searchBoxFocus : {}) }}>
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
          {search && (
            <button style={styles.searchClear} onClick={() => setSearch('')} type="button">✕</button>
          )}
        </div>
      </div>

      {/* 主體：篩選 + 結果 */}
      <div style={styles.body}>

        {/* 側欄篩選 */}
        <aside style={styles.sidebar}>

          <div style={styles.filterSection}>
            <p style={styles.filterTitle}>
              探索領域
              {category && <span className="filter-count" key={category}>1</span>}
            </p>
            <div style={styles.filterGroup}>
              {CATEGORIES.map(cat => (
                <FilterChip
                  key={cat}
                  label={cat}
                  active={category === cat}
                  onToggle={() => { setCategory(category === cat ? null : cat); setItem(null); }}
                />
              ))}
            </div>
          </div>

          <div style={styles.filterDivider} />

          <div style={styles.filterSection}>
            <p style={styles.filterTitle}>
              適合膚質
              {skinType && <span className="filter-count" key={skinType}>1</span>}
            </p>
            <div style={styles.filterGroup}>
              {SKIN_TYPES.map(s => (
                <FilterChip
                  key={s}
                  label={s}
                  active={skinType === s}
                  onToggle={() => setSkinType(skinType === s ? null : s)}
                />
              ))}
            </div>
          </div>

          <div style={styles.filterDivider} />

          <div style={styles.filterSection}>
            <p style={styles.filterTitle}>
              功效
              {effect && <span className="filter-count" key={effect}>1</span>}
            </p>
            <div style={styles.filterGroup}>
              {EFFECTS.map(e => (
                <button
                  key={e}
                  label={e}
                  active={effect === e}
                  onToggle={() => setEffect(effect === e ? null : e)}
                />
              ))}
            </div>
          </div>

          {/* 品項：選了分類才出現，帶展開動畫 */}
          {category && (
            <div key={category}>
              <div style={styles.filterDivider} />
              <div className="section-reveal" style={styles.filterSection}>
                <p style={styles.filterTitle}>
                  品項
                  {item && <span className="filter-count" key={item}>1</span>}
                </p>
                <div style={styles.filterGroup}>
                  {itemOptions.map(i => (
                    <FilterChip
                      key={i}
                      label={i}
                      active={item === i}
                      onToggle={() => setItem(item === i ? null : i)}
                    />
                  ))}
                </div>
              </div>
            </div>
          )}

          {hasFilter && (
            <button style={styles.clearBtn} onClick={clearAll} type="button">
              清除所有篩選 ({activeTags.length})
            </button>
          )}
        </aside>

        {/* 結果區 */}
        <main style={styles.results}>
          {hasFilter ? (
            <>
              {/* 已選標籤列 */}
              <div style={styles.activeTagRow}>
                {activeTags.map(tag => (
                  <span key={tag.label} className="active-tag">
                    {tag.label}
                    <button
                      className="active-tag-x"
                      onClick={tag.remove}
                      type="button"
                      aria-label={`移除 ${tag.label}`}
                    >
                      ✕
                    </button>
                  </span>
                ))}
                <button style={styles.clearAllInline} onClick={clearAll} type="button">
                  全部清除
                </button>
              </div>

              {/* 待串接後端提示 */}
              <div style={styles.comingSoon}>
                <div style={styles.comingSoonIcon}>🔍</div>
                <p style={styles.comingSoonTitle}>篩選條件已設定</p>
                <p style={styles.comingSoonSub}>
                  產品資料庫串接後端後將顯示推薦結果
                </p>
                <div style={styles.conditionSummary}>
                  {activeTags.map(tag => (
                    <span key={tag} style={styles.conditionTag}>{tag}</span>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div style={styles.emptyState}>
              <div style={styles.emptyIcon}>✦</div>
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
    transition: 'border-color 200ms, background-color 200ms',
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
  },
  searchClear: {
    background: 'none',
    border: 'none',
    color: 'rgba(247,244,242,0.4)',
    fontSize: '13px',
    cursor: 'pointer',
    padding: '0 2px',
    flexShrink: 0,
    transition: 'color 120ms',
  },
  body: {
    display: 'flex',
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '40px',
    gap: '40px',
    alignItems: 'flex-start',
  },
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
    display: 'flex',
    alignItems: 'center',
  },
  filterGroup: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
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
    transition: 'color 120ms',
  },
  results: {
    flex: 1,
  },
  activeTagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
    alignItems: 'center',
    marginBottom: '24px',
  },
  clearAllInline: {
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: T.textTertiary,
    cursor: 'pointer',
    padding: '4px 8px',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
    transition: 'color 120ms',
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
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    minHeight: '320px',
  },
  emptyIcon: {
    fontSize: '28px',
    color: T.accentLight,
    lineHeight: 1,
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
};

export default ProductDB;
