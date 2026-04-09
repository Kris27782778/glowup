import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from './hooks/useReveal';

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
  safe:          '#7BAE8A',
};

const SKIN_LABELS = {
  oily:       { label: '油性肌',       desc: '皮脂分泌旺盛，控油保濕為主' },
  dry:        { label: '乾性肌',       desc: '皮脂不足，加強保濕屏障' },
  combo:      { label: '混合性肌',     desc: 'T 區偏油，整體清爽保濕' },
  combo_dry:  { label: '混合性肌・偏乾', desc: 'T 區微出油，兩頰需加強補水' },
  combo_oily: { label: '混合性肌・偏油', desc: 'T 區大量出油，輕薄質地為主' },
  normal:     { label: '中性肌',       desc: '水油平衡，維持現有保養節奏' },
  sensitive:  { label: '敏感性肌',     desc: '屏障較弱，選擇成分單純配方' },
};

const TABS = [
  { label: '帖子' },
  { label: '問答' },
  { label: '收藏' },
  { label: '成分筆記' },
];

const EMPTY_STATE = [
  { title: '還沒有貼文',     sub: '分享你的保養心得，讓社群看見你的經驗' },
  { title: '還沒有問答記錄', sub: '向社群提出你的保養疑問' },
  { title: '收藏夾是空的',   sub: '收藏喜歡的貼文、成分與產品' },
  { title: '成分筆記尚未建立', sub: '標記你用過的成分，記錄使用心得' },
];

function Dashboard() {
  const [user, setUser] = useState(null);
  const [tab,  setTab]  = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  useReveal();

  if (!user) return null;

  const initial  = user.nickname?.[0]?.toUpperCase() || '?';
  const skinInfo = SKIN_LABELS[user.skin_type] || null;
  const skinLabel = skinInfo?.label || user.skin_type || null;

  return (
    <div style={styles.page}>

      {/* ══ Cover Hero ══ */}
      <div style={styles.cover}>
        <div style={styles.coverOverlay} />
        {/* 裝飾圓 */}
        <div style={styles.coverDeco1} />
        <div style={styles.coverDeco2} />
      </div>

      {/* ══ 主體：左欄 + 右欄 ══ */}
      <div style={styles.body}>

        {/* ── 左欄：個人資訊 ── */}
        <aside style={styles.sidebar}>

          {/* 頭像 */}
          <div style={styles.avatarWrap} className="g-scale-in gd-1">
            <div style={styles.avatar}>{initial}</div>
          </div>

          {/* 名稱區 */}
          <div style={styles.nameBlock} className="g-fade-up gd-2">
            <h1 style={styles.nickname}>{user.nickname}</h1>
            {skinLabel && (
              <span style={styles.skinBadge}>{skinLabel}</span>
            )}
          </div>

          {/* 基本資訊 */}
          <div style={styles.infoBlock} className="g-fade-up gd-3">
            {user.department_grade && (
              <div style={styles.infoRow}>
                <span style={styles.infoText}>{user.department_grade}</span>
              </div>
            )}
            {user.email && (
              <div style={styles.infoRow}>
                <span style={styles.infoText}>{user.email}</span>
              </div>
            )}
          </div>

          {/* 膚質卡 */}
          {skinInfo ? (
            <div style={styles.skinCard} className="g-reveal delay-1">
              <p style={styles.skinCardEyebrow}>我的膚質</p>
              <p style={styles.skinCardTitle}>{skinInfo.label}</p>
              <p style={styles.skinCardDesc}>{skinInfo.desc}</p>
              <button style={styles.skinRetakeBtn} onClick={() => navigate('#')}>
                重新測驗
              </button>
            </div>
          ) : (
            <div style={styles.skinCardEmpty} className="g-reveal delay-1">
              <p style={styles.skinCardEyebrow}>膚質尚未設定</p>
              <p style={styles.skinCardEmptyDesc}>完成膚質測驗，獲得個人化推薦</p>
              <button style={styles.skinTakeBtn} onClick={() => navigate('/register')}>
                開始測驗
              </button>
            </div>
          )}

          {/* 數據列 */}
          <div style={styles.statsCard} className="g-reveal delay-2">
            {[
              { num: '0', label: '貼文' },
              { num: '0', label: '追蹤者' },
              { num: '0', label: '追蹤中' },
            ].map((s, i, arr) => (
              <div key={s.label} style={styles.statItem}>
                <span style={styles.statNum}>{s.num}</span>
                <span style={styles.statLabel}>{s.label}</span>
                {i < arr.length - 1 && <div style={styles.statDivider} />}
              </div>
            ))}
          </div>

          {/* 操作按鈕 */}
          <div style={styles.actions}>
            <button style={styles.editBtn}>編輯個人資料</button>
            <button
              style={styles.logoutBtn}
              onClick={() => { localStorage.removeItem('user'); navigate('/'); }}
            >
              登出
            </button>
          </div>

        </aside>

        {/* ── 右欄：Tab 內容 ── */}
        <main style={styles.main}>

          {/* Tab 列 */}
          <div style={styles.tabBar}>
            {TABS.map((t, i) => (
              <button
                key={t.label}
                style={{ ...styles.tabBtn, ...(tab === i ? styles.tabBtnActive : {}) }}
                onClick={() => setTab(i)}
              >
                {t.label}
                {tab === i && <span style={styles.tabLine} />}
              </button>
            ))}
          </div>

          {/* 內容區：key 讓 tab 切換時重新掛載觸發動畫 */}
          <div style={styles.tabContent}>
            <div key={tab} className="g-tab-content">
              <EmptyState
                title={EMPTY_STATE[tab].title}
                sub={EMPTY_STATE[tab].sub}
              />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

function EmptyState({ title, sub }) {
  return (
    <div style={emptyStyle.wrap}>
      <p style={emptyStyle.title}>{title}</p>
      <p style={emptyStyle.sub}>{sub}</p>
    </div>
  );
}

const emptyStyle = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '360px',
    gap: '10px',
    padding: '40px',
  },
  iconWrap: {
    fontSize: '40px',
    lineHeight: 1,
    marginBottom: '8px',
    opacity: 0.5,
  },
  title: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: 0,
  },
  sub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.textTertiary,
    margin: 0,
    textAlign: 'center',
    maxWidth: '320px',
    lineHeight: 1.6,
  },
};

