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

const CATEGORIES   = ['化妝品', '保養品'];
const SKIN_TYPES   = ['油性肌', '乾性肌', '混合性肌', '敏感性肌', '中性肌'];
const EFFECTS      = ['保濕', '控油', '舒緩修復', '抗痘', '去角質', '美白', '抗老'];
const MAKEUP_ITEMS  = ['粉底液', '遮瑕膏', '防曬乳', '蜜粉', '腮紅', '眼影'];
const SKINCARE_ITEMS = ['化妝水', '精華液', '乳液', '面霜', '面膜', '眼霜'];


/* ── 全域 CSS（keyframes + hover，inline style 無法做到）── */
const CSS = `
  .fchip {
    font-family: "DM Sans", "Noto Sans TC", sans-serif;
    font-size: 13px;
    color: ${T.textSecondary};
    background: transparent;
    border: 1px solid ${T.border};
    border-radius: 999px;
    padding: 5px 12px;
    cursor: pointer;
    transition: color 140ms, background-color 140ms, border-color 140ms,
                transform 140ms cubic-bezier(0.34,1.56,0.64,1), box-shadow 140ms;
    display: inline-flex;
    align-items: center;
    gap: 5px;
    position: relative;
    user-select: none;
  }
  .fchip:hover {
    background-color: rgba(196,137,122,0.07);
    border-color: ${T.accent};
    color: ${T.textPrimary};
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(196,137,122,0.15);
  }
  .fchip:active {
    transform: scale(0.93) translateY(0);
    box-shadow: none;
  }
  .fchip-on {
    background-color: rgba(196,137,122,0.12);
    border-color: ${T.accent};
    color: ${T.accent};
    font-weight: 500;
    animation: chipBounce 240ms cubic-bezier(0.34,1.56,0.64,1);
  }
  .fchip-on:hover {
    background-color: rgba(196,137,122,0.2);
    color: ${T.accent};
  }
  .fchip-check {
    font-size: 10px;
    opacity: 0.85;
    animation: checkPop 200ms cubic-bezier(0.34,1.56,0.64,1);
  }
  .active-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-family: "DM Sans", "Noto Sans TC", sans-serif;
    font-size: 12px;
    font-weight: 500;
    color: ${T.accent};
    background-color: rgba(196,137,122,0.1);
    border: 1px solid rgba(196,137,122,0.25);
    border-radius: 999px;
    padding: 4px 8px 4px 12px;
    animation: tagSlideIn 220ms cubic-bezier(0.34,1.56,0.64,1) forwards;
  }
  .active-tag-x {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: none;
    background: rgba(196,137,122,0.2);
    color: ${T.accent};
    font-size: 10px;
    line-height: 1;
    cursor: pointer;
    padding: 0;
    transition: background-color 120ms, transform 120ms;
    flex-shrink: 0;
  }
  .active-tag-x:hover {
    background: rgba(196,137,122,0.4);
    transform: scale(1.15);
  }
  .section-reveal {
    animation: sectionDown 280ms cubic-bezier(0.22,1,0.36,1);
  }
  .filter-count {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    background: ${T.accent};
    color: #fff;
    font-size: 9px;
    font-weight: 600;
    font-family: "DM Sans", sans-serif;
    margin-left: 4px;
    animation: checkPop 200ms cubic-bezier(0.34,1.56,0.64,1);
  }
  @keyframes chipBounce {
    0%   { transform: scale(0.88); }
    60%  { transform: scale(1.06); }
    100% { transform: scale(1); }
  }
  @keyframes checkPop {
    0%   { transform: scale(0); opacity: 0; }
    70%  { transform: scale(1.3); }
    100% { transform: scale(1); opacity: 1; }
  }
  @keyframes tagSlideIn {
    from { transform: translateX(-10px) scale(0.85); opacity: 0; }
    to   { transform: translateX(0) scale(1);        opacity: 1; }
  }
  @keyframes sectionDown {
    from { transform: translateY(-10px); opacity: 0; }
    to   { transform: translateY(0);     opacity: 1; }
  }
`;

/* ── FilterChip 元件 ── */
function FilterChip({ label, active, onToggle }) {
  return (
    <button
      className={`fchip${active ? ' fchip-on' : ''}`}
      onClick={onToggle}
      type="button"
    >
      {active && <span className="fchip-check">✓</span>}
      {label}
    </button>
  );
}

function ProductDB() {
  const [category,    setCategory]    = useState(null);
  const [skinType,    setSkinType]    = useState(null);
  const [effect,      setEffect]      = useState(null);
  const [item,        setItem]        = useState(null);
  const [search,      setSearch]      = useState('');
  const [searchFocus, setSearchFocus] = useState(false);

  /* 注入 CSS */
  useEffect(() => {
    const el = document.createElement('style');
    el.id = 'productdb-css';
    el.textContent = CSS;
    if (!document.getElementById('productdb-css')) document.head.appendChild(el);
    return () => el.remove();
  }, []);

  const itemOptions = category === '化妝品' ? MAKEUP_ITEMS : SKINCARE_ITEMS;

  /* 已選標籤（含移除 handler）*/
  const activeTags = [
    category && { label: category, remove: () => { setCategory(null); setItem(null); } },
    item      && { label: item,     remove: () => setItem(null) },
    skinType  && { label: skinType, remove: () => setSkinType(null) },
    effect    && { label: effect,   remove: () => setEffect(null) },
  ].filter(Boolean);

  const hasFilter = activeTags.length > 0;

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
                <FilterChip
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
                <p style={styles.comingSoonTitle}>篩選條件已設定</p>
                <p style={styles.comingSoonSub}>產品資料庫串接後端後將顯示推薦結果</p>
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
    maxWidth: '300px',
    lineHeight: 1.6,
  },
};

export default ProductDB;
