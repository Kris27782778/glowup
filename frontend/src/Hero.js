import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useReveal } from './hooks/useReveal';

const T = {
  bgBase:        '#F7F4F2',
  bgSurface:     '#FFFFFF',
  bgSubtle:      '#F0EBE7',
  bgInverse:     '#1C1917',
  accent:        '#C4897A',
  accentLight:   '#E8C4BA',
  accentDark:    '#9E6457',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  textInverse:   '#F7F4F2',
  border:        '#E5DDD9',
};

/* ── 登入頁 Mock 資料 ── */
const MOCK_POSTS = [
  {
    id: 1,
    author: '林小羽', initial: '林', dept: '化妝品系',
    time: '2 小時前', tag: '油性肌',
    title: '用了一個月角鯊烷的心得：油肌也能超水嫩',
    excerpt: '一直以為油肌不能碰油，但加了角鯊烷之後膚況穩了很多，皮脂分泌反而變少…',
    likes: 48, comments: 12, hot: true,
  },
  {
    id: 2,
    author: '陳柔安', initial: '陳', dept: '護理學系',
    time: '5 小時前', tag: '敏感肌',
    title: '終於找到敏感肌也能用的去角質方法',
    excerpt: '試過幾款果酸都刺激到不行，後來換成低濃度杏仁酸每週一次，完全沒有泛紅…',
    likes: 31, comments: 7, hot: false,
  },
  {
    id: 3,
    author: '王思涵', initial: '王', dept: '化學系',
    time: '昨天', tag: '成分討論',
    title: '菸鹼醯胺 5% vs 10%，整理研究與實測差異',
    excerpt: '整理了幾篇期刊和自身使用三個月的結果，兩個濃度對色沉的影響差距其實不如想像中大…',
    likes: 87, comments: 24, hot: true,
  },
  {
    id: 4,
    author: '張宇軒', initial: '張', dept: '資訊管理學系',
    time: '昨天', tag: '混合性肌',
    title: 'T 區控油、兩頰保濕：分區保養的實際操作法',
    excerpt: '混合肌最麻煩的就是兩個區域的需求完全不同，這是我目前在用的早晚保養流程分享…',
    likes: 22, comments: 5, hot: false,
  },
];

const MOCK_EVENTS = [
  {
    id: 1, badge: '新活動',
    title: '輔大保養品交換會',
    date: '5 月 18 日（六）14:00',
    location: '學生活動中心 B1',
    desc: '帶一瓶來交換一瓶，找到下一個心頭好！',
    urgent: false,
  },
  {
    id: 2, badge: '即將截止',
    title: '免費膚質分析體驗',
    date: '截止 5 月 12 日',
    location: '線上填問卷',
    desc: '填寫問卷即獲得個人化成分建議報告。',
    urgent: true,
  },
];

const MOCK_TAGS = ['保濕', '控油', '敏感肌', '成分討論', '防曬推薦', '乳液評比', '抗老', '屏障修護', '早安水'];

const SKIN_LABELS = {
  oily: '油性肌', dry: '乾性肌', combo: '混合性肌',
  combo_dry: '混合性肌・偏乾', combo_oily: '混合性肌・偏油',
  normal: '中性肌', sensitive: '敏感性肌',
};

function getGreeting() {
  const h = new Date().getHours();
  if (h < 5)  return '夜深了';
  if (h < 12) return '早安';
  if (h < 17) return '午安';
  return '晚安';
}

/* ═══════════════════════════════════════
   主元件：依登入狀態切換畫面
   ═══════════════════════════════════════ */
function Hero() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
    setReady(true);
  }, []);

  if (!ready) return null;
  if (user)   return <LoggedInHome user={user} />;
  return <LandingPage />;
}

/* ═══════════════════════════════════════
   登入後主頁
   ═══════════════════════════════════════ */
