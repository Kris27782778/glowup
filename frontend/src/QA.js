import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from './hooks/useReveal';
import { useLang } from './hooks/useLang';

/* ─── Mock data ─────────────────────────────────────────── */
const MOCK_QUESTIONS = [
  {
    id: 1, initial: '陳', authorColor: '#9E8A7A',
    author: '陳柔安', dept: '護理學系', time: '1 小時前',
    tags: ['成分討論', '敏感肌'],
    title: '乳酸和杏仁酸可以交替使用嗎？濃度怎麼配？',
    excerpt: '我目前有一瓶 8% 乳酸和一瓶 6% 杏仁酸，想了解這兩種果酸交替使用的邏輯，晚上用完之後早上要加強保濕嗎？',
    views: 312, solved: true, hot: true,
    aiAnswer: '乳酸（Lactic Acid）與杏仁酸（Mandelic Acid）均屬 AHA，但分子量與滲透速率不同。杏仁酸分子較大，刺激性低，適合敏感肌入門；乳酸滲透較深，保濕效果也更佳。\n\n交替使用的邏輯：建議以「週一三五用杏仁酸、週二四六用乳酸」的輪替方式，避免每日使用同一種酸造成累積刺激。用後的早晨需加強保濕並確實防曬（SPF 30+），因為 AHA 會提升光敏感性。若發現泛紅刺痛，立即暫停並回歸基礎保養 3–5 天。',
    expert: { initial: '王', color: '#7A8A9E', name: '王思涵', badge: '化學系・成分達人', answer: '補充一點：乳酸的保濕效果源自其本身就是 NMF（天然保濕因子）的成分之一。如果你的主要需求是去角質兼保濕，晚上可以只用乳酸，不一定需要輪替。杏仁酸比較適合有在處理粉刺或毛孔問題的情況。', likes: 31 },
    community: [
      { initial: '林', color: '#C4897A', name: '林小羽', dept: '化妝品系', time: '45 分鐘前', text: '我之前也在糾結這個！最後選擇週間用杏仁酸、週末只做保濕不用酸，皮膚反而穩很多，供參考。', likes: 12 },
      { initial: '吳', color: '#9A7AA0', name: '吳宜庭', dept: '生物科技學系', time: '2 小時前', text: '同樣敏感肌，我的經驗是不管哪種酸用完一定要搭凡士林封層，乾燥感會好很多。', likes: 8 },
    ],
  },
  {
    id: 2, initial: '王', authorColor: '#7A8A9E',
    author: '王思涵', dept: '化學系', time: '3 小時前',
    tags: ['抗老', '成分討論'],
    title: 'A 醇初學者從多少濃度開始？搭配什麼保濕品比較不刺激？',
    excerpt: '想嘗試視黃醇但超怕刺激，看過很多說法都不太一樣，想問有實際用過的人從哪個濃度入門，怎麼搭配保養步驟比較安全。',
    views: 589, solved: false, hot: true,
    aiAnswer: '視黃醇（Retinol）建議初學者從 0.025%–0.05% 開始，每週使用 2 次，持續 4 週若無不適再增加頻率。「三明治法」是目前公認最能降低刺激性的用法：先塗保濕品（薄薄一層），再塗視黃醇，最後再加一層保濕鎖住。\n\n搭配建議：避免同一晚使用酸類（AHA/BHA）或維生素 C；白天務必使用 SPF 50+ 防曬。初期可能出現脫屑、泛紅屬正常「維 A 反應期」，通常 4–6 週後皮膚會自行調適。',
    expert: { initial: '黃', color: '#A08060', name: '黃品蓁', badge: '化妝品系・配方研究', answer: '補充一個不常被提到的點：視黃醇在光線下會加速降解，所以一定要儲存在避光容器裡，並且只在夜間使用。便宜但包裝不避光的產品，效果打折很多。另外，如果你的保濕品含有 niacinamide，跟 A 醇搭配反而可以有效減緩初期刺激。', likes: 47 },
    community: [
      { initial: '陳', color: '#9E8A7A', name: '陳柔安', dept: '護理學系', time: '1 小時前', text: '我從 0.025% 開始用，三明治法真的有效！第一個月有點乾，但現在膚況穩很多，毛孔也細緻了。', likes: 19 },
      { initial: '張', color: '#8A9E7A', name: '張宇軒', dept: '資訊管理學系', time: '2 小時前', text: 'The Ordinary 0.2% 入門款很多人推薦，但我覺得它乳狀質地比較難推開，換成 0.1% 膠囊型的反而好操作很多。', likes: 14 },
    ],
  },
  {
    id: 3, initial: '林', authorColor: '#C4897A',
    author: '林小羽', dept: '化妝品系', time: '5 小時前',
    tags: ['油性肌', '保濕'],
    title: '油性肌夏天還需要用乳液嗎？還是只擦化妝水就夠了？',
    excerpt: '夏天臉超油，擦完乳液更悶，但又擔心不擦會缺水，想知道油性肌的最簡保養到底應該幾個步驟。',
    views: 187, solved: false, hot: false,
    aiAnswer: '皮脂與水分是兩個獨立的系統，油性肌不代表不缺水。夏天建議改用「無油保濕精華」取代乳液，成分看 glycerin（甘油）、hyaluronic acid（玻尿酸）、panthenol（泛醇）等，比傳統乳液輕薄許多。\n\n最簡保養流程（夏季油肌版）：溫和胺基酸洗面乳 → 化妝水（含水、甘油） → 輕薄保濕精華 → 防曬。乳液不是必備，但保濕精華仍建議保留，避免皮膚因缺水反而分泌更多皮脂。',
    expert: { initial: '吳', color: '#9A7AA0', name: '吳宜庭', badge: '生物科技學系・成分研究', answer: '油性肌夏天最常犯的錯是「過度清潔」，以為洗越乾淨越好，其實反而刺激更多皮脂分泌。建議早上只用清水或很溫和的潔顏泡，不需要每次洗臉都用洗面乳。', likes: 23 },
    community: [
      { initial: '黃', color: '#A08060', name: '黃品蓁', dept: '化妝品系', time: '3 小時前', text: '我油肌夏天只用化妝水（含 glycerin）+ 防曬，省掉精華和乳液，反而比較清爽不出油。', likes: 31 },
    ],
  },
  {
    id: 4, initial: '張', authorColor: '#8A9E7A',
    author: '張宇軒', dept: '資訊管理學系', time: '昨天',
    tags: ['防曬推薦', '混合性肌'],
    title: '混合肌用物理防曬還是化學防曬比較合適？',
    excerpt: '試過幾款化學防曬都覺得油油的，物理防曬又容易卡粉，想知道有沒有混合肌適合的選擇重點可以參考。',
    views: 423, solved: true, hot: false,
    aiAnswer: '物理防曬（氧化鋅/二氧化鈦）成膜感較重，容易泛白卡粉，但對敏感肌較溫和；化學防曬質地輕薄，但部分成分（如 Avobenzone）可能刺激敏感部位。混合肌的最佳解通常是「混合型配方」——同時含物理與化學防曬劑，兼顧輕薄與安全性。\n\n選購重點：尋找標示「Oil-Free」或「Sebum Control」的化學防曬；或選用奈米氧化鋅比例高的物理防曬，泛白感已大幅改善。PA++++ + SPF 50+ 為戶外日常首選。',
    expert: { initial: '林', color: '#C4897A', name: '林小羽', badge: '化妝品系・彩妝研究', answer: '混合肌分區保養的邏輯也可以用在防曬：T 區用控油化學防曬（輕薄不悶），兩頰用物理防曬（保護敏感部位）。雖然麻煩，但這樣體驗確實最好。', likes: 18 },
    community: [
      { initial: '陳', color: '#9E8A7A', name: '陳柔安', dept: '護理學系', time: '昨天', text: '我後來改用韓系水感防曬（含化學+物理混合），一點都不悶，而且上妝服貼很多，混合肌推薦！', likes: 27 },
      { initial: '吳', color: '#9A7AA0', name: '吳宜庭', dept: '生物科技學系', time: '昨天', text: '記得補擦的時候可以用防曬噴霧或蜜粉型防曬，不用全部洗掉重來，方便很多。', likes: 9 },
    ],
  },
  {
    id: 5, initial: '黃', authorColor: '#A08060',
    author: '黃品蓁', dept: '化妝品系', time: '2 天前',
    tags: ['屏障修護', '敏感肌'],
    title: '過度清潔造成屏障受損，修復期間要停用所有活性成分嗎？',
    excerpt: '上個月換了洗臉機，臉開始乾癢脫皮。想問修護期間煙醯胺、神經醯胺還能用嗎？還是全部停掉？',
    views: 754, solved: true, hot: true,
    aiAnswer: '屏障受損期間的保養原則是「最小刺激，最大修復」。需要立即停用的成分：AHA/BHA/視黃醇/高濃度維生素 C 等活性成分。可以繼續使用的有益成分：神經醯胺（Ceramide）、膽固醇（Cholesterol）、脂肪酸三合一配方是修復屏障的黃金組合；菸鹼醯胺低濃度（2-5%）溫和版亦可保留。\n\n建議流程：只用胺基酸潔顏（早上可省略用洗面乳）→ 含神經醯胺的修護霜 → 凡士林或乳木果油封層。一般 2–4 週可見明顯改善。',
    expert: { initial: '王', color: '#7A8A9E', name: '王思涵', badge: '化學系・成分達人', answer: '另外提醒：洗臉機的刷頭會物理摩擦，即便換回正常洗法，屏障修復期仍要避免使用任何去角質工具或磨砂膏。日曬也是屏障最大的敵人，修護期間建議特別留意防曬。', likes: 52 },
    community: [
      { initial: '林', color: '#C4897A', name: '林小羽', dept: '化妝品系', time: '2 天前', text: '我遇過一樣情況，停掉所有東西只用 CeraVe 修護霜 + 凡士林，兩週後好了大半，真的不需要很複雜。', likes: 44 },
      { initial: '陳', color: '#9E8A7A', name: '陳柔安', dept: '護理學系', time: '2 天前', text: '護理學系課有教過，屏障修復跟腸黏膜修復類似，最重要是停止傷害，讓細胞自然重建，別急著加東西。', likes: 38 },
    ],
  },
  {
    id: 6, initial: '吳', authorColor: '#9A7AA0',
    author: '吳宜庭', dept: '生物科技學系', time: '3 天前',
    tags: ['成分討論', '保濕'],
    title: '玻尿酸塗完反而更乾？用法或濃度哪裡出問題？',
    excerpt: '不管先濕後乾還是乾著直接塗，感覺到最後都更乾燥。是分子量的問題還是我步驟有問題？',
    views: 891, solved: true, hot: false,
    aiAnswer: '玻尿酸（Hyaluronic Acid）是雙向吸濕劑——在濕度充足的環境從外界吸水；但在乾燥環境中反而會從皮膚深層「抽水」到表面蒸發，造成更乾的感受。這就是「越擦越乾」的根本原因。\n\n解決方式：①塗完玻尿酸必須立刻用保濕霜/乳液封住，避免水分蒸散；②選擇多分子量配方（大+中+小分子），同時補充表面與深層水分；③在環境濕度低於 60% 時，單獨使用高分子玻尿酸效果有限，建議搭配 glycerin 或 panthenol 提升吸濕效率。',
    expert: { initial: '黃', color: '#A08060', name: '黃品蓁', badge: '化妝品系・配方研究', answer: '再補充：市售「玻尿酸精華」很多其實主要成分是水和甘油，玻尿酸含量極低（0.01% 以下也算有添加）。如果你買的產品第一成分是水，第二是 glycerin，效果主要來自甘油而非玻尿酸，但其實甘油的吸濕效果反而更穩定。', likes: 61 },
    community: [
      { initial: '張', color: '#8A9E7A', name: '張宇軒', dept: '資訊管理學系', time: '3 天前', text: '我之前也有這個問題，後來理解原理之後就改先噴化妝水讓臉有點濕，馬上塗玻尿酸精華，再立刻加乳液，完全解決了。', likes: 29 },
      { initial: '林', color: '#C4897A', name: '林小羽', dept: '化妝品系', time: '3 天前', text: '住宿舍冬天超乾，我都直接加濕器開著用，玻尿酸效果差很多，環境濕度真的很重要。', likes: 17 },
    ],
  },
];

