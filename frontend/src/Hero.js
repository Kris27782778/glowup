import { useNavigate } from 'react-router-dom';

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

const FEATURES = [
  {
    num: '01',
    title: '成分知識庫',
    desc: '查詢任何保養成分的安全等級、功效與使用禁忌，讓每一步保養都有所依據。',
    cta: '探索成分庫',
    to: '/products',
  },
  {
    num: '02',
    title: '社群討論',
    desc: '與輔大同學分享真實的保養心得與使用評價，找到你信任的美妝參考。',
    cta: '加入討論',
    to: '#',
  },
  {
    num: '03',
    title: '膚質配對',
    desc: '完成膚質測驗，平台將依你的肌膚狀況推薦最合適的成分與產品。',
    cta: '開始測驗',
    to: '/register',
  },
];

const SKIN_TOPICS = [
  { tag: '油性肌', title: '控油不過度清潔：油肌保濕的正確方式', reads: '1.2k' },
  { tag: '敏感肌', title: '成分越少越好？敏感肌選品的五個原則', reads: '980' },
  { tag: '成分討論', title: '菸鹼醯胺與 A 醇能一起用嗎？', reads: '2.1k' },
  { tag: '混合性肌', title: 'T 區與兩頰分區保養的實際操作方式', reads: '756' },
];

