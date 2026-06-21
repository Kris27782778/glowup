import { useNavigate } from 'react-router-dom';
import { useLang } from '../hooks/useLang';

/* ─── 各功能的展示設定（key 為翻譯 key） ─────────────── */
const FEATURE_META = {
  community: {
    eyebrow: 'COMMUNITY',
    titleKey: '社群討論',
    descKey:  '與輔大同學交流保養心得、分享真實使用經驗。登入後即可參與社群討論。',
    preview: <CommunityPreview />,
  },
  qa: {
    eyebrow: 'Q & A',
    titleKey: '問答',
    descKey:  '向社群提出保養疑問，獲得真實回答。登入後即可提問與回答。',
    preview: <QAPreview />,
  },
  products: {
    eyebrow: 'INGREDIENT LIBRARY',
    titleKey: '產品資料庫',
    descKey:  '依膚質、功效篩選產品，查閱成分安全評級與使用建議。登入後即可使用完整資料庫功能。',
    preview: <ProductsPreview />,
  },
  dashboard: {
    eyebrow: 'MY PROFILE',
    titleKey: '個人主頁',
    descKey:  '記錄膚質測驗結果、收藏保養筆記，追蹤社群動態。登入後開始建立你的保養檔案。',
    preview: <DashboardPreview />,
  },
  settings: {
    eyebrow: 'SETTINGS',
    titleKey: '帳號設定',
    descKey:  '管理外觀模式、語言偏好與帳號資訊。',
    preview: <SettingsPreview />,
  },
};

/* ─── 主元件 ──────────────────────────────────────────── */
export default function AuthGate({ feature }) {
  const navigate = useNavigate();
  const { t } = useLang();
  const meta = FEATURE_META[feature] || FEATURE_META.products;

  return (
    <div style={s.root}>
      {/* 背景：功能預覽（模糊＋暗化） */}
      <div style={s.previewBg} aria-hidden="true">
        {meta.preview}
        <div style={s.previewDim} />
      </div>

      {/* 前景：登入提示卡 */}
      <div style={s.card}>
        <p style={s.eyebrow}>{meta.eyebrow}</p>
        <h1 style={s.title}>{t(meta.titleKey)}</h1>
        <p style={s.desc}>{t(meta.descKey)}</p>

        <div style={s.lockIcon} aria-hidden="true">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect x="5" y="13" width="18" height="13" rx="3"
              stroke="var(--accent)" strokeWidth="1.5"/>
            <path d="M9 13V9a5 5 0 0110 0v4"
              stroke="var(--accent)" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="14" cy="19.5" r="1.5" fill="var(--accent)"/>
          </svg>
        </div>

        <p style={s.hint}>{t('此功能需要登入才能使用')}</p>

        <div style={s.actions}>
          <button style={s.primaryBtn} onClick={() => navigate('/login')}>
            {t('登入帳號')}
          </button>
          <button style={s.ghostBtn} onClick={() => navigate('/register')}>
            {t('免費註冊')}
          </button>
        </div>

        <button style={s.backBtn} onClick={() => navigate('/')}>
          {t('← 返回首頁')}
        </button>
      </div>
    </div>
  );
}