function LoggedInHome({ user }) {
  const navigate = useNavigate();
  const [tab, setTab] = useState('latest');
  const [announceDismissed, setAnnounceDismissed] = useState(false);
  const [eventPop, setEventPop] = useState(false);
  const [eventPopDismissed, setEventPopDismissed] = useState(false);
  useReveal();

  const greeting  = getGreeting();
  const skinLabel = SKIN_LABELS[user.skin_type] || null;

  /* 活動 pop：1.8 秒後浮現 */
  useEffect(() => {
    const t = setTimeout(() => setEventPop(true), 1800);
    return () => clearTimeout(t);
  }, []);

  const filteredPosts = tab === 'hot'
    ? [...MOCK_POSTS].sort((a, b) => b.likes - a.likes)
    : MOCK_POSTS;

  return (
    <div style={H.page}>

      {/* ── 歡迎列 ── */}
      <div style={H.welcomeBar} className="g-fade-in gd-0">
        <div style={H.welcomeInner}>
          <div style={H.welcomeLeft}>
            <span style={H.greetText}>{greeting}，{user.nickname}</span>
            {skinLabel && <span style={H.skinBadge}>{skinLabel}</span>}
          </div>
          <button style={H.postBtn} onClick={() => {}}>
            + 發布貼文
          </button>
        </div>
      </div>

      {/* ── 主體 ── */}
      <div style={H.body}>

        {/* 左欄：Feed */}
        <main style={H.main}>

          {/* 公告條 */}
          {!announceDismissed && (
            <div style={H.announce} className="g-fade-up gd-1">
              <span style={H.announceBadge}>公告</span>
              <span style={H.announceText}>
                保養品交換會 5/18 即將舉行，快來報名！
              </span>
              <button
                style={H.announceClose}
                onClick={() => setAnnounceDismissed(true)}
                aria-label="關閉"
              >✕</button>
            </div>
          )}

          {/* Tab 列 */}
          <div style={H.tabBar} className="g-fade-up gd-2">
            {[
              { key: 'latest',    label: '最新動態' },
              { key: 'hot',       label: '熱門貼文' },
              { key: 'following', label: '追蹤中' },
            ].map(t => (
              <button
                key={t.key}
                style={{ ...H.tabBtn, ...(tab === t.key ? H.tabActive : {}) }}
                onClick={() => setTab(t.key)}
              >
                {t.label}
                {tab === t.key && <span style={H.tabLine} />}
              </button>
            ))}
          </div>

          {/* 貼文列表 */}
          <div key={tab} className="g-tab-content">
            {tab === 'following' ? (
              <div style={H.emptyFeed}>
                <p style={H.emptyTitle}>還沒有追蹤的用戶</p>
                <p style={H.emptySub}>追蹤其他同學，在這裡看見他們的最新動態</p>
              </div>
            ) : (
              filteredPosts.map((post, i) => (
                <PostCard key={post.id} post={post} idx={i} />
              ))
            )}
          </div>
        </main>

        {/* 右欄：Sidebar */}
        <aside style={H.sidebar}>

          {/* 近期活動 */}
          <div style={H.sideSection} className="g-reveal">
            <p style={H.sideTitle}>近期活動</p>
            <div style={H.eventList}>
              {MOCK_EVENTS.map(ev => (
                <EventCard key={ev.id} event={ev} />
              ))}
            </div>
          </div>

          {/* 熱門標籤 */}
          <div style={H.sideSection} className="g-reveal delay-1">
            <p style={H.sideTitle}>熱門標籤</p>
            <div style={H.tagCloud}>
              {MOCK_TAGS.map(tag => (
                <button key={tag} style={H.tagChip} className="fchip">
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 快速入口 */}
          <div style={H.sideSection} className="g-reveal delay-2">
            <p style={H.sideTitle}>快速入口</p>
            <div style={H.quickLinks}>
              {[
                { label: '成分資料庫', sub: '查詢保養成分', to: '/products' },
                { label: '個人主頁',   sub: '管理我的帖文', to: '/dashboard' },
              ].map(l => (
                <button key={l.label} style={H.quickLink} onClick={() => navigate(l.to)}>
                  <span style={H.quickLabel}>{l.label}</span>
                  <span style={H.quickSub}>{l.sub}</span>
                  <span style={H.quickArrow}>→</span>
                </button>
              ))}
            </div>
          </div>

        </aside>
      </div>

      {/* ── 活動 Pop（右下角浮現）── */}
      {eventPop && !eventPopDismissed && (
        <div style={H.eventPopWrap}>
          <div style={H.eventPop} className="g-scale-in">
            <div style={H.eventPopHeader}>
              <span style={H.eventPopBadge}>新活動</span>
              <button
                style={H.eventPopClose}
                onClick={() => setEventPopDismissed(true)}
                aria-label="關閉"
              >✕</button>
            </div>
            <p style={H.eventPopTitle}>輔大保養品交換會</p>
            <p style={H.eventPopDate}>5 月 18 日（六）14:00</p>
            <p style={H.eventPopDesc}>帶一瓶來換一瓶，找到你的下一個愛用品！</p>
            <button style={H.eventPopCta} onClick={() => setEventPopDismissed(true)}>
              了解詳情
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

/* ── 貼文卡片 ── */
function PostCard({ post, idx }) {
  return (
    <div style={{ ...H.postCard, animationDelay: `${idx * 70}ms` }} className="g-fade-up">
      <div style={H.postHeader}>
        <div style={H.postAvatar}>{post.initial}</div>
        <div style={H.postMeta}>
          <span style={H.postAuthor}>{post.author}</span>
          <span style={H.postDept}>{post.dept} · {post.time}</span>
        </div>
        {post.hot && <span style={H.hotBadge}>熱門</span>}
      </div>
      <span style={H.postTag}>{post.tag}</span>
      <h3 style={H.postTitle}>{post.title}</h3>
      <p style={H.postExcerpt}>{post.excerpt}</p>
      <div style={H.postFooter}>
        <button style={H.postStat}>♡ {post.likes}</button>
        <button style={H.postStat}>◎ {post.comments}</button>
        <button style={H.postStatRight}>分享</button>
      </div>
    </div>
  );
}

/* ── 活動卡片 ── */
function EventCard({ event }) {
  return (
    <div style={{ ...H.eventCard, ...(event.urgent ? H.eventCardUrgent : {}) }}>
      <div style={H.eventCardTop}>
        <span style={{ ...H.eventBadge, ...(event.urgent ? H.eventBadgeUrgent : {}) }}>
          {event.badge}
        </span>
        <span style={H.eventDate}>{event.date}</span>
      </div>
      <p style={H.eventTitle}>{event.title}</p>
      <p style={H.eventLocation}>{event.location}</p>
      <p style={H.eventDesc}>{event.desc}</p>
    </div>
  );
}

/* ═══════════════════════════════════════
   未登入首頁（原行銷頁）
   ═══════════════════════════════════════ */
const FEATURES = [
  { num: '01', title: '成分知識庫', desc: '查詢任何保養成分的安全等級、功效與使用禁忌，讓每一步保養都有所依據。', cta: '探索成分庫', to: '/products' },
  { num: '02', title: '社群討論',   desc: '與輔大同學分享真實的保養心得與使用評價，找到你信任的美妝參考。', cta: '加入討論', to: '#' },
  { num: '03', title: '膚質配對',   desc: '完成膚質測驗，平台將依你的肌膚狀況推薦最合適的成分與產品。', cta: '開始測驗', to: '/register' },
];

const SKIN_TOPICS = [
  { tag: '油性肌', title: '控油不過度清潔：油肌保濕的正確方式', reads: '1.2k' },
  { tag: '敏感肌', title: '成分越少越好？敏感肌選品的五個原則', reads: '980' },
  { tag: '成分討論', title: '菸鹼醯胺與 A 醇能一起用嗎？', reads: '2.1k' },
  { tag: '混合性肌', title: 'T 區與兩頰分區保養的實際操作方式', reads: '756' },
];

const TICKER_ITEMS = ['成分透明', 'CLARITY IS BEAUTY', '輔大美妝社群', 'INGREDIENT LIBRARY', '膚質配對', 'GLOW UP'];

const INGREDIENTS = [
  {
    name: '菸鹼醯胺', en: 'Niacinamide', safeScore: 85,
    tags: ['美白', '控油', '毛孔', '修護'],
    desc: '多效合一的明星成分，適合大多數膚質，與 A 醇搭配需注意濃度與順序。',
    ewg: 'EWG 1 級', barColor: '#7BAE8A',
  },
  {
    name: '玻尿酸', en: 'Hyaluronic Acid', safeScore: 96,
    tags: ['保濕', '鎖水', '敏感肌', '全膚質'],
    desc: '天然保濕因子，能吸附自身重量千倍的水分，溫和適合各種膚質使用。',
    ewg: 'EWG 1 級', barColor: '#7BAE8A',
  },
  {
    name: '視黃醇', en: 'Retinol', safeScore: 62,
    tags: ['抗老', '促代謝', '淡斑', '需適應期'],
    desc: '維生素 A 衍生物，刺激膠原蛋白再生，新手建議從低濃度（0.1%）開始使用。',
    ewg: 'EWG 3 級', barColor: '#D4A853',
  },
  {
    name: '水楊酸', en: 'Salicylic Acid', safeScore: 70,
    tags: ['去角質', '控油', '痘痘', '毛孔'],
    desc: '脂溶性酸，能深入毛孔清潔油脂，0.5–2% 濃度適用一般保養品。',
    ewg: 'EWG 2 級', barColor: '#C4AF7B',
  },
  {
    name: '角鯊烷', en: 'Squalane', safeScore: 93,
    tags: ['保濕', '柔膚', '油肌', '全膚質'],
    desc: '植物來源的仿皮脂成分，質地輕薄不黏膩，油性肌膚也能安心使用。',
    ewg: 'EWG 1 級', barColor: '#7BAE8A',
  },
  {
    name: '杏仁酸', en: 'Mandelic Acid', safeScore: 75,
    tags: ['去角質', '敏感肌', '溫和', '淡斑'],
    desc: '分子量大的果酸，滲透速度慢，敏感肌與換膚新手的首選入門酸。',
    ewg: 'EWG 2 級', barColor: '#C4AF7B',
  },
];

function LandingPage() {
  const navigate = useNavigate();
  useReveal();

  const [ingIdx,  setIngIdx]  = useState(0);
  const [fading,  setFading]  = useState(false);
  const [barReady, setBarReady] = useState(false);

  /* 每 5 秒切換成分 */
  useEffect(() => {
    const timer = setInterval(() => {
      setFading(true);
      setTimeout(() => {
        setIngIdx(i => (i + 1) % INGREDIENTS.length);
        setFading(false);
        setBarReady(false);
        // 讓 safeBar transition 在新值渲染後觸發
        requestAnimationFrame(() => requestAnimationFrame(() => setBarReady(true)));
      }, 350);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  /* 初次載入時啟動 bar */
  useEffect(() => {
    const t = setTimeout(() => setBarReady(true), 200);
    return () => clearTimeout(t);
  }, []);

  const ing = INGREDIENTS[ingIdx];

  return (
    <div style={L.page}>

      <section style={L.hero}>
        <div style={L.heroInner}>
          <div style={L.heroLeft}>
            <p style={L.heroEyebrow} className="g-fade-in gd-0">輔仁大學 · 美妝知識平台</p>
            <h1 style={L.heroTitle} className="g-fade-up gd-1">
              成分透明，<br /><em>才是真正的</em><br />美妝自由
            </h1>
            <p style={L.heroDesc} className="g-fade-up gd-2">
              GLŌW 是專為輔大學生打造的美妝知識平台。<br />
              查成分、看評價、找同學討論，讓每一瓶都擦得安心。
            </p>
            <div style={L.heroCtas} className="g-fade-up gd-3">
              <button style={L.ctaPrimary} onClick={() => navigate('/register')}>立即加入</button>
              <button style={L.ctaGhost}  onClick={() => navigate('/products')}>探索成分庫 →</button>
            </div>
          </div>

          <div style={L.heroRight} className="g-scale-in gd-2">
            <div style={L.heroCard} className="g-float">
              {/* 成分內容：淡入淡出 */}
              <div style={{ opacity: fading ? 0 : 1, transition: 'opacity 300ms ease' }}>
                <p style={L.cardLabel}>成分介紹</p>
                <p style={L.cardIngredient}>{ing.name}</p>
                <p style={L.cardEn}>{ing.en}</p>
                {/* 安全評分 bar */}
                <div style={{ marginBottom: '4px' }}>
                  <div style={L.safeBar}>
                    <div style={{
                      ...L.safeBarFill,
                      backgroundColor: ing.barColor,
                      width: barReady ? `${ing.safeScore}%` : '0%',
                      transition: 'width 700ms cubic-bezier(0.22,1,0.36,1)',
                    }} />
                  </div>
                  <p style={L.safeScore}>安全評分 {ing.safeScore} / 100</p>
                </div>
                <div style={L.cardTags}>
                  {ing.tags.map(t => <span key={t} style={L.cardTag}>{t}</span>)}
                </div>
                <p style={L.cardDesc}>{ing.desc}</p>
              </div>
              {/* 分頁圓點 */}
              <div style={L.dotRow}>
                {INGREDIENTS.map((_, i) => (
                  <button
                    key={i}
                    style={{ ...L.dot, ...(i === ingIdx ? L.dotActive : {}) }}
                    onClick={() => { setFading(true); setTimeout(() => { setIngIdx(i); setFading(false); setBarReady(false); requestAnimationFrame(() => requestAnimationFrame(() => setBarReady(true))); }, 350); }}
                    aria-label={`成分 ${i + 1}`}
                  />
                ))}
              </div>
            </div>
            <div style={{ ...L.floatCard, opacity: fading ? 0 : 1, transition: 'opacity 300ms ease' }} className="g-float-sm">
              <span style={{ ...L.floatIcon, color: ing.barColor }}>✓</span>
              <span style={L.floatText}>{ing.ewg}</span>
            </div>
          </div>
        </div>
        <div style={L.heroDeco1} /><div style={L.heroDeco2} />
      </section>

      <div style={L.ticker}>
        <div className="g-ticker-track">
          {[...TICKER_ITEMS, ...TICKER_ITEMS].map((t, i) => (
            <span key={i} style={L.tickerItem}>{t} <span style={L.tickerDot}>·</span></span>
          ))}
        </div>
      </div>

      <section style={L.features}>
        <div style={L.featuresHeader}>
          <p style={L.sectionEyebrow} className="g-reveal">WHAT WE OFFER</p>
          <h2 style={L.sectionTitle} className="g-reveal delay-1">三個理由加入 GLŌW</h2>
        </div>
        <div style={L.featureGrid} className="g-reveal delay-2">
          {FEATURES.map(f => (
            <div key={f.num} style={L.featureCard} className="g-feature-card" onClick={() => navigate(f.to)}>
              <p style={L.featureNum}>{f.num}</p>
              <h3 style={L.featureTitle}>{f.title}</h3>
              <p style={L.featureDesc}>{f.desc}</p>
              <button style={L.featureCta} className="g-feature-cta">{f.cta} →</button>
            </div>
          ))}
        </div>
      </section>

      <section style={L.topics}>
        <div style={L.topicsInner}>
          <div style={L.topicsHeader}>
            <div>
              <p style={L.sectionEyebrow} className="g-reveal">TRENDING</p>
              <h2 style={L.sectionTitleLight} className="g-reveal delay-1">熱門討論</h2>
            </div>
            <button style={L.viewAllBtn} className="g-reveal delay-2" onClick={() => navigate('#')}>查看全部</button>
          </div>
          <div style={L.topicList}>
            {SKIN_TOPICS.map((topic, i) => (
              <div key={i} style={L.topicItem} className={`g-topic-item g-reveal delay-${i + 1}`}>
                <div style={L.topicLeft}>
                  <span style={L.topicTag}>{topic.tag}</span>
                  <p style={L.topicTitle} className="g-topic-title">{topic.title}</p>
                </div>
                <div style={L.topicRight}>
                  <span style={L.topicReads}>{topic.reads} 閱讀</span>
                  <span style={L.topicArrow} className="g-topic-arrow">→</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={L.ctaBanner}>
        <div style={L.ctaBannerInner} className="g-reveal">
          <p style={L.ctaBannerEyebrow}>JOIN GLŌW</p>
          <h2 style={L.ctaBannerTitle}>用知識武裝你的<br />保養日常</h2>
          <p style={L.ctaBannerSub}>免費加入，使用輔大校務帳號即可註冊</p>
          <div style={L.ctaBannerBtns}>
            <button style={L.ctaBannerPrimary} onClick={() => navigate('/register')}>立即註冊</button>
            <button style={L.ctaBannerGhost}   onClick={() => navigate('/login')}>已有帳號，登入</button>
          </div>
        </div>
        <div style={L.ctaBannerDeco1} /><div style={L.ctaBannerDeco2} />
      </section>

    </div>
  );
}

/* ═══════════════════════════════════════
   Styles — 登入後主頁
   ═══════════════════════════════════════ */
const H = {
  page: { paddingTop: '64px', backgroundColor: T.bgBase, minHeight: '100vh' },

  /* 歡迎列 */
  welcomeBar: {
    backgroundColor: T.bgInverse,
    borderBottom: `1px solid rgba(255,255,255,0.06)`,
    padding: '0',
  },
  welcomeInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '20px 40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  welcomeLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  greetText: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px',
    fontWeight: 300,
    color: T.textInverse,
    margin: 0,
    letterSpacing: '0.02em',
  },
  skinBadge: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.15)',
    border: '1px solid rgba(196,137,122,0.3)',
    borderRadius: '999px',
    padding: '3px 10px',
  },
  postBtn: {
    height: '36px',
    padding: '0 20px',
    backgroundColor: T.accent,
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },

  /* 主體雙欄 */
  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 40px 64px',
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
  },
  main: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px', minWidth: 0 },
  sidebar: { width: '300px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '20px' },

  /* 公告條 */
  announce: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: `1px solid rgba(196,137,122,0.25)`,
    borderRadius: '10px',
  },
  announceBadge: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.1em',
    color: '#fff',
    backgroundColor: T.accent,
    borderRadius: '4px',
    padding: '2px 7px',
    whiteSpace: 'nowrap',
  },
  announceText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.textSecondary,
    flex: 1,
  },
  announceClose: {
    background: 'none',
    border: 'none',
    fontSize: '13px',
    color: T.textTertiary,
    cursor: 'pointer',
    padding: '0 4px',
    flexShrink: 0,
  },

  /* Tab */
  tabBar: {
    display: 'flex',
    borderBottom: `1px solid ${T.border}`,
    backgroundColor: T.bgSurface,
    borderRadius: '12px 12px 0 0',
    padding: '0 8px',
  },
  tabBtn: {
    position: 'relative',
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: T.textTertiary,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabActive: { color: T.textPrimary, fontWeight: 500 },
  tabLine: {
    position: 'absolute', bottom: '-1px', left: '12px', right: '12px',
    height: '2px', backgroundColor: T.accent, borderRadius: '999px',
  },

  /* 貼文卡 */
  postCard: {
    backgroundColor: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderRadius: '0',
    padding: '24px 28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    borderTop: 'none',
    cursor: 'pointer',
    transition: 'background-color 180ms',
  },
  postHeader: { display: 'flex', alignItems: 'center', gap: '10px' },
  postAvatar: {
    width: '36px', height: '36px', borderRadius: '50%',
    backgroundColor: T.accent,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '16px', color: '#fff', flexShrink: 0,
  },
  postMeta: { display: 'flex', flexDirection: 'column', gap: '1px', flex: 1 },
  postAuthor: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500, color: T.textPrimary,
  },
  postDept: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: T.textTertiary,
  },
  hotBadge: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 600,
    color: T.accentDark,
    backgroundColor: 'rgba(196,137,122,0.12)',
    border: `1px solid rgba(196,137,122,0.2)`,
    borderRadius: '4px', padding: '2px 7px', whiteSpace: 'nowrap',
  },
  postTag: {
    alignSelf: 'flex-start',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', fontWeight: 500, letterSpacing: '0.05em',
    color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.08)',
    border: `1px solid rgba(196,137,122,0.18)`,
    borderRadius: '999px', padding: '2px 10px',
  },
  postTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px', fontWeight: 400, color: T.textPrimary,
    margin: 0, lineHeight: 1.35,
  },
  postExcerpt: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', color: T.textSecondary,
    lineHeight: 1.65, margin: 0,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  postFooter: {
    display: 'flex', alignItems: 'center', gap: '4px',
    paddingTop: '8px', borderTop: `1px solid ${T.border}`,
    marginTop: '4px',
  },
  postStat: {
    background: 'none', border: 'none', padding: '4px 10px',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '12px', color: T.textTertiary, cursor: 'pointer',
    borderRadius: '6px',
    transition: 'color 140ms, background-color 140ms',
  },
  postStatRight: {
    marginLeft: 'auto',
    background: 'none', border: 'none', padding: '4px 10px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: T.textTertiary, cursor: 'pointer',
    borderRadius: '6px',
  },

  /* Feed empty */
  emptyFeed: {
    backgroundColor: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderTop: 'none',
    borderRadius: '0 0 12px 12px',
    padding: '64px 40px',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
  },
  emptyTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px', fontWeight: 400, color: T.textPrimary, margin: 0,
  },
  emptySub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: T.textTertiary, margin: 0, textAlign: 'center',
  },

  /* Sidebar */
  sideSection: {
    backgroundColor: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderRadius: '12px',
    padding: '20px',
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  sideTitle: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px', fontWeight: 500, letterSpacing: '0.1em',
    color: T.textTertiary, margin: 0, textTransform: 'uppercase',
  },

  /* 活動卡 */
  eventList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  eventCard: {
    backgroundColor: T.bgSubtle,
    border: `1px solid ${T.border}`,
    borderRadius: '10px', padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: '4px',
    transition: 'transform 160ms, box-shadow 160ms',
    cursor: 'pointer',
  },
  eventCardUrgent: {
    backgroundColor: 'rgba(196,137,122,0.08)',
    border: `1px solid rgba(196,137,122,0.25)`,
  },
  eventCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' },
  eventBadge: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
    color: T.textSecondary,
    backgroundColor: T.border,
    borderRadius: '4px', padding: '2px 7px',
  },
  eventBadgeUrgent: { color: T.accentDark, backgroundColor: 'rgba(196,137,122,0.15)' },
  eventDate: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px', color: T.textTertiary, margin: 0,
  },
  eventTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '16px', fontWeight: 400, color: T.textPrimary, margin: 0,
  },
  eventLocation: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: T.accent, margin: 0,
  },
  eventDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: T.textSecondary, lineHeight: 1.6, margin: 0,
  },

  /* 標籤雲 */
  tagCloud: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tagChip: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: T.textSecondary,
  },

  /* 快速入口 */
  quickLinks: { display: 'flex', flexDirection: 'column', gap: '6px' },
  quickLink: {
    display: 'flex', alignItems: 'center', gap: '8px',
    width: '100%', background: 'none',
    border: `1px solid ${T.border}`,
    borderRadius: '8px', padding: '10px 14px',
    cursor: 'pointer', textAlign: 'left',
    transition: 'border-color 150ms, background-color 150ms',
  },
  quickLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500, color: T.textPrimary, flex: 1,
  },
  quickSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: T.textTertiary,
  },
  quickArrow: { color: T.textTertiary, fontSize: '14px', flexShrink: 0 },

  /* 活動 Pop */
  eventPopWrap: {
    position: 'fixed', bottom: '32px', right: '32px', zIndex: 200,
  },
  eventPop: {
    width: '280px',
    backgroundColor: T.bgInverse,
    border: '1px solid rgba(196,137,122,0.2)',
    borderRadius: '14px',
    padding: '20px',
    boxShadow: '0 12px 48px rgba(28,25,23,0.3)',
    display: 'flex', flexDirection: 'column', gap: '8px',
  },
  eventPopHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  eventPopBadge: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.1em',
    color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.15)',
    borderRadius: '4px', padding: '2px 8px',
  },
  eventPopClose: {
    background: 'none', border: 'none',
    fontSize: '13px', color: 'rgba(247,244,242,0.4)',
    cursor: 'pointer', padding: '0 2px',
  },
  eventPopTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '18px', fontWeight: 400, color: T.textInverse,
    margin: 0, lineHeight: 1.3,
  },
  eventPopDate: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'rgba(247,244,242,0.5)', margin: 0,
  },
  eventPopDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'rgba(247,244,242,0.65)',
    lineHeight: 1.6, margin: 0,
  },
  eventPopCta: {
    marginTop: '6px',
    height: '36px', backgroundColor: T.accent,
    color: '#fff', border: 'none', borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
  },
};