function Hero() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* ══ HERO ══ */}
      <section style={styles.hero}>
        <div style={styles.heroInner}>
          <div style={styles.heroLeft}>
            <p style={styles.heroEyebrow}>輔仁大學 · 美妝知識平台</p>
            <h1 style={styles.heroTitle}>
              成分透明，<br />
              <em>才是真正的</em><br />
              美妝自由
            </h1>
            <p style={styles.heroDesc}>
              GLŌW 是專為輔大學生打造的美妝知識平台。<br />
              查成分、看評價、找同學討論，讓每一瓶都擦得安心。
            </p>
            <div style={styles.heroCtas}>
              <button style={styles.ctaPrimary} onClick={() => navigate('/register')}>
                立即加入
              </button>
              <button style={styles.ctaGhost} onClick={() => navigate('/products')}>
                探索成分庫 →
              </button>
            </div>
          </div>

          {/* 右側裝飾卡片 */}
          <div style={styles.heroRight}>
            <div style={styles.heroCard}>
              <p style={styles.cardLabel}>今日成分</p>
              <p style={styles.cardIngredient}>菸鹼醯胺</p>
              <p style={styles.cardEn}>Niacinamide</p>
              <div style={styles.safeBar}>
                <div style={styles.safeBarFill} />
              </div>
              <div style={styles.cardTags}>
                {['美白', '控油', '毛孔', '修護'].map(t => (
                  <span key={t} style={styles.cardTag}>{t}</span>
                ))}
              </div>
              <p style={styles.cardDesc}>
                多效合一的明星成分，適合大多數膚質，
                與 A 醇搭配需注意濃度與順序。
              </p>
            </div>
            {/* 浮動小卡 */}
            <div style={styles.floatCard}>
              <span style={styles.floatIcon}>✓</span>
              <span style={styles.floatText}>成分安全 · EWG 1 級</span>
            </div>
          </div>
        </div>

        {/* 背景裝飾 */}
        <div style={styles.heroDeco1} />
        <div style={styles.heroDeco2} />
      </section>

      {/* ══ 跑馬燈分隔 ══ */}
      <div style={styles.ticker}>
        {['成分透明', 'CLARITY IS BEAUTY', '輔大美妝社群', 'INGREDIENT LIBRARY', '膚質配對', 'GLOW UP'].map((t, i) => (
          <span key={i} style={styles.tickerItem}>
            {t} <span style={styles.tickerDot}>·</span>
          </span>
        ))}
      </div>

      {/* ══ 三大功能 ══ */}
      <section style={styles.features}>
        <div style={styles.featuresHeader}>
          <p style={styles.sectionEyebrow}>WHAT WE OFFER</p>
          <h2 style={styles.sectionTitle}>三個理由加入 GLŌW</h2>
        </div>
        <div style={styles.featureGrid}>
          {FEATURES.map((f) => (
            <div key={f.num} style={styles.featureCard}>
              <p style={styles.featureNum}>{f.num}</p>
              <h3 style={styles.featureTitle}>{f.title}</h3>
              <p style={styles.featureDesc}>{f.desc}</p>
              <button style={styles.featureCta} onClick={() => navigate(f.to)}>
                {f.cta} →
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* ══ 熱門話題 ══ */}
      <section style={styles.topics}>
        <div style={styles.topicsInner}>
          <div style={styles.topicsHeader}>
            <div>
              <p style={styles.sectionEyebrow}>TRENDING</p>
              <h2 style={styles.sectionTitleLight}>熱門討論</h2>
            </div>
            <button style={styles.viewAllBtn} onClick={() => navigate('#')}>
              查看全部
            </button>
          </div>
          <div style={styles.topicList}>
            {SKIN_TOPICS.map((topic, i) => (
              <div key={i} style={styles.topicItem}>
                <div style={styles.topicLeft}>
                  <span style={styles.topicTag}>{topic.tag}</span>
                  <p style={styles.topicTitle}>{topic.title}</p>
                </div>
                <div style={styles.topicRight}>
                  <span style={styles.topicReads}>{topic.reads} 閱讀</span>
                  <span style={styles.topicArrow}>→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══ CTA Banner ══ */}
      <section style={styles.ctaBanner}>
        <div style={styles.ctaBannerInner}>
          <p style={styles.ctaBannerEyebrow}>JOIN GLŌW</p>
          <h2 style={styles.ctaBannerTitle}>
            用知識武裝你的<br />保養日常
          </h2>
          <p style={styles.ctaBannerSub}>
            免費加入，使用輔大校務帳號即可註冊
          </p>
          <div style={styles.ctaBannerBtns}>
            <button style={styles.ctaBannerPrimary} onClick={() => navigate('/register')}>
              立即註冊
            </button>
            <button style={styles.ctaBannerGhost} onClick={() => navigate('/login')}>
              已有帳號，登入
            </button>
          </div>
        </div>
        <div style={styles.ctaBannerDeco1} />
        <div style={styles.ctaBannerDeco2} />
      </section>

    </div>
  );
}

const styles = {
  page: {
    paddingTop: '64px',
    backgroundColor: T.bgBase,
    overflow: 'hidden',
  },

  /* ── Hero ── */
  hero: {
    position: 'relative',
    minHeight: '600px',
    display: 'flex',
    alignItems: 'center',
    padding: '80px 64px',
    overflow: 'hidden',
    background: `linear-gradient(160deg, ${T.bgSubtle} 0%, ${T.bgBase} 55%)`,
  },
  heroInner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    gap: '80px',
  },
  heroLeft: {
    flex: '0 0 520px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  heroEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.18em',
    color: T.accent,
    margin: 0,
    textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '64px',
    fontWeight: 300,
    lineHeight: 1.15,
    color: T.textPrimary,
    margin: 0,
  },
  heroDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    color: T.textSecondary,
    lineHeight: 1.75,
    margin: 0,
  },
  heroCtas: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
    marginTop: '8px',
  },
  ctaPrimary: {
    height: '46px',
    padding: '0 32px',
    backgroundColor: T.bgInverse,
    color: T.textInverse,
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.06em',
    transition: 'opacity 150ms',
  },
  ctaGhost: {
    height: '46px',
    padding: '0 24px',
    backgroundColor: 'transparent',
    color: T.textSecondary,
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    cursor: 'pointer',
    transition: 'color 150ms',
  },

  /* 右側成分卡片 */
  heroRight: {
    flex: 1,
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
  },
  heroCard: {
    backgroundColor: T.bgSurface,
    borderRadius: '16px',
    border: `1px solid ${T.border}`,
    padding: '32px',
    width: '300px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    boxShadow: '0 4px 24px rgba(28,25,23,0.07)',
  },
  cardLabel: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    color: T.accent,
    margin: 0,
    textTransform: 'uppercase',
  },
  cardIngredient: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '36px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: 0,
    lineHeight: 1,
  },
  cardEn: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    color: T.textTertiary,
    margin: '-6px 0 0 0',
    letterSpacing: '0.06em',
  },
  safeBar: {
    height: '6px',
    backgroundColor: T.bgSubtle,
    borderRadius: '999px',
    overflow: 'hidden',
  },
  safeBarFill: {
    height: '100%',
    width: '85%',
    backgroundColor: '#7BAE8A',
    borderRadius: '999px',
  },
  cardTags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
  cardTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: T.textSecondary,
    backgroundColor: T.bgSubtle,
    borderRadius: '999px',
    padding: '3px 10px',
  },
  cardDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.textSecondary,
    lineHeight: 1.65,
    margin: '4px 0 0 0',
    borderTop: `1px solid ${T.border}`,
    paddingTop: '12px',
  },
  floatCard: {
    position: 'absolute',
    bottom: '-16px',
    left: '-24px',
    backgroundColor: T.bgInverse,
    borderRadius: '10px',
    padding: '10px 16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 4px 16px rgba(28,25,23,0.15)',
  },
  floatIcon: {
    color: '#7BAE8A',
    fontSize: '14px',
    fontWeight: 700,
  },
  floatText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'rgba(247,244,242,0.8)',
    whiteSpace: 'nowrap',
  },
  heroDeco1: {
    position: 'absolute',
    width: '480px',
    height: '480px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.12)`,
    right: '-80px',
    top: '-80px',
    pointerEvents: 'none',
  },
  heroDeco2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.08)`,
    right: '100px',
    bottom: '-60px',
    pointerEvents: 'none',
  },

  /* ── 跑馬燈 ── */
  ticker: {
    backgroundColor: T.accent,
    padding: '12px 0',
    display: 'flex',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  tickerItem: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    color: '#FFFFFF',
    padding: '0 20px',
    textTransform: 'uppercase',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '20px',
  },
  tickerDot: {
    opacity: 0.6,
  },

  /* ── 三大功能 ── */
  features: {
    padding: '96px 64px',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  featuresHeader: {
    marginBottom: '56px',
  },
  sectionEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.18em',
    color: T.accent,
    margin: '0 0 12px 0',
  },
  sectionTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '40px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: 0,
    lineHeight: 1.2,
  },
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '2px',
    border: `1px solid ${T.border}`,
    borderRadius: '12px',
    overflow: 'hidden',
  },
  featureCard: {
    backgroundColor: T.bgSurface,
    padding: '48px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    borderRight: `1px solid ${T.border}`,
    transition: 'background-color 200ms',
  },
  featureNum: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '48px',
    fontWeight: 300,
    color: T.accentLight,
    margin: 0,
    lineHeight: 1,
  },
  featureTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '24px',
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
    flex: 1,
  },
  featureCta: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.accent,
    cursor: 'pointer',
    fontWeight: 500,
    textAlign: 'left',
    letterSpacing: '0.02em',
  },

  /* ── 熱門話題 ── */
  topics: {
    backgroundColor: T.bgInverse,
    padding: '80px 0',
  },
  topicsInner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 64px',
  },
  topicsHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: '40px',
  },
  sectionTitleLight: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '40px',
    fontWeight: 400,
    color: T.textInverse,
    margin: 0,
    lineHeight: 1.2,
  },
  viewAllBtn: {
    background: 'none',
    border: `1px solid rgba(247,244,242,0.2)`,
    borderRadius: '8px',
    padding: '8px 20px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'rgba(247,244,242,0.6)',
    cursor: 'pointer',
  },
  topicList: {
    display: 'flex',
    flexDirection: 'column',
  },
  topicItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '24px 0',
    borderBottom: `1px solid rgba(247,244,242,0.08)`,
    cursor: 'pointer',
    gap: '24px',
  },
  topicLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  topicTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.12)',
    padding: '3px 10px',
    borderRadius: '999px',
    alignSelf: 'flex-start',
  },
  topicTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px',
    fontWeight: 400,
    color: 'rgba(247,244,242,0.85)',
    margin: 0,
    lineHeight: 1.35,
  },
  topicRight: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    flexShrink: 0,
  },
  topicReads: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '12px',
    color: 'rgba(247,244,242,0.3)',
    whiteSpace: 'nowrap',
  },
  topicArrow: {
    color: 'rgba(247,244,242,0.3)',
    fontSize: '16px',
    transition: 'color 150ms',
  },

  /* ── CTA Banner ── */
  ctaBanner: {
    position: 'relative',
    backgroundColor: T.bgSubtle,
    padding: '96px 64px',
    overflow: 'hidden',
    borderTop: `1px solid ${T.border}`,
  },
  ctaBannerInner: {
    position: 'relative',
    zIndex: 1,
    maxWidth: '560px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center',
  },
  ctaBannerEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.18em',
    color: T.accent,
    margin: 0,
  },
  ctaBannerTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '52px',
    fontWeight: 300,
    color: T.textPrimary,
    lineHeight: 1.2,
    margin: 0,
  },
  ctaBannerSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px',
    color: T.textSecondary,
    margin: 0,
  },
  ctaBannerBtns: {
    display: 'flex',
    gap: '12px',
    marginTop: '8px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  ctaBannerPrimary: {
    height: '46px',
    padding: '0 36px',
    backgroundColor: T.bgInverse,
    color: T.textInverse,
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.06em',
  },
  ctaBannerGhost: {
    height: '46px',
    padding: '0 28px',
    backgroundColor: 'transparent',
    color: T.textSecondary,
    border: `1px solid ${T.border}`,
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    cursor: 'pointer',
  },
  ctaBannerDeco1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.15)`,
    right: '-100px',
    top: '-150px',
    pointerEvents: 'none',
  },
  ctaBannerDeco2: {
    position: 'absolute',
    width: '300px',
    height: '300px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.1)`,
    left: '-60px',
    bottom: '-80px',
    pointerEvents: 'none',
  },
};

export default Hero;
