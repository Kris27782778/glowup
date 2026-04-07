import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

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
  border:        '#E5DDD9',
};

const TABS = ['帖子', '問答', '收藏', '成分筆記'];

const SKIN_LABELS = {
  oily:       '油性肌',
  dry:        '乾性肌',
  combo:      '混合性肌',
  combo_dry:  '混合性肌・偏乾',
  combo_oily: '混合性肌・偏油',
  normal:     '中性肌',
  sensitive:  '敏感性肌',
};

function Dashboard() {
  const [user, setUser]     = useState(null);
  const [tab, setTab]       = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    setUser(JSON.parse(stored));
  }, [navigate]);

  if (!user) return null;

  const skinLabel = SKIN_LABELS[user.skin_type] || user.skin_type || '尚未設定';
  const initial   = user.nickname?.[0]?.toUpperCase() || '?';

  return (
    <div style={styles.page}>
      {/* Hero 區 */}
      <div style={styles.hero}>
        <div style={styles.heroOverlay} />
        <div style={styles.heroContent}>
          <div style={styles.avatar}>{initial}</div>
        </div>
      </div>

      {/* 個人資訊 */}
      <div style={styles.profileSection}>
        <div style={styles.profileMeta}>
          <div>
            <h1 style={styles.nickname}>{user.nickname}</h1>
            <p style={styles.dept}>{user.department_grade}</p>
            <p style={styles.email}>{user.email}</p>
          </div>
          <div style={styles.profileActions}>
            <button
              style={styles.editBtn}
              onClick={() => navigate('/login')}
            >
              編輯個人資料
            </button>
          </div>
        </div>

        {/* 膚質 & 快速數據 */}
        <div style={styles.statsRow}>
          <div style={styles.statItem}>
            <span style={styles.statNum}>0</span>
            <span style={styles.statLabel}>貼文</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNum}>0</span>
            <span style={styles.statLabel}>追蹤者</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            <span style={styles.statNum}>0</span>
            <span style={styles.statLabel}>追蹤中</span>
          </div>
          <div style={styles.statDivider} />
          <div style={styles.statItem}>
            {user.skin_type ? (
              <span style={styles.skinBadge}>{skinLabel}</span>
            ) : (
              <Link to="#" style={styles.skinSetLink}>設定膚質 →</Link>
            )}
            <span style={styles.statLabel}>膚質</span>
          </div>
        </div>
      </div>

      {/* 內容 Tabs */}
      <div style={styles.tabContainer}>
        <div style={styles.tabBar}>
          {TABS.map((t, i) => (
            <button
              key={t}
              style={{ ...styles.tabBtn, ...(tab === i ? styles.tabBtnActive : {}) }}
              onClick={() => setTab(i)}
            >
              {t}
              {tab === i && <span style={styles.tabUnderline} />}
            </button>
          ))}
        </div>

        <div style={styles.tabContent}>
          {tab === 0 && <EmptyState icon="✍️" text="還沒有貼文" sub="分享你的保養心得吧" />}
          {tab === 1 && <EmptyState icon="❓" text="還沒有問答記錄" sub="向社群提出你的疑問" />}
          {tab === 2 && <EmptyState icon="🔖" text="收藏夾是空的" sub="收藏你喜歡的貼文與成分" />}
          {tab === 3 && <EmptyState icon="⚗️" text="成分筆記尚未建立" sub="標記成分、記錄你的使用心得" />}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ icon, text, sub }) {
  return (
    <div style={emptyStyles.wrap}>
      <span style={emptyStyles.icon}>{icon}</span>
      <p style={emptyStyles.text}>{text}</p>
      <p style={emptyStyles.sub}>{sub}</p>
    </div>
  );
}

const emptyStyles = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '64px 24px',
    gap: '8px',
  },
  icon: { fontSize: '32px', lineHeight: 1 },
  text: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: 0,
  },
  sub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.textTertiary,
    margin: 0,
  },
};

const styles = {
  page: {
    paddingTop: '64px',
    backgroundColor: T.bgBase,
    minHeight: '100vh',
  },
  /* Hero */
  hero: {
    height: '200px',
    background: `linear-gradient(135deg, #2C2420 0%, ${T.bgInverse} 100%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  heroOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, transparent 40%, rgba(28,25,23,0.5))',
  },
  heroContent: {
    position: 'absolute',
    bottom: '-40px',
    left: '40px',
  },
  avatar: {
    width: '80px',
    height: '80px',
    borderRadius: '50%',
    backgroundColor: T.accent,
    border: '3px solid #FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '32px',
    fontWeight: 400,
    color: '#FFFFFF',
  },
  /* 個人資訊 */
  profileSection: {
    backgroundColor: T.bgSurface,
    padding: '52px 40px 0',
    borderBottom: `1px solid ${T.border}`,
  },
  profileMeta: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  nickname: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '28px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: '0 0 4px 0',
  },
  dept: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.textSecondary,
    margin: '0 0 2px 0',
  },
  email: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.textTertiary,
    margin: 0,
  },
  profileActions: {
    display: 'flex',
    gap: '8px',
  },
  editBtn: {
    height: '36px',
    padding: '0 18px',
    backgroundColor: 'transparent',
    border: `1px solid ${T.border}`,
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.textPrimary,
    cursor: 'pointer',
    transition: 'background-color 150ms',
  },
  /* 統計列 */
  statsRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '0',
    paddingBottom: '0',
    flexWrap: 'wrap',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    padding: '16px 28px',
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
    fontSize: '12px',
    color: T.textTertiary,
    letterSpacing: '0.04em',
  },
  statDivider: {
    width: '1px',
    height: '32px',
    backgroundColor: T.border,
  },
  skinBadge: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.1)',
    padding: '3px 10px',
    borderRadius: '999px',
  },
  skinSetLink: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.accent,
    textDecoration: 'none',
  },
  /* Tabs */
  tabContainer: {
    backgroundColor: T.bgSurface,
    marginTop: '24px',
    borderTop: `1px solid ${T.border}`,
  },
  tabBar: {
    display: 'flex',
    borderBottom: `1px solid ${T.border}`,
    padding: '0 40px',
  },
  tabBtn: {
    position: 'relative',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: T.textTertiary,
    background: 'none',
    border: 'none',
    padding: '14px 20px',
    cursor: 'pointer',
    transition: 'color 150ms',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  tabBtnActive: {
    color: T.textPrimary,
    fontWeight: 500,
  },
  tabUnderline: {
    position: 'absolute',
    bottom: '-1px',
    left: '12px',
    right: '12px',
    height: '2px',
    backgroundColor: T.accent,
    borderRadius: '999px',
  },
  tabContent: {
    minHeight: '320px',
  },
};

export default Dashboard;