/* ═══════════════════════════════════════
   Styles — 未登入首頁
   ═══════════════════════════════════════ */
const L = {
  page: { paddingTop: '64px', backgroundColor: T.bgBase, overflow: 'hidden' },
  hero: {
    position: 'relative', minHeight: '600px',
    display: 'flex', alignItems: 'center',
    padding: '80px 64px', overflow: 'hidden',
    background: `linear-gradient(160deg, ${T.bgSubtle} 0%, ${T.bgBase} 55%)`,
  },
  heroInner: {
    position: 'relative', zIndex: 1,
    maxWidth: '1200px', margin: '0 auto', width: '100%',
    display: 'flex', alignItems: 'center', gap: '80px',
  },
  heroLeft: { flex: '0 0 520px', display: 'flex', flexDirection: 'column', gap: '24px' },
  heroEyebrow: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.18em', color: T.accent, margin: 0, textTransform: 'uppercase',
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '64px', fontWeight: 300, lineHeight: 1.15, color: T.textPrimary, margin: 0,
  },
  heroDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px', color: T.textSecondary, lineHeight: 1.75, margin: 0,
  },
  heroCtas: { display: 'flex', gap: '12px', alignItems: 'center', marginTop: '8px' },
  ctaPrimary: {
    height: '46px', padding: '0 32px', backgroundColor: T.bgInverse,
    color: T.textInverse, border: 'none', borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.06em',
  },
  ctaGhost: {
    height: '46px', padding: '0 24px', backgroundColor: 'transparent',
    color: T.textSecondary, border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', cursor: 'pointer',
  },
  heroRight: { flex: 1, position: 'relative', display: 'flex', justifyContent: 'center' },
  heroCard: {
    backgroundColor: T.bgSurface, borderRadius: '16px',
    border: `1px solid ${T.border}`, padding: '32px', width: '300px',
    display: 'flex', flexDirection: 'column', gap: '12px',
    boxShadow: '0 4px 24px rgba(28,25,23,0.07)',
  },
  cardLabel: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '10px', fontWeight: 500,
    letterSpacing: '0.14em', color: T.accent, margin: 0, textTransform: 'uppercase',
  },
  cardIngredient: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '36px', fontWeight: 400, color: T.textPrimary, margin: 0, lineHeight: 1,
  },
  cardEn: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '13px',
    color: T.textTertiary, margin: '-6px 0 0 0', letterSpacing: '0.06em',
  },
  safeBar: { height: '6px', backgroundColor: T.bgSubtle, borderRadius: '999px', overflow: 'hidden', marginBottom: '4px' },
  safeBarFill: { height: '100%', borderRadius: '999px' },
  safeScore: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '10px',
    color: T.textTertiary, margin: '4px 0 0 0', letterSpacing: '0.04em',
  },
  dotRow: { display: 'flex', gap: '6px', alignItems: 'center', paddingTop: '4px' },
  dot: {
    width: '6px', height: '6px', borderRadius: '50%',
    backgroundColor: T.border, border: 'none', padding: 0, cursor: 'pointer',
    transition: 'background-color 250ms, transform 250ms',
  },
  dotActive: { backgroundColor: T.accent, transform: 'scale(1.3)' },
  cardTags: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  cardTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '11px',
    color: T.textSecondary, backgroundColor: T.bgSubtle, borderRadius: '999px', padding: '3px 10px',
  },
  cardDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '13px',
    color: T.textSecondary, lineHeight: 1.65, margin: '4px 0 0 0',
    borderTop: `1px solid ${T.border}`, paddingTop: '12px',
  },
  floatCard: {
    position: 'absolute', bottom: '-16px', left: '-24px',
    backgroundColor: T.bgInverse, borderRadius: '10px', padding: '10px 16px',
    display: 'flex', alignItems: 'center', gap: '8px',
    boxShadow: '0 4px 16px rgba(28,25,23,0.15)',
  },
  floatIcon: { color: '#7BAE8A', fontSize: '14px', fontWeight: 700 },
  floatText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'rgba(247,244,242,0.8)', whiteSpace: 'nowrap',
  },
  heroDeco1: {
    position: 'absolute', width: '480px', height: '480px', borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.12)`, right: '-80px', top: '-80px', pointerEvents: 'none',
  },
  heroDeco2: {
    position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.08)`, right: '100px', bottom: '-60px', pointerEvents: 'none',
  },
  ticker: { backgroundColor: T.accent, padding: '12px 0', overflow: 'hidden' },
  tickerItem: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '12px', fontWeight: 500,
    letterSpacing: '0.12em', color: '#FFFFFF', padding: '0 20px',
    textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: '20px', whiteSpace: 'nowrap',
  },
  tickerDot: { opacity: 0.6 },
  features: { padding: '96px 64px', maxWidth: '1200px', margin: '0 auto' },
  featuresHeader: { marginBottom: '56px' },
  sectionEyebrow: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.18em', color: T.accent, margin: '0 0 12px 0',
  },
  sectionTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '40px', fontWeight: 400, color: T.textPrimary, margin: 0, lineHeight: 1.2,
  },
  featureGrid: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px',
    border: `1px solid ${T.border}`, borderRadius: '12px', overflow: 'hidden',
  },
  featureCard: {
    backgroundColor: T.bgSurface, padding: '48px 40px',
    display: 'flex', flexDirection: 'column', gap: '16px',
    borderRight: `1px solid ${T.border}`,
  },
  featureNum: {
    fontFamily: '"Cormorant Garamond", serif', fontSize: '48px', fontWeight: 300,
    color: T.accentLight, margin: 0, lineHeight: 1,
  },
  featureTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '24px', fontWeight: 400, color: T.textPrimary, margin: 0,
  },
  featureDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', color: T.textSecondary, lineHeight: 1.7, margin: 0, flex: 1,
  },
  featureCta: {
    background: 'none', border: 'none', padding: 0,
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: T.accent, cursor: 'pointer', fontWeight: 500, textAlign: 'left',
  },
  topics: { backgroundColor: T.bgInverse, padding: '80px 0' },
  topicsInner: { maxWidth: '1200px', margin: '0 auto', padding: '0 64px' },
  topicsHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '40px' },
  sectionTitleLight: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '40px', fontWeight: 400, color: T.textInverse, margin: 0, lineHeight: 1.2,
  },
  viewAllBtn: {
    background: 'none', border: `1px solid rgba(247,244,242,0.2)`, borderRadius: '8px',
    padding: '8px 20px', fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'rgba(247,244,242,0.6)', cursor: 'pointer',
  },
  topicList: { display: 'flex', flexDirection: 'column' },
  topicItem: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '24px 0', borderBottom: `1px solid rgba(247,244,242,0.08)`, gap: '24px',
  },
  topicLeft: { display: 'flex', flexDirection: 'column', gap: '8px' },
  topicTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.08em', color: T.accent, backgroundColor: 'rgba(196,137,122,0.12)',
    padding: '3px 10px', borderRadius: '999px', alignSelf: 'flex-start',
  },
  topicTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px', fontWeight: 400, color: 'rgba(247,244,242,0.85)', margin: 0, lineHeight: 1.35,
  },
  topicRight: { display: 'flex', alignItems: 'center', gap: '16px', flexShrink: 0 },
  topicReads: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '12px',
    color: 'rgba(247,244,242,0.3)', whiteSpace: 'nowrap',
  },
  topicArrow: { color: 'rgba(247,244,242,0.3)', fontSize: '16px' },
  ctaBanner: {
    position: 'relative', backgroundColor: T.bgSubtle, padding: '96px 64px',
    overflow: 'hidden', borderTop: `1px solid ${T.border}`,
  },
  ctaBannerInner: {
    position: 'relative', zIndex: 1, maxWidth: '560px', margin: '0 auto',
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px', textAlign: 'center',
  },
  ctaBannerEyebrow: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.18em', color: T.accent, margin: 0,
  },
  ctaBannerTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '52px', fontWeight: 300, color: T.textPrimary, lineHeight: 1.2, margin: 0,
  },
  ctaBannerSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px', color: T.textSecondary, margin: 0,
  },
  ctaBannerBtns: { display: 'flex', gap: '12px', marginTop: '8px', flexWrap: 'wrap', justifyContent: 'center' },
  ctaBannerPrimary: {
    height: '46px', padding: '0 36px', backgroundColor: T.bgInverse,
    color: T.textInverse, border: 'none', borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', fontWeight: 500, cursor: 'pointer', letterSpacing: '0.06em',
  },
  ctaBannerGhost: {
    height: '46px', padding: '0 28px', backgroundColor: 'transparent',
    color: T.textSecondary, border: `1px solid ${T.border}`, borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px', cursor: 'pointer',
  },
  ctaBannerDeco1: {
    position: 'absolute', width: '500px', height: '500px', borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.15)`, right: '-100px', top: '-150px', pointerEvents: 'none',
  },
  ctaBannerDeco2: {
    position: 'absolute', width: '300px', height: '300px', borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.1)`, left: '-60px', bottom: '-80px', pointerEvents: 'none',
  },
};

export default Hero;
