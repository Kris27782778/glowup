import { useNavigate } from 'react-router-dom';

const T = {
  bgSubtle:      '#F0EBE7',
  bgBase:        '#F7F4F2',
  accent:        '#C4897A',
  accentDark:    '#9E6457',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  border:        '#E5DDD9',
};

function Hero() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>
      {/* Hero Banner */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <p style={styles.eyebrow}>GLOW UP · 輔大美妝交流平台</p>
          <h1 style={styles.heroTitle}>
            了解你擦在<br />臉上的一切
          </h1>
          <p style={styles.heroSub}>
            成分透明 · 社群共學 · 為輔大學生打造的美妝知識平台
          </p>
          <div style={styles.heroCtas}>
            <button style={styles.ctaPrimary} onClick={() => navigate('/products')}>
              開始探索成分
            </button>
            <button style={styles.ctaGhost} onClick={() => navigate('/register')}>
              加入社群
            </button>
          </div>
        </div>
        {/* 裝飾圓 */}
        <div style={styles.deco1} />
        <div style={styles.deco2} />
      </section>

      {/* 特色區塊 */}
      <section style={styles.features}>
        {FEATURES.map((f, i) => (
          <div key={i} style={{ ...styles.featureCard, ...(i === FEATURES.length - 1 ? { borderRight: 'none' } : {}) }}>
            <span style={styles.featureIcon}>{f.icon}</span>
            <p style={styles.featureTitle}>{f.title}</p>
            <p style={styles.featureDesc}>{f.desc}</p>
          </div>
        ))}
      </section>

      {/* 分隔標語 */}
      <section style={styles.banner}>
        <p style={styles.bannerText}>
          清晰就是美 &nbsp;·&nbsp; CLARITY IS BEAUTY
        </p>
      </section>
    </div>
  );
}

const FEATURES = [
  {
    icon: '⚗️',
    title: '成分知識庫',
    desc: '查詢任何成分的安全等級、功效說明與使用注意，讓你的保養有所依據。',
  },
  {
    icon: '💬',
    title: '社群討論',
    desc: '與輔大同學分享保養心得、提問、推薦好物，建立屬於你的美妝圈。',
  },
  {
    icon: '🔍',
    title: '產品資料庫',
    desc: '依膚質、功效篩選適合你的化妝品與保養品，找到真正適合自己的選擇。',
  },
];

const styles = {
  page: {
    paddingTop: '64px',
    backgroundColor: '#F7F4F2',
  },
  /* Hero */
  hero: {
    position: 'relative',
    minHeight: '520px',
    background: `linear-gradient(135deg, ${T.bgSubtle} 0%, ${T.bgBase} 60%)`,
    display: 'flex',
    alignItems: 'center',
    overflow: 'hidden',
    padding: '80px 40px',
  },
  heroInner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '600px',
  },
  eyebrow: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.16em',
    color: T.accent,
    margin: '0 0 20px 0',
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '56px',
    fontWeight: 300,
    fontStyle: 'italic',
    lineHeight: 1.15,
    color: T.textPrimary,
    margin: '0 0 24px 0',
  },
  heroSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    color: T.textSecondary,
    lineHeight: 1.7,
    margin: '0 0 36px 0',
  },
  heroCtas: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
  },
  ctaPrimary: {
    height: '44px',
    padding: '0 28px',
    backgroundColor: T.accent,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 150ms, transform 150ms',
    letterSpacing: '0.04em',
  },
  ctaGhost: {
    height: '44px',
    padding: '0 24px',
    backgroundColor: 'transparent',
    color: T.textPrimary,
    border: `1px solid ${T.border}`,
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    cursor: 'pointer',
    transition: 'background-color 150ms',
  },
  /* 裝飾圓 */
  deco1: {
    position: 'absolute',
    right: '-60px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.15)`,
    pointerEvents: 'none',
  },
  deco2: {
    position: 'absolute',
    right: '80px',
    top: '50%',
    transform: 'translateY(-50%)',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.1)`,
    pointerEvents: 'none',
  },
  /* 特色 */
  features: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    borderTop: `1px solid ${T.border}`,
    borderBottom: `1px solid ${T.border}`,
  },
  featureCard: {
    padding: '48px 40px',
    borderRight: `1px solid ${T.border}`,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  featureIcon: {
    fontSize: '24px',
    lineHeight: 1,
  },
  featureTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: 0,
  },
  featureDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.textSecondary,
    lineHeight: 1.7,
    margin: 0,
  },
  /* 標語 */
  banner: {
    backgroundColor: T.textPrimary,
    padding: '32px 40px',
    textAlign: 'center',
  },
  bannerText: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '18px',
    fontWeight: 300,
    fontStyle: 'italic',
    letterSpacing: '0.16em',
    color: 'rgba(247,244,242,0.6)',
    margin: 0,
  },
};

export default Hero;