/* ─── 社群討論預覽 ────────────────────────────────────── */
function CommunityPreview() {
  const posts = [
    { initial: '林', color: '#C4897A', name: '林小羽', dept: '化妝品系', tags: ['油性肌', '成分討論'], title: '用了一個月角鯊烷的心得：油肌也能超水嫩', hot: true },
    { initial: '王', color: '#7A8A9E', name: '王思涵', dept: '化學系',   tags: ['成分討論', '抗老'],   title: '菸鹼醯胺 5% vs 10%，整理研究與實測差異', hot: true },
    { initial: '黃', color: '#A08060', name: '黃品蓁', dept: '化妝品系', tags: ['防曬推薦'],            title: '2025 輕薄防曬推薦：這幾款化完妝也能補擦', hot: false },
  ];
  return (
    <div style={cv.page}>
      <div style={cv.hero}>
        <div style={cv.heroText}>
          <div style={cv.eyebrow}>COMMUNITY</div>
          <div style={cv.heroTitle}>社群討論</div>
        </div>
        <div style={cv.heroStats}>
          {['1,240 篇貼文', '368 位成員', '89 個標籤'].map(s => (
            <div key={s} style={cv.stat}>{s}</div>
          ))}
        </div>
      </div>
      <div style={cv.body}>
        <div style={cv.main}>
          {posts.map((p, i) => (
            <div key={i} style={cv.card}>
              <div style={cv.cardTop}>
                <div style={{ ...cv.avatar, backgroundColor: p.color }}>{p.initial}</div>
                <div style={cv.authorInfo}>
                  <div style={cv.authorName}>{p.name}</div>
                  <div style={cv.authorMeta}>{p.dept}</div>
                </div>
                {p.hot && <div style={cv.hotBadge}>HOT</div>}
              </div>
              <div style={cv.tags}>{p.tags.map(t => <span key={t} style={cv.tag}>{t}</span>)}</div>
              <div style={cv.title}>{p.title}</div>
              <div style={cv.footer}>
                <span style={cv.stat2}>♡ {12 + i * 18}</span>
                <span style={cv.stat2}>💬 {5 + i * 6}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={cv.sidebar}>
          <div style={cv.sideCard}>
            <div style={cv.sideTitle}>本週熱門話題</div>
            {['#角鯊烷', '#菸鹼醯胺', '#敏感肌', '#防曬', '#A醇入門'].map((tag, i) => (
              <div key={tag} style={cv.trendRow}>
                <span style={cv.trendRank}>{i + 1}</span>
                <span style={cv.trendTag}>{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 問答預覽 ────────────────────────────────────────── */
function QAPreview() {
  const questions = [
    { initial: '陳', color: '#9E8A7A', name: '陳柔安', tags: ['成分討論', '敏感肌'], title: '乳酸和杏仁酸可以交替使用嗎？', solved: true,  answers: 8  },
    { initial: '王', color: '#7A8A9E', name: '王思涵', tags: ['抗老'],               title: 'A 醇初學者從多少濃度開始？',   solved: false, answers: 14 },
    { initial: '黃', color: '#A08060', name: '黃品蓁', tags: ['屏障修護'],            title: '修護期間要停用所有活性成分嗎？', solved: true,  answers: 19 },
  ];
  return (
    <div style={qv.page}>
      <div style={qv.hero}>
        <div style={qv.heroText}>
          <div style={qv.eyebrow}>Q &amp; A</div>
          <div style={qv.heroTitle}>問答</div>
        </div>
        <div style={qv.heroStats}>
          {['486 個問題', '2,130 則回答', '3 待解決'].map(s => (
            <div key={s} style={qv.stat}>{s}</div>
          ))}
        </div>
      </div>
      <div style={qv.body}>
        <div style={qv.main}>
          {questions.map((q, i) => (
            <div key={i} style={qv.card}>
              <div style={qv.cardTop}>
                <div style={{ ...qv.avatar, backgroundColor: q.color }}>{q.initial}</div>
                <div style={qv.authorName}>{q.name}</div>
                <div style={{ ...qv.badge, ...(q.solved ? qv.badgeSolved : qv.badgeUnsolved) }}>
                  {q.solved ? '已解決' : '待解決'}
                </div>
              </div>
              <div style={qv.tags}>{q.tags.map(t => <span key={t} style={qv.tag}>{t}</span>)}</div>
              <div style={qv.title}>{q.title}</div>
              <div style={qv.footer}>💬 {q.answers} 則回答</div>
            </div>
          ))}
        </div>
        <div style={qv.sidebar}>
          <div style={qv.sideCard}>
            <div style={qv.sideTitle}>熱門標籤</div>
            {['#果酸', '#視黃醇', '#防曬選擇', '#屏障修護', '#玻尿酸'].map((tag, i) => (
              <div key={tag} style={qv.trendRow}>
                <span style={qv.trendRank}>{i + 1}</span>
                <span style={qv.trendTag}>{tag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 產品資料庫預覽 ──────────────────────────────────── */
function ProductsPreview() {
  const chips = ['化妝品', '保養品', '油性肌', '乾性肌', '保濕', '控油', '抗老'];
  const cards = [
    { brand: 'BRAND A', name: '玻尿酸精華液', sub: '精華液' },
    { brand: 'BRAND B', name: '菸鹼醯胺控油乳', sub: '乳液' },
    { brand: 'BRAND C', name: '角鯊烷輕感油', sub: '保養油' },
    { brand: 'BRAND D', name: '舒緩修護凝霜', sub: '面霜' },
    { brand: 'BRAND E', name: '水楊酸去角質露', sub: '去角質' },
    { brand: 'BRAND F', name: '視黃醇抗老精華', sub: '精華液' },
  ];
  return (
    <div style={pv.page}>
      <div style={pv.hero} />
      <div style={pv.body}>
        <div style={pv.sidebar}>
          {['探索領域', '適合膚質', '功效', '品項'].map(t => (
            <div key={t} style={pv.filterGroup}>
              <div style={pv.filterTitle}>{t}</div>
              <div style={pv.chipRow}>
                {chips.slice(0, 3).map((c, i) => (
                  <div key={i} style={{ ...pv.chip, ...(i === 0 ? pv.chipActive : {}) }}>{c}</div>
                ))}
              </div>
            </div>
          ))}
        </div>
        <div style={pv.grid}>
          {cards.map((c, i) => (
            <div key={i} style={pv.card}>
              <div style={pv.cardBrand}>{c.brand}</div>
              <div style={pv.cardName}>{c.name}</div>
              <div style={pv.cardSub}>{c.sub}</div>
              <div style={pv.barBg}><div style={{ ...pv.barFill, width: `${60 + i * 7}%` }} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 個人主頁預覽 ────────────────────────────────────── */
function DashboardPreview() {
  return (
    <div style={dv.page}>
      <div style={dv.cover} />
      <div style={dv.body}>
        <div style={dv.sidebar}>
          <div style={dv.avatar}>G</div>
          <div style={dv.nameLine} />
          <div style={dv.subLine} />
          <div style={dv.skinCard}>
            <div style={dv.skinEyebrow}>我的膚質</div>
            <div style={dv.skinTitle}>混合性肌</div>
            <div style={dv.skinDesc}>T 區偏油，整體清爽保濕</div>
          </div>
          <div style={dv.statsRow}>
            {['0 貼文', '0 追蹤者', '0 追蹤中'].map(l => (
              <div key={l} style={dv.stat}>{l}</div>
            ))}
          </div>
          <div style={dv.btn} />
        </div>
        <div style={dv.main}>
          <div style={dv.tabBar}>
            {['帖子', '問答', '收藏', '收藏的筆記'].map((t, i) => (
              <div key={t} style={{ ...dv.tab, ...(i === 0 ? dv.tabActive : {}) }}>{t}</div>
            ))}
          </div>
          <div style={dv.content}>
            {[1, 2].map(i => (
              <div key={i} style={dv.postLine}>
                <div style={dv.postAvatar} />
                <div style={dv.postLines}>
                  <div style={dv.postLine1} />
                  <div style={dv.postLine2} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── 設定預覽 ────────────────────────────────────────── */
function SettingsPreview() {
  return (
    <div style={sv.page}>
      <div style={sv.container}>
        <div style={sv.titleLine} />
        {['外觀', '語言', '帳號'].map(sec => (
          <div key={sec} style={sv.section}>
            <div style={sv.sectionLabel}>{sec}</div>
            <div style={sv.card}>
              <div style={sv.row}>
                <div style={sv.rowLabel} />
                <div style={sv.chips}>
                  {[1, 2, 3].map(i => (
                    <div key={i} style={{ ...sv.chip, ...(i === 1 ? sv.chipActive : {}) }} />
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Styles ──────────────────────────────────────────── */
const s = {
  root: {
    position: 'relative',
    minHeight: '100vh',
    paddingTop: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  previewBg: {
    position: 'absolute',
    inset: 0,
    filter: 'blur(3px)',
    transform: 'scale(1.02)',
    pointerEvents: 'none',
    userSelect: 'none',
  },
  previewDim: {
    position: 'absolute',
    inset: 0,
    backgroundColor: 'rgba(15,12,10,0.55)',
  },
  card: {
    position: 'relative',
    zIndex: 1,
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '48px 40px',
    maxWidth: '420px',
    width: '100%',
    margin: '24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    textAlign: 'center',
    boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
    backdropFilter: 'blur(12px)',
  },
  eyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.16em',
    color: 'var(--accent)',
    margin: 0,
  },
  title: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '32px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.2,
  },
  desc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    lineHeight: 1.7,
    margin: 0,
    maxWidth: '320px',
  },
  lockIcon: {
    marginTop: '8px',
    width: '56px',
    height: '56px',
    borderRadius: '50%',
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: '1px solid rgba(196,137,122,0.2)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  actions: {
    display: 'flex',
    gap: '10px',
    width: '100%',
    marginTop: '8px',
  },
  primaryBtn: {
    flex: 1,
    height: '44px',
    backgroundColor: 'var(--bg-inverse)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '10px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  ghostBtn: {
    flex: 1,
    height: '44px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    cursor: 'pointer',
  },
  backBtn: {
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: '4px',
    marginTop: '4px',
  },
};

/* Products preview styles */
const pv = {
  page: { paddingTop: '64px', backgroundColor: '#F7F4F2', minHeight: '100vh' },
  hero: { height: '180px', backgroundColor: '#1C1917' },
  body: { display: 'flex', gap: '32px', padding: '32px 40px', maxWidth: '1100px', margin: '0 auto' },
  sidebar: { width: '220px', flexShrink: 0, backgroundColor: '#fff', borderRadius: '12px', border: '1px solid #E5DDD9', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  filterGroup: { display: 'flex', flexDirection: 'column', gap: '8px' },
  filterTitle: { fontSize: '10px', fontWeight: 600, color: '#A89990', letterSpacing: '0.1em', textTransform: 'uppercase' },
  chipRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  chip: { fontSize: '11px', padding: '4px 10px', borderRadius: '999px', border: '1px solid #E5DDD9', color: '#6B5E58', backgroundColor: '#F0EBE7', fontFamily: '"DM Sans",sans-serif' },
  chipActive: { backgroundColor: '#C4897A', borderColor: '#C4897A', color: '#fff' },
  grid: { flex: 1, display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', alignContent: 'start' },
  card: { backgroundColor: '#fff', borderRadius: '10px', border: '1px solid #E5DDD9', padding: '16px', display: 'flex', flexDirection: 'column', gap: '6px' },
  cardBrand: { fontSize: '10px', color: '#A89990', fontWeight: 600, textTransform: 'uppercase' },
  cardName: { fontSize: '15px', color: '#1C1917', fontWeight: 400, fontFamily: '"Cormorant Garamond",serif' },
  cardSub: { fontSize: '11px', color: '#C4897A' },
  barBg: { height: '4px', backgroundColor: '#F0EBE7', borderRadius: '999px', marginTop: '6px' },
  barFill: { height: '100%', backgroundColor: '#7BAE8A', borderRadius: '999px' },
};

/* Dashboard preview styles */
const dv = {
  page: { paddingTop: '64px', backgroundColor: '#F7F4F2', minHeight: '100vh' },
  cover: { height: '180px', background: 'linear-gradient(135deg, #2C2118 0%, #1C1917 100%)' },
  body: { display: 'flex', gap: '28px', padding: '0 40px 40px', maxWidth: '1000px', margin: '0 auto' },
  sidebar: { width: '240px', flexShrink: 0, marginTop: '-60px', display: 'flex', flexDirection: 'column', gap: '12px' },
  avatar: { width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#C4897A', border: '4px solid #F7F4F2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond",serif', fontSize: '32px', color: '#fff' },
  nameLine: { height: '24px', width: '140px', backgroundColor: '#E5DDD9', borderRadius: '6px' },
  subLine: { height: '16px', width: '100px', backgroundColor: '#F0EBE7', borderRadius: '6px' },
  skinCard: { backgroundColor: '#fff', border: '1px solid #E5DDD9', borderRadius: '10px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px' },
  skinEyebrow: { fontSize: '9px', fontWeight: 600, color: '#C4897A', letterSpacing: '0.12em', textTransform: 'uppercase' },
  skinTitle: { fontSize: '18px', color: '#1C1917', fontFamily: '"Cormorant Garamond",serif' },
  skinDesc: { fontSize: '11px', color: '#6B5E58' },
  statsRow: { backgroundColor: '#fff', border: '1px solid #E5DDD9', borderRadius: '10px', display: 'flex', overflow: 'hidden' },
  stat: { flex: 1, padding: '12px 6px', textAlign: 'center', fontSize: '11px', color: '#A89990' },
  btn: { height: '36px', backgroundColor: '#1C1917', borderRadius: '8px' },
  main: { flex: 1, marginTop: '20px' },
  tabBar: { display: 'flex', backgroundColor: '#fff', borderBottom: '1px solid #E5DDD9', borderRadius: '10px 10px 0 0', padding: '0 8px' },
  tab: { padding: '12px 16px', fontSize: '13px', color: '#A89990', fontFamily: '"DM Sans",sans-serif' },
  tabActive: { color: '#1C1917', fontWeight: 500, borderBottom: '2px solid #C4897A' },
  content: { backgroundColor: '#fff', border: '1px solid #E5DDD9', borderTop: 'none', borderRadius: '0 0 10px 10px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' },
  postLine: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  postAvatar: { width: '32px', height: '32px', borderRadius: '50%', backgroundColor: '#E5DDD9', flexShrink: 0 },
  postLines: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px', paddingTop: '4px' },
  postLine1: { height: '14px', backgroundColor: '#F0EBE7', borderRadius: '4px', width: '80%' },
  postLine2: { height: '14px', backgroundColor: '#F0EBE7', borderRadius: '4px', width: '60%' },
};

/* Community preview styles */
const cv = {
  page: { paddingTop: '64px', backgroundColor: '#F7F4F2', minHeight: '100vh' },
  hero: { backgroundColor: '#1C1917', padding: '40px 40px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px' },
  heroText: { display: 'flex', flexDirection: 'column', gap: '6px' },
  eyebrow: { fontSize: '9px', fontWeight: 600, letterSpacing: '0.16em', color: '#C4897A', fontFamily: '"DM Sans",sans-serif' },
  heroTitle: { fontSize: '32px', fontWeight: 300, color: '#F7F4F2', fontFamily: '"Cormorant Garamond",serif', letterSpacing: '0.04em' },
  heroStats: { display: 'flex', gap: '24px' },
  stat: { fontSize: '11px', color: 'rgba(247,244,242,0.45)', fontFamily: '"DM Sans",sans-serif' },
  body: { display: 'flex', gap: '24px', padding: '24px 40px', maxWidth: '1100px', margin: '0 auto' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { backgroundColor: '#fff', border: '1px solid #E5DDD9', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond",serif', fontSize: '12px', color: '#fff', flexShrink: 0 },
  authorInfo: { flex: 1 },
  authorName: { fontSize: '12px', fontWeight: 500, color: '#1C1917', fontFamily: '"DM Sans",sans-serif' },
  authorMeta: { fontSize: '10px', color: '#A89990', fontFamily: '"DM Sans",sans-serif' },
  hotBadge: { fontSize: '9px', fontWeight: 600, color: '#C4897A', backgroundColor: 'rgba(196,137,122,0.1)', border: '1px solid rgba(196,137,122,0.2)', borderRadius: '999px', padding: '2px 7px', letterSpacing: '0.06em' },
  tags: { display: 'flex', gap: '5px' },
  tag: { fontSize: '10px', color: '#A89990', backgroundColor: '#F0EBE7', border: '1px solid #E5DDD9', borderRadius: '999px', padding: '2px 7px' },
  title: { fontSize: '15px', fontWeight: 400, color: '#1C1917', fontFamily: '"Cormorant Garamond",serif', lineHeight: 1.3 },
  footer: { display: 'flex', gap: '12px', paddingTop: '6px', borderTop: '1px solid #F0EBE7' },
  stat2: { fontSize: '11px', color: '#A89990', fontFamily: '"DM Sans",sans-serif' },
  sidebar: { width: '200px', flexShrink: 0 },
  sideCard: { backgroundColor: '#fff', border: '1px solid #E5DDD9', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  sideTitle: { fontSize: '9px', fontWeight: 600, color: '#C4897A', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"DM Sans",sans-serif' },
  trendRow: { display: 'flex', alignItems: 'center', gap: '7px' },
  trendRank: { fontSize: '10px', fontWeight: 600, color: '#A89990', width: '12px', fontFamily: '"DM Sans",sans-serif' },
  trendTag: { fontSize: '12px', color: '#6B5E58', fontFamily: '"DM Sans","Noto Sans TC",sans-serif', flex: 1 },
};

/* QA preview styles */
const qv = {
  page: { paddingTop: '64px', backgroundColor: '#F7F4F2', minHeight: '100vh' },
  hero: { backgroundColor: '#1C1917', padding: '40px 40px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', gap: '24px' },
  heroText: { display: 'flex', flexDirection: 'column', gap: '6px' },
  eyebrow: { fontSize: '9px', fontWeight: 600, letterSpacing: '0.16em', color: '#C4897A', fontFamily: '"DM Sans",sans-serif' },
  heroTitle: { fontSize: '32px', fontWeight: 300, color: '#F7F4F2', fontFamily: '"Cormorant Garamond",serif', letterSpacing: '0.04em' },
  heroStats: { display: 'flex', gap: '24px' },
  stat: { fontSize: '11px', color: 'rgba(247,244,242,0.45)', fontFamily: '"DM Sans",sans-serif' },
  body: { display: 'flex', gap: '24px', padding: '24px 40px', maxWidth: '1100px', margin: '0 auto' },
  main: { flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' },
  card: { backgroundColor: '#fff', border: '1px solid #E5DDD9', borderRadius: '12px', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '8px' },
  cardTop: { display: 'flex', alignItems: 'center', gap: '8px' },
  avatar: { width: '28px', height: '28px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: '"Cormorant Garamond",serif', fontSize: '12px', color: '#fff', flexShrink: 0 },
  authorName: { flex: 1, fontSize: '12px', fontWeight: 500, color: '#1C1917', fontFamily: '"DM Sans",sans-serif' },
  badge: { fontSize: '9px', fontWeight: 500, borderRadius: '999px', padding: '2px 8px', letterSpacing: '0.03em' },
  badgeSolved: { color: '#5A9E7A', backgroundColor: 'rgba(90,158,122,0.1)', border: '1px solid rgba(90,158,122,0.2)' },
  badgeUnsolved: { color: '#A89990', backgroundColor: '#F0EBE7', border: '1px solid #E5DDD9' },
  tags: { display: 'flex', gap: '5px' },
  tag: { fontSize: '10px', color: '#A89990', backgroundColor: '#F0EBE7', border: '1px solid #E5DDD9', borderRadius: '999px', padding: '2px 7px' },
  title: { fontSize: '15px', fontWeight: 400, color: '#1C1917', fontFamily: '"Cormorant Garamond",serif', lineHeight: 1.3 },
  footer: { fontSize: '11px', color: '#A89990', paddingTop: '6px', borderTop: '1px solid #F0EBE7', fontFamily: '"DM Sans",sans-serif' },
  sidebar: { width: '200px', flexShrink: 0 },
  sideCard: { backgroundColor: '#fff', border: '1px solid #E5DDD9', borderRadius: '10px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '8px' },
  sideTitle: { fontSize: '9px', fontWeight: 600, color: '#C4897A', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"DM Sans",sans-serif' },
  trendRow: { display: 'flex', alignItems: 'center', gap: '7px' },
  trendRank: { fontSize: '10px', fontWeight: 600, color: '#A89990', width: '12px', fontFamily: '"DM Sans",sans-serif' },
  trendTag: { fontSize: '12px', color: '#6B5E58', fontFamily: '"DM Sans","Noto Sans TC",sans-serif', flex: 1 },
};

/* Settings preview styles */
const sv = {
  page: { paddingTop: '64px', backgroundColor: '#F7F4F2', minHeight: '100vh' },
  container: { maxWidth: '520px', margin: '0 auto', padding: '40px 24px', display: 'flex', flexDirection: 'column', gap: '24px' },
  titleLine: { height: '36px', width: '120px', backgroundColor: '#E5DDD9', borderRadius: '8px' },
  section: { display: 'flex', flexDirection: 'column', gap: '10px' },
  sectionLabel: { fontSize: '10px', fontWeight: 600, color: '#C4897A', letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: '"DM Sans",sans-serif' },
  card: { backgroundColor: '#fff', border: '1px solid #E5DDD9', borderRadius: '12px', padding: '18px' },
  row: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  rowLabel: { height: '14px', width: '80px', backgroundColor: '#F0EBE7', borderRadius: '4px' },
  chips: { display: 'flex', gap: '6px' },
  chip: { height: '30px', width: '52px', borderRadius: '8px', border: '1px solid #E5DDD9', backgroundColor: '#F0EBE7' },
  chipActive: { backgroundColor: '#C4897A', borderColor: '#C4897A' },
};