const ALL_TAGS = ['全部', '成分討論', '油性肌', '敏感肌', '混合性肌', '保濕', '防曬推薦', '抗老', '屏障修護'];

const HOT_TAGS = [
  { tag: '#果酸', count: 18 },
  { tag: '#視黃醇', count: 27 },
  { tag: '#防曬選擇', count: 15 },
  { tag: '#屏障修護', count: 31 },
  { tag: '#玻尿酸', count: 22 },
];

const TOP_ANSWERERS = [
  { initial: '王', color: '#7A8A9E', name: '王思涵', answers: 36 },
  { initial: '吳', color: '#9A7AA0', name: '吳宜庭', answers: 28 },
  { initial: '林', color: '#C4897A', name: '林小羽', answers: 21 },
];

/* ─── 主元件 ─────────────────────────────────────────────── */
export default function QA() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [tab,         setTab]         = useState('all');
  const [activeTag,   setActiveTag]   = useState('全部');
  const [search,      setSearch]      = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [expandedId,  setExpandedId]  = useState(null);
  useReveal();

  const TABS = [
    { key: 'all',      label: t('全部問題') || '全部問題' },
    { key: 'unsolved', label: t('未解決') || '未解決' },
    { key: 'solved',   label: t('已解決') || '已解決' },
    { key: 'mine',     label: t('我的提問') || '我的提問' },
  ];

  const filtered = MOCK_QUESTIONS
    .filter(q => {
      if (tab === 'solved')   return q.solved;
      if (tab === 'unsolved') return !q.solved;
      return true;
    })
    .filter(q => activeTag === '全部' || q.tags.includes(activeTag))
    .filter(q => !search || q.title.includes(search) || q.excerpt.includes(search));

  const unsolvedCount = MOCK_QUESTIONS.filter(q => !q.solved).length;

  const handleToggle = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <p style={s.heroEyebrow}>Q &amp; A</p>
            <h1 style={s.heroTitle}>{t('問答')}</h1>
            <p style={s.heroSub}>
              {t('向社群提出你的保養疑問，獲得同學的真實解答。') || '向社群提出你的保養疑問，獲得同學的真實解答。'}
            </p>
          </div>
          <div style={s.heroStats}>
            {[
              { num: '486',   label: t('個問題') || '個問題' },
              { num: '2,130', label: t('則回答') || '則回答' },
              { num: `${unsolvedCount}`, label: t('待解決') || '待解決' },
            ].map(item => (
              <div key={item.label} style={s.statItem}>
                <span style={s.statNum}>{item.num}</span>
                <span style={s.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 搜尋列 */}
        <div style={s.searchRow}>
          <div style={{ ...s.searchBox, ...(searchFocus ? s.searchBoxFocus : {}) }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(247,244,242,0.45)" strokeWidth="1.4"/>
              <path d="M10 10L13 13" stroke="rgba(247,244,242,0.45)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              style={s.searchInput}
              type="text"
              placeholder={t('搜尋問題、成分、關鍵字…') || '搜尋問題、成分、關鍵字…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>
          <button style={s.askBtn}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            {t('提出問題') || '提出問題'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={s.body}>

        {/* ── Main ── */}
        <main style={s.main}>

          {/* Tab 列 */}
          <div style={s.tabRow}>
            <div style={s.tabs}>
              {TABS.map(tb => (
                <button
                  key={tb.key}
                  style={{ ...s.tab, ...(tab === tb.key ? s.tabActive : {}) }}
                  onClick={() => setTab(tb.key)}
                >
                  {tb.label}
                  {tab === tb.key && <span style={s.tabLine} />}
                </button>
              ))}
            </div>
            <span style={s.postCount}>{filtered.length} {t('題') || '題'}</span>
          </div>

          {/* 標籤 filter */}
          <div style={s.tagRow}>
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                style={{ ...s.tagChip, ...(activeTag === tag ? s.tagChipActive : {}) }}
                onClick={() => setActiveTag(tag)}
              >
                {t(tag) || tag}
              </button>
            ))}
          </div>

          {/* 問題列表 */}
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <p style={s.emptyTitle}>{t('找不到符合的問題') || '找不到符合的問題'}</p>
              <p style={s.emptySub}>{t('試試其他關鍵字或標籤') || '試試其他關鍵字或標籤'}</p>
            </div>
          ) : (
            filtered.map((q, i) => (
              <QuestionCard
                key={q.id}
                question={q}
                idx={i}
                t={t}
                expanded={expandedId === q.id}
                onToggle={() => handleToggle(q.id)}
              />
            ))
          )}
        </main>

        {/* ── Sidebar ── */}
        <aside style={s.sidebar}>

          {/* 三層回答說明 */}
          <div style={s.sideCard} className="g-reveal">
            <p style={s.sideTitle}>{t('回答系統') || '回答系統'}</p>
            <div style={s.tierList}>
              <div style={s.tierRow}>
                <div style={{ ...s.tierDot, backgroundColor: '#6B8CBA' }}>
                  <AIIcon size={10} />
                </div>
                <div style={s.tierInfo}>
                  <span style={s.tierName}>GLŌW AI</span>
                  <span style={s.tierDesc}>{t('成分科學分析') || '成分科學分析'}</span>
                </div>
              </div>
              <div style={s.tierRow}>
                <div style={{ ...s.tierDot, backgroundColor: '#C4A35A' }}>
                  <ExpertIcon size={10} />
                </div>
                <div style={s.tierInfo}>
                  <span style={s.tierName}>{t('專家解答') || '專家解答'}</span>
                  <span style={s.tierDesc}>{t('專業背景認證') || '專業背景認證'}</span>
                </div>
              </div>
              <div style={s.tierRow}>
                <div style={{ ...s.tierDot, backgroundColor: '#7AAE8A' }}>
                  <CommunityIcon size={10} />
                </div>
                <div style={s.tierInfo}>
                  <span style={s.tierName}>{t('社群回答') || '社群回答'}</span>
                  <span style={s.tierDesc}>{t('真實使用經驗') || '真實使用經驗'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* 熱門標籤 */}
          <div style={s.sideCard} className="g-reveal delay-1">
            <p style={s.sideTitle}>{t('熱門標籤') || '熱門標籤'}</p>
            <div style={s.tagCloud}>
              {HOT_TAGS.map((item, i) => (
                <div key={item.tag} style={s.hotTagRow}>
                  <span style={s.hotTagRank}>{i + 1}</span>
                  <span style={s.hotTagText}>{item.tag}</span>
                  <span style={s.hotTagCount}>{item.count} {t('題') || '題'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 優質回答者 */}
          <div style={s.sideCard} className="g-reveal delay-2">
            <p style={s.sideTitle}>{t('優質回答者') || '優質回答者'}</p>
            <div style={s.memberList}>
              {TOP_ANSWERERS.map(m => (
                <div key={m.name} style={s.memberRow}>
                  <div style={{ ...s.memberAvatar, backgroundColor: m.color }}>{m.initial}</div>
                  <div style={s.memberInfo}>
                    <span style={s.memberName}>{m.name}</span>
                    <span style={s.memberSub}>{m.answers} {t('則回答') || '則回答'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快速入口 */}
          <div style={s.sideCard} className="g-reveal delay-2">
            <p style={s.sideTitle}>{t('快速入口')}</p>
            <button style={s.quickBtn} onClick={() => navigate('/community')}>
              <span>{t('社群討論')}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>→</span>
            </button>
            <button style={s.quickBtn} onClick={() => navigate('/products')}>
              <span>{t('成分資料庫')}</span>
              <span style={{ color: 'var(--text-tertiary)' }}>→</span>
            </button>
          </div>

        </aside>
      </div>
    </div>
  );
}

/* ─── 問題卡片（含三層回答展開） ───────────────────────── */
function QuestionCard({ question: q, idx, t, expanded, onToggle }) {
  return (
    <div style={{ ...s.card, animationDelay: `${idx * 60}ms` }} className="g-fade-up">

      {/* ── 問題標頭 ── */}
      <div style={s.cardTop}>
        <div style={s.authorRow}>
          <div style={{ ...s.avatar, backgroundColor: q.authorColor }}>{q.initial}</div>
          <div style={s.authorInfo}>
            <span style={s.authorName}>{q.author}</span>
            <span style={s.authorMeta}>{q.dept} · {q.time}</span>
          </div>
        </div>
        <div style={s.badges}>
          {q.hot && <span style={s.hotBadge}>{t('熱門') || '熱門'}</span>}
          <span style={{ ...s.statusBadge, ...(q.solved ? s.statusSolved : s.statusUnsolved) }}>
            {q.solved ? (t('已解決') || '已解決') : (t('待解決') || '待解決')}
          </span>
        </div>
      </div>

      {/* 標籤 */}
      <div style={s.cardTags}>
        {q.tags.map(tag => (
          <span key={tag} style={s.cardTag}>{t(tag) || tag}</span>
        ))}
      </div>

      {/* 標題 + 摘要 */}
      <h3 style={s.cardTitle}>{q.title}</h3>
      <p style={s.cardExcerpt}>{q.excerpt}</p>

      {/* 底部操作列 */}
      <div style={s.cardFooter}>
        <div style={s.footerStats}>
          <span style={{ ...s.answerCount, ...(q.solved ? s.answerCountSolved : {}) }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z"
                stroke={q.solved ? 'var(--accent)' : 'var(--text-tertiary)'}
                strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            {(q.community?.length || 0) + (q.expert ? 1 : 0) + 1} {t('則回答') || '則回答'}
          </span>
          <span style={s.viewCount}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <ellipse cx="6.5" cy="6.5" rx="5.5" ry="3.5" stroke="var(--text-tertiary)" strokeWidth="1.2"/>
              <circle cx="6.5" cy="6.5" r="1.5" fill="var(--text-tertiary)"/>
            </svg>
            {q.views}
          </span>
        </div>
        <button style={s.expandBtn} onClick={onToggle}>
          {expanded
            ? (t('收起回答') || '收起回答')
            : (t('查看回答') || '查看回答')
          }
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
            <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>

      {/* ── 三層回答展開區 ── */}
      {expanded && (
        <div style={s.answerPanel}>

          {/* ── Tier 1：GLŌW AI ── */}
          <div style={s.tierBlock}>
            <div style={s.tierHeader}>
              <div style={s.tierBadgeAI}>
                <AIIcon size={12} />
                <span>GLŌW AI</span>
              </div>
              <span style={s.tierHeaderLabel}>{t('智能成分分析') || '智能成分分析'}</span>
            </div>
            <div style={s.tierBodyAI}>
              <div style={s.aiGlow} />
              <p style={s.tierText}>
                {q.aiAnswer.split('\n\n').map((para, i) => (
                  <span key={i}>{para}{i < q.aiAnswer.split('\n\n').length - 1 && <><br /><br /></>}</span>
                ))}
              </p>
            </div>
          </div>

          {/* ── Tier 2：專家解答 ── */}
          {q.expert && (
            <div style={s.tierBlock}>
              <div style={s.tierHeader}>
                <div style={s.tierBadgeExpert}>
                  <ExpertIcon size={12} />
                  <span>{t('專家解答') || '專家解答'}</span>
                </div>
                <span style={s.tierHeaderLabel}>{q.expert.badge}</span>
              </div>
              <div style={s.tierBodyExpert}>
                <div style={s.expertAuthorRow}>
                  <div style={{ ...s.expertAvatar, backgroundColor: q.expert.color }}>
                    {q.expert.initial}
                  </div>
                  <span style={s.expertName}>{q.expert.name}</span>
                  <div style={s.expertVerified}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.5" fill="#C4A35A" fillOpacity="0.15" stroke="#C4A35A" strokeWidth="1"/>
                      <path d="M3.5 6l2 2 3-3.5" stroke="#C4A35A" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <span style={s.expertVerifiedText}>{t('認證') || '認證'}</span>
                  </div>
                </div>
                <p style={s.tierText}>{q.expert.answer}</p>
                <div style={s.answerMeta}>
                  <button style={s.likeBtn}>
                    <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                      <path d="M6.5 11S1 7.5 1 4a2.5 2.5 0 015-0 2.5 2.5 0 015 0C11 7.5 6.5 11 6.5 11z"
                        stroke="#C4A35A" strokeWidth="1.2" strokeLinejoin="round" fill="rgba(196,163,90,0.15)"/>
                    </svg>
                    {q.expert.likes}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ── Tier 3：社群回答 ── */}
          {q.community && q.community.length > 0 && (
            <div style={s.tierBlock}>
              <div style={s.tierHeader}>
                <div style={s.tierBadgeCommunity}>
                  <CommunityIcon size={12} />
                  <span>{t('社群回答') || '社群回答'}</span>
                </div>
                <span style={s.tierHeaderLabel}>{q.community.length} {t('則') || '則'}</span>
              </div>
              <div style={s.tierBodyCommunity}>
                {q.community.map((c, i) => (
                  <div key={i} style={{ ...s.communityAnswer, ...(i < q.community.length - 1 ? s.communityAnswerBorder : {}) }}>
                    <div style={s.communityAuthorRow}>
                      <div style={{ ...s.communityAvatar, backgroundColor: c.color }}>{c.initial}</div>
                      <div style={s.communityAuthorInfo}>
                        <span style={s.communityName}>{c.name}</span>
                        <span style={s.communityMeta}>{c.dept} · {c.time}</span>
                      </div>
                      <button style={s.likeBtn}>
                        <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                          <path d="M6.5 11S1 7.5 1 4a2.5 2.5 0 015-0 2.5 2.5 0 015 0C11 7.5 6.5 11 6.5 11z"
                            stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinejoin="round"/>
                        </svg>
                        {c.likes}
                      </button>
                    </div>
                    <p style={s.communityText}>{c.text}</p>
                  </div>
                ))}
                <button style={s.replyBtn}>
                  <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                    <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  {t('回答此問題') || '回答此問題'}
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Icons ─────────────────────────────────────────────── */
function AIIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <path d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11l-1.5-3.5L2 6l3.5-1.5L7 1z"
        fill="currentColor" fillOpacity="0.9"/>
    </svg>
  );
}

function ExpertIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M4.5 7l2 2 3-3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

function CommunityIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 14 14" fill="none">
      <circle cx="5" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2"/>
      <circle cx="10" cy="5" r="2" stroke="currentColor" strokeWidth="1.2"/>
      <path d="M1 12c0-2.2 1.8-4 4-4s4 1.8 4 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
      <path d="M10 9c1.6.4 3 1.7 3 3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const s = {
  page: {
    paddingTop: '64px',
    backgroundColor: 'var(--bg-base)',
    minHeight: '100vh',
  },

  /* Hero */
  hero: {
    backgroundColor: '#1C1917',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '48px 40px 32px',
  },
  heroInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    gap: '32px',
    flexWrap: 'wrap',
  },
  heroLeft: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  heroEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.18em',
    color: 'var(--accent)',
    margin: 0,
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '40px',
    fontWeight: 300,
    color: '#F7F4F2',
    margin: 0,
    letterSpacing: '0.04em',
  },
  heroSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'rgba(247,244,242,0.45)',
    margin: 0,
    maxWidth: '440px',
    lineHeight: 1.6,
  },
  heroStats: {
    display: 'flex',
    gap: '32px',
    paddingBottom: '4px',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
  },
  statNum: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '28px',
    fontWeight: 400,
    color: '#F7F4F2',
    lineHeight: 1,
  },
  statLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: 'rgba(247,244,242,0.4)',
  },

  /* Search row */
  searchRow: {
    maxWidth: '1100px',
    margin: '24px auto 0',
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  searchBox: {
    flex: 1,
    maxWidth: '480px',
    height: '44px',
    backgroundColor: 'rgba(247,244,242,0.07)',
    border: '1px solid rgba(247,244,242,0.12)',
    borderRadius: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '0 16px',
    transition: 'border-color 150ms, background-color 150ms',
  },
  searchBoxFocus: {
    backgroundColor: 'rgba(247,244,242,0.11)',
    borderColor: 'rgba(196,137,122,0.5)',
  },
  searchInput: {
    flex: 1,
    background: 'none',
    border: 'none',
    outline: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: '#F7F4F2',
  },
  askBtn: {
    height: '44px',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--accent)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '10px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.02em',
    whiteSpace: 'nowrap',
  },

  /* Body */
  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '32px 40px 64px',
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
  },
  main: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  sidebar: {
    width: '260px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'sticky',
    top: '80px',
  },

  /* Tabs */
  tabRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottom: '1px solid var(--border)',
  },
  tabs: { display: 'flex' },
  tab: {
    position: 'relative',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
  },
  tabActive: { color: 'var(--text-primary)', fontWeight: 500 },
  tabLine: {
    position: 'absolute',
    bottom: '-1px',
    left: '16px',
    right: '16px',
    height: '2px',
    backgroundColor: 'var(--accent)',
    borderRadius: '2px 2px 0 0',
  },
  postCount: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
  },

  /* Tag filter */
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tagChip: {
    height: '28px',
    padding: '0 12px',
    borderRadius: '999px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  tagChipActive: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#FFFFFF',
  },

  /* Question card */
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'box-shadow 200ms',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: '12px',
  },
  authorRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '15px', color: '#FFFFFF', flexShrink: 0,
  },
  authorInfo: { display: 'flex', flexDirection: 'column', gap: '1px' },
  authorName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)',
  },
  authorMeta: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
  },
  badges: { display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 },
  hotBadge: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
    color: 'var(--accent)',
    backgroundColor: 'rgba(196,137,122,0.12)',
    border: '1px solid rgba(196,137,122,0.2)',
    borderRadius: '999px', padding: '2px 8px',
  },
  statusBadge: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '10px', fontWeight: 500,
    borderRadius: '999px', padding: '2px 9px', letterSpacing: '0.03em',
  },
  statusSolved: {
    color: '#5A9E7A',
    backgroundColor: 'rgba(90,158,122,0.1)',
    border: '1px solid rgba(90,158,122,0.2)',
  },
  statusUnsolved: {
    color: 'var(--text-tertiary)',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
  },
  cardTags: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  cardTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '999px', padding: '2px 8px',
  },
  cardTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px', fontWeight: 400,
    color: 'var(--text-primary)', margin: 0,
    lineHeight: 1.35, letterSpacing: '0.01em',
  },
  cardExcerpt: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-secondary)', margin: 0,
    lineHeight: 1.65,
    display: '-webkit-box', WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '8px', borderTop: '1px solid var(--border)', marginTop: '2px',
  },
  footerStats: { display: 'flex', alignItems: 'center', gap: '14px' },
  answerCount: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'var(--text-tertiary)',
  },
  answerCountSolved: { color: 'var(--accent)' },
  viewCount: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '12px', color: 'var(--text-tertiary)',
  },
  expandBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: 'none',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'var(--text-secondary)',
    cursor: 'pointer', padding: '5px 12px',
    transition: 'border-color 150ms',
  },

  /* ── Answer Panel ── */
  answerPanel: {
    marginTop: '4px',
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    borderTop: '1px solid var(--border)',
    paddingTop: '16px',
  },
  tierBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    marginBottom: '12px',
  },
  tierHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '10px',
  },
  tierHeaderLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },

  /* AI tier */
  tierBadgeAI: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em',
    color: '#6B8CBA',
    backgroundColor: 'rgba(107,140,186,0.1)',
    border: '1px solid rgba(107,140,186,0.25)',
    borderRadius: '999px', padding: '3px 10px',
  },
  tierBodyAI: {
    position: 'relative',
    backgroundColor: 'rgba(107,140,186,0.05)',
    border: '1px solid rgba(107,140,186,0.15)',
    borderRadius: '10px',
    padding: '16px 18px',
    overflow: 'hidden',
  },
  aiGlow: {
    position: 'absolute',
    top: '-40px', right: '-40px',
    width: '120px', height: '120px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, rgba(107,140,186,0.15) 0%, transparent 70%)',
    pointerEvents: 'none',
  },
  tierText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.75,
    margin: 0,
    position: 'relative',
  },

  /* Expert tier */
  tierBadgeExpert: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', fontWeight: 600,
    color: '#C4A35A',
    backgroundColor: 'rgba(196,163,90,0.1)',
    border: '1px solid rgba(196,163,90,0.25)',
    borderRadius: '999px', padding: '3px 10px',
  },
  tierBodyExpert: {
    backgroundColor: 'rgba(196,163,90,0.04)',
    border: '1px solid rgba(196,163,90,0.15)',
    borderRadius: '10px',
    padding: '14px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  expertAuthorRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  expertAvatar: {
    width: '26px', height: '26px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '12px', color: '#FFFFFF', flexShrink: 0,
  },
  expertName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
    flex: 1,
  },
  expertVerified: {
    display: 'flex', alignItems: 'center', gap: '3px',
  },
  expertVerifiedText: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', color: '#C4A35A', fontWeight: 500,
  },
  answerMeta: {
    display: 'flex', alignItems: 'center',
  },
  likeBtn: {
    display: 'flex', alignItems: 'center', gap: '4px',
    background: 'none', border: 'none',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '12px', color: 'var(--text-tertiary)',
    cursor: 'pointer', padding: '2px 0',
  },

  /* Community tier */
  tierBadgeCommunity: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', fontWeight: 600,
    color: '#5A9E7A',
    backgroundColor: 'rgba(90,158,122,0.1)',
    border: '1px solid rgba(90,158,122,0.2)',
    borderRadius: '999px', padding: '3px 10px',
  },
  tierBodyCommunity: {
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '4px 0',
    display: 'flex',
    flexDirection: 'column',
  },
  communityAnswer: {
    padding: '12px 18px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  communityAnswerBorder: {
    borderBottom: '1px solid var(--border)',
  },
  communityAuthorRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
  },
  communityAvatar: {
    width: '24px', height: '24px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '11px', color: '#FFFFFF', flexShrink: 0,
  },
  communityAuthorInfo: {
    flex: 1, display: 'flex', flexDirection: 'column', gap: '1px',
  },
  communityName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
  },
  communityMeta: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '10px', color: 'var(--text-tertiary)',
  },
  communityText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-secondary)',
    lineHeight: 1.65, margin: 0,
  },
  replyBtn: {
    display: 'flex', alignItems: 'center', gap: '6px',
    margin: '10px 18px 14px',
    padding: '8px 14px',
    backgroundColor: 'transparent',
    border: '1px dashed var(--border)',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'var(--text-tertiary)',
    cursor: 'pointer',
    alignSelf: 'flex-start',
    transition: 'border-color 150ms, color 150ms',
  },

  /* Tier list (sidebar) */
  tierList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tierRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tierDot: {
    width: '26px', height: '26px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#FFFFFF', flexShrink: 0,
  },
  tierInfo: {
    display: 'flex', flexDirection: 'column', gap: '1px',
  },
  tierName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)',
  },
  tierDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '10px', color: 'var(--text-tertiary)',
  },

  /* Empty */
  empty: { padding: '48px 0', textAlign: 'center' },
  emptyTitle: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '22px', fontWeight: 400,
    color: 'var(--text-secondary)', margin: '0 0 8px',
  },
  emptySub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-tertiary)', margin: 0,
  },

  /* Sidebar card */
  sideCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '18px 16px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sideTitle: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase',
    color: 'var(--accent)', margin: 0,
  },

  /* Hot tags */
  tagCloud: { display: 'flex', flexDirection: 'column', gap: '8px' },
  hotTagRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  hotTagRank: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px', fontWeight: 600, color: 'var(--text-tertiary)', width: '16px',
  },
  hotTagText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-secondary)', flex: 1,
  },
  hotTagCount: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
  },

  /* Members */
  memberList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  memberRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  memberAvatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '13px', color: '#FFFFFF', flexShrink: 0,
  },
  memberInfo: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 },
  memberName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-primary)', fontWeight: 500,
  },
  memberSub: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
  },

  /* Quick buttons */
  quickBtn: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    width: '100%', padding: '9px 12px',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
};