const styles = {
  page: {
    paddingTop: '64px',
    backgroundColor: T.bgBase,
    minHeight: '100vh',
  },

  /* Cover */
  cover: {
    height: '240px',
    background: `linear-gradient(135deg, #2C2118 0%, #1C1917 50%, #0F0C0A 100%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  coverOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, transparent 30%, rgba(28,25,23,0.6))',
  },
  coverDeco1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.1)',
    top: '-200px',
    right: '-100px',
    pointerEvents: 'none',
  },
  coverDeco2: {
    position: 'absolute',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.08)',
    bottom: '-100px',
    left: '20%',
    pointerEvents: 'none',
  },

  /* 主體雙欄 */
  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 40px 64px',
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
  },

  /* 左欄 */
  sidebar: {
    width: '280px',
    flexShrink: 0,
    marginTop: '-72px',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  avatarWrap: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  avatar: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    backgroundColor: T.accent,
    border: '4px solid #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '40px',
    fontWeight: 400,
    color: '#FFFFFF',
    boxShadow: '0 4px 16px rgba(28,25,23,0.12)',
  },
  nameBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '4px',
  },
  nickname: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '28px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: 0,
    lineHeight: 1.2,
  },
  skinBadge: {
    alignSelf: 'flex-start',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: '1px solid rgba(196,137,122,0.2)',
    padding: '3px 12px',
    borderRadius: '999px',
  },
  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  infoText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.textSecondary,
    lineHeight: 1.4,
  },

  /* 膚質卡 */
  skinCard: {
    backgroundColor: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skinCardEmpty: {
    backgroundColor: T.bgSurface,
    border: `1px dashed ${T.border}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skinCardEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    color: T.accent,
    margin: 0,
    textTransform: 'uppercase',
  },
  skinCardTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: 0,
  },
  skinCardDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: T.textSecondary,
    lineHeight: 1.6,
    margin: 0,
  },
  skinCardEmptyDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: T.textTertiary,
    lineHeight: 1.6,
    margin: 0,
  },
  skinRetakeBtn: {
    marginTop: '4px',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: T.accent,
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  skinTakeBtn: {
    marginTop: '4px',
    height: '34px',
    backgroundColor: T.accent,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },

  /* 數據 */
  statsCard: {
    backgroundColor: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderRadius: '12px',
    display: 'flex',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 8px',
    position: 'relative',
    gap: '4px',
  },
  statNum: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '28px',
    fontWeight: 400,
    color: T.textPrimary,
    lineHeight: 1,
  },
  statLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: T.textTertiary,
    letterSpacing: '0.04em',
  },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: '20%',
    height: '60%',
    width: '1px',
    backgroundColor: T.border,
  },

  /* 操作 */
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  editBtn: {
    height: '40px',
    backgroundColor: T.bgInverse,
    color: T.textInverse,
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  logoutBtn: {
    height: '40px',
    backgroundColor: 'transparent',
    color: T.textTertiary,
    border: `1px solid ${T.border}`,
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    cursor: 'pointer',
  },

  /* 右欄 */
  main: {
    flex: 1,
    marginTop: '24px',
    minWidth: 0,
  },
  tabBar: {
    display: 'flex',
    borderBottom: `1px solid ${T.border}`,
    backgroundColor: T.bgSurface,
    borderRadius: '12px 12px 0 0',
    overflow: 'hidden',
    padding: '0 8px',
  },
  tabBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: T.textTertiary,
    cursor: 'pointer',
    transition: 'color 150ms',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    color: T.textPrimary,
    fontWeight: 500,
  },
  tabIcon: {
    fontSize: '14px',
  },
  tabLine: {
    position: 'absolute',
    bottom: '-1px',
    left: '12px',
    right: '12px',
    height: '2px',
    backgroundColor: T.accent,
    borderRadius: '999px',
  },
  tabContent: {
    backgroundColor: T.bgSurface,
    borderRadius: '0 0 12px 12px',
    border: `1px solid ${T.border}`,
    borderTop: 'none',
    minHeight: '400px',
  },
};

export default Dashboard;
