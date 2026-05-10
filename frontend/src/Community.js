import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from './hooks/useReveal';

/* ─── 設計 tokens ────────────────────────────────────────── */
const T = {
  bgBase:        '#F7F4F2',
  bgSurface:     '#FFFFFF',
  bgSubtle:      '#F0EBE7',
  accent:        '#C4897A',
  accentDark:    '#9E6457',
  accentLight:   '#E8C4BA',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  border:        '#E5DDD9',
  safe:          '#7BAE8A',
  caution:       '#D4A843',
  risk:          '#C4614A',
};

/* ─── Mock data ─────────────────────────────────────────── */
export const MOCK_POSTS = [
  {
    id: 1, initial: '林', authorColor: '#C4897A',
    author: '林小羽', dept: '化妝品系', time: '2 小時前',
    tags: ['油性肌', '成分討論'],
    title: '用了一個月角鯊烷的心得：油肌也能超水嫩',
    excerpt: '一直以為油肌不能碰油，但加了角鯊烷之後膚況穩了很多，皮脂分泌反而變少。分享我目前的早晚保養流程給大家參考…',
    ingredients: ['角鯊烷', '玻尿酸'],
    likes: 48, comments: 12, views: 234, hot: true, pinned: false,
    reactions: { heart: 48, learn: 22, same: 15, wow: 8 },
    skinTypes: ['油性肌'],
  },
  {
    id: 2, initial: '陳', authorColor: '#9E8A7A',
    author: '陳柔安', dept: '護理學系', time: '5 小時前',
    tags: ['敏感肌', '去角質'],
    title: '終於找到敏感肌也能用的去角質方法',
    excerpt: '試過幾款果酸都刺激到不行，後來換成低濃度杏仁酸每週一次，完全沒有泛紅，效果還很好！',
    ingredients: ['杏仁酸', '積雪草'],
    likes: 31, comments: 7, views: 156, hot: false, pinned: false,
    reactions: { heart: 31, learn: 18, same: 27, wow: 4 },
    skinTypes: ['敏感肌'],
  },
  {
    id: 3, initial: '王', authorColor: '#7A8A9E',
    author: '王思涵', dept: '化學系', time: '昨天',
    tags: ['成分討論', '抗老'],
    title: '菸鹼醯胺 5% vs 10%，整理研究與實測差異',
    excerpt: '整理了幾篇期刊和自身使用三個月的結果，兩個濃度對色沉的影響差距其實不如想像中大，但刺激性差很多。',
    ingredients: ['菸鹼醯胺', 'A醇'],
    likes: 87, comments: 24, views: 892, hot: true, pinned: true,
    reactions: { heart: 87, learn: 61, same: 12, wow: 19 },
    skinTypes: ['油性肌', '混合性肌', '乾性肌'],
  },
  {
    id: 4, initial: '張', authorColor: '#8A9E7A',
    author: '張宇軒', dept: '資訊管理學系', time: '昨天',
    tags: ['混合性肌', '保濕'],
    title: 'T 區控油、兩頰保濕：分區保養的實際操作法',
    excerpt: '混合肌最麻煩的就是兩個區域的需求完全不同，這是我目前在用的早晚保養流程，用了半年下來效果很穩定。',
    ingredients: ['神經醯胺', '水楊酸'],
    likes: 22, comments: 5, views: 103, hot: false, pinned: false,
    reactions: { heart: 22, learn: 14, same: 31, wow: 3 },
    skinTypes: ['混合性肌'],
  },
  {
    id: 5, initial: '黃', authorColor: '#A08060',
    author: '黃品蓁', dept: '化妝品系', time: '2 天前',
    tags: ['防曬推薦', '保濕'],
    title: '2025 輕薄防曬推薦：這幾款化完妝也能補擦',
    excerpt: '測試了七款號稱輕薄的防曬，記錄各自的膚感、成膜速度和補擦疊加效果，適合混合肌和愛妝容的人參考。',
    ingredients: ['氧化鋅', 'Tinosorb S'],
    likes: 64, comments: 18, views: 445, hot: false, pinned: false,
    reactions: { heart: 64, learn: 38, same: 21, wow: 11 },
    skinTypes: ['混合性肌', '油性肌'],
  },
  {
    id: 6, initial: '吳', authorColor: '#9A7AA0',
    author: '吳宜庭', dept: '生物科技學系', time: '3 天前',
    tags: ['屏障修護', '敏感肌'],
    title: '積雪草（CICA）原來這樣用才對？整理常見誤解',
    excerpt: '積雪草的消炎功效很常被誇大，實際研究顯示它主要是促進膠原蛋白合成。來整理一下實際有效的用法和適合誰用。',
    ingredients: ['積雪草', '神經醯胺', '角鯊烷'],
    likes: 41, comments: 9, views: 278, hot: false, pinned: false,
    reactions: { heart: 41, learn: 34, same: 9, wow: 7 },
    skinTypes: ['敏感肌', '乾性肌'],
  },
];

const ALL_TAGS = ['全部', '成分討論', '油性肌', '敏感肌', '混合性肌', '保濕', '防曬推薦', '抗老', '去角質', '屏障修護'];

const TRENDING = [
  { tag: '#角鯊烷', count: 24 },
  { tag: '#菸鹼醯胺', count: 31 },
  { tag: '#敏感肌', count: 18 },
  { tag: '#防曬', count: 27 },
  { tag: '#A醇入門', count: 14 },
];

const ACTIVE_MEMBERS = [
  { initial: '林', color: '#C4897A', name: '林小羽', posts: 12, skinType: '混合性肌' },
  { initial: '王', color: '#7A8A9E', name: '王思涵', posts: 9, skinType: '油性肌' },
  { initial: '黃', color: '#A08060', name: '黃品蓁', posts: 7, skinType: '敏感肌' },
];

const RELATED_QA = [
  { id: 1, q: '角鯊烷和荷荷芭油哪個更適合油性肌？', answers: 3 },
  { id: 2, q: '菸鹼醯胺和維C可以同時用嗎？', answers: 5 },
  { id: 3, q: '第一次用A醇要注意什麼？', answers: 7 },
];

const INGREDIENT_SPOTLIGHT = {
  name: '角鯊烷',
  safety: 'safe',
  summary: '植物性油脂，高度仿真皮脂，油肌乾肌都適合',
  postCount: 24,
};

/* ─── 輔助元件：成分 Pill ─────────────────────────────────── */
function IngredientPill({ name, navigate }) {
  return (
    <button
      style={ps.pill}
      onClick={(e) => {
        e.stopPropagation();
        navigate(`/products?q=${encodeURIComponent(name)}`);
      }}
      title={`查看「${name}」的成分資料`}
    >
      <span style={ps.pillDot} />
      {name}
    </button>
  );
}
const ps = {
  pill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    height: '22px',
    padding: '0 9px',
    backgroundColor: `rgba(123,174,138,0.1)`,
    border: `1px solid rgba(123,174,138,0.28)`,
    borderRadius: '999px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '11px',
    color: '#4A8A60',
    cursor: 'pointer',
    transition: 'background-color 120ms',
    whiteSpace: 'nowrap',
  },
  pillDot: {
    width: '5px',
    height: '5px',
    borderRadius: '50%',
    backgroundColor: T.safe,
    flexShrink: 0,
  },
};

/* ─── 新貼文 Modal ────────────────────────────────────────── */
function NewPostModal({ onClose }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const MODAL_TAGS = ['油性肌', '乾性肌', '敏感肌', '混合性肌', '成分討論', '保濕', '防曬推薦', '抗老', '去角質', '屏障修護'];

  const toggleTag = (tag) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
    );
  };

  return (
    <div style={ms.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={ms.modal}>
        <div style={ms.header}>
          <div>
            <p style={ms.eyebrow}>NEW POST</p>
            <h2 style={ms.title}>發布貼文</h2>
          </div>
          <button style={ms.closeBtn} onClick={onClose}>✕</button>
        </div>

        <div style={ms.body}>
          <div style={ms.field}>
            <label style={ms.label}>標題</label>
            <input
              style={ms.input}
              type="text"
              placeholder="用一句話說明你的主題"
              value={title}
              onChange={e => setTitle(e.target.value)}
              maxLength={60}
            />
            <span style={ms.counter}>{title.length}/60</span>
          </div>

          <div style={ms.field}>
            <label style={ms.label}>內容</label>
            <textarea
              style={ms.textarea}
              placeholder="分享你的保養心得、成分研究或疑問…"
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={6}
            />
          </div>

          <div style={ms.field}>
            <label style={ms.label}>標籤（最多選 3 個）</label>
            <div style={ms.tagGrid}>
              {MODAL_TAGS.map(tag => (
                <button
                  key={tag}
                  style={{ ...ms.tagChip, ...(selectedTags.includes(tag) ? ms.tagChipActive : {}) }}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div style={ms.footer}>
          <button style={ms.cancelBtn} onClick={onClose}>取消</button>
          <button
            style={{ ...ms.submitBtn, ...(!title.trim() ? ms.submitBtnDisabled : {}) }}
            disabled={!title.trim()}
            onClick={onClose}
          >
            發布
          </button>
        </div>
      </div>
    </div>
  );
}
const ms = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 500,
    backgroundColor: 'rgba(28,25,23,0.55)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: '24px',
  },
  modal: {
    backgroundColor: T.bgSurface,
    borderRadius: '16px',
    width: '100%',
    maxWidth: '560px',
    maxHeight: '88vh',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: '0 24px 64px rgba(28,25,23,0.18)',
    overflow: 'hidden',
  },
  header: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
    padding: '28px 28px 20px',
    borderBottom: `1px solid ${T.border}`,
  },
  eyebrow: {
    fontFamily: '"DM Sans",sans-serif',
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.16em',
    color: T.accent, margin: '0 0 4px',
  },
  title: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '26px', fontWeight: 400, color: T.textPrimary, margin: 0,
  },
  closeBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '16px', color: T.textTertiary, padding: '4px', lineHeight: 1,
  },
  body: {
    flex: 1, overflowY: 'auto',
    padding: '20px 28px',
    display: 'flex', flexDirection: 'column', gap: '18px',
  },
  field: { display: 'flex', flexDirection: 'column', gap: '6px', position: 'relative' },
  label: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', fontWeight: 500, letterSpacing: '0.04em',
    color: T.textSecondary,
  },
  input: {
    height: '44px', padding: '0 14px',
    border: `1px solid ${T.border}`, borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '14px', color: T.textPrimary,
    outline: 'none', backgroundColor: T.bgBase,
    boxSizing: 'border-box',
  },
  textarea: {
    padding: '12px 14px',
    border: `1px solid ${T.border}`, borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '14px', color: T.textPrimary, lineHeight: 1.65,
    outline: 'none', resize: 'vertical', backgroundColor: T.bgBase,
    boxSizing: 'border-box',
  },
  counter: {
    position: 'absolute', right: 0, bottom: '-18px',
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tagChip: {
    height: '28px', padding: '0 12px', borderRadius: '999px',
    border: `1px solid ${T.border}`, backgroundColor: T.bgSubtle,
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', color: T.textSecondary, cursor: 'pointer',
    transition: 'all 120ms',
  },
  tagChipActive: {
    backgroundColor: T.accent, borderColor: T.accent, color: '#fff',
  },
  footer: {
    display: 'flex', justifyContent: 'flex-end', gap: '10px',
    padding: '16px 28px',
    borderTop: `1px solid ${T.border}`,
  },
  cancelBtn: {
    height: '40px', padding: '0 20px',
    background: 'none', border: `1px solid ${T.border}`, borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '14px', color: T.textSecondary, cursor: 'pointer',
  },
  submitBtn: {
    height: '40px', padding: '0 24px',
    backgroundColor: T.accent, border: 'none', borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '14px', fontWeight: 500, color: '#fff', cursor: 'pointer',
  },
  submitBtnDisabled: { backgroundColor: T.accentLight, cursor: 'not-allowed' },
};

/* ─── 主元件 ─────────────────────────────────────────────── */
export default function Community() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('latest');
  const [activeTag, setActiveTag] = useState('全部');
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);
  useReveal();

  // 取得當前使用者膚質（用於個人化推薦）
  const storedUser = localStorage.getItem('user');
  const currentUser = storedUser ? JSON.parse(storedUser) : null;
  const userSkinType = currentUser?.skin_type || '';

  const TABS = [
    { key: 'latest',   label: '最新' },
    { key: 'hot',      label: '熱門' },
    { key: 'featured', label: '精選' },
  ];

  const filtered = MOCK_POSTS
    .filter(p => activeTag === '全部' || p.tags.includes(activeTag))
    .filter(p => !search || p.title.includes(search) || p.excerpt.includes(search))
    .sort((a, b) => tab === 'hot' ? b.likes - a.likes : b.id - a.id);

  // 根據用戶膚質推薦貼文
  const recommended = userSkinType
    ? MOCK_POSTS.filter(p => p.skinTypes?.includes(userSkinType) && p.id !== 3).slice(0, 2)
    : [];

  const pinnedPost = MOCK_POSTS.find(p => p.pinned);

  return (
    <div style={s.page}>
      {showNewPost && <NewPostModal onClose={() => setShowNewPost(false)} />}

      {/* ── Hero ── */}
      <div style={s.hero}>
        <div style={s.heroInner}>
          <div style={s.heroLeft}>
            <p style={s.heroEyebrow}>COMMUNITY</p>
            <h1 style={s.heroTitle}>社群討論</h1>
            <p style={s.heroSub}>與輔大同學交流真實的保養心得，找到你信任的美妝知識。</p>
          </div>
          <div style={s.heroStats}>
            {[
              { num: '1,240', label: '篇貼文' },
              { num: '368',   label: '位成員' },
              { num: '89',    label: '個標籤' },
            ].map(item => (
              <div key={item.label} style={s.statItem}>
                <span style={s.statNum}>{item.num}</span>
                <span style={s.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={s.searchRow}>
          <div style={{ ...s.searchBox, ...(searchFocus ? s.searchBoxFocus : {}) }}>
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(247,244,242,0.45)" strokeWidth="1.4"/>
              <path d="M10 10L13 13" stroke="rgba(247,244,242,0.45)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              style={s.searchInput}
              type="text"
              placeholder="搜尋貼文、成分、標籤…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
            {search && (
              <button style={s.searchClear} onClick={() => setSearch('')}>✕</button>
            )}
          </div>
          <button style={s.newPostBtn} onClick={() => setShowNewPost(true)}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            發布貼文
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={s.body}>
        {/* ── Main ── */}
        <main style={s.main}>

          {/* 個人化推薦 strip */}
          {recommended.length > 0 && !search && activeTag === '全部' && (
            <div style={s.recommendSection} className="g-reveal">
              <div style={s.recommendHeader}>
                <span style={s.recommendEyebrow}>為你推薦</span>
                <span style={s.recommendSub}>根據你的膚質「{userSkinType}」</span>
              </div>
              <div style={s.recommendRow}>
                {recommended.map(post => (
                  <div
                    key={post.id}
                    style={s.recommendCard}
                    onClick={() => navigate(`/community/post/${post.id}`)}
                  >
                    <div style={s.recommendCardTop}>
                      <div style={{ ...s.recAvatar, backgroundColor: post.authorColor }}>{post.initial}</div>
                      <span style={s.recAuthor}>{post.author}</span>
                    </div>
                    <p style={s.recTitle}>{post.title}</p>
                    <div style={s.recFooter}>
                      <span style={s.recStat}>♡ {post.likes}</span>
                      <span style={s.recStat}>💬 {post.comments}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 精選置頂貼文 */}
          {pinnedPost && tab !== 'hot' && !search && activeTag === '全部' && (
            <div
              style={s.pinnedCard}
              onClick={() => navigate(`/community/post/${pinnedPost.id}`)}
              className="g-reveal"
            >
              <div style={s.pinnedBadge}>本週精選</div>
              <div style={s.pinnedTop}>
                <div style={{ ...s.avatar, backgroundColor: pinnedPost.authorColor }}>{pinnedPost.initial}</div>
                <div style={s.authorInfo}>
                  <span style={s.authorName}>{pinnedPost.author}</span>
                  <span style={s.authorMeta}>{pinnedPost.dept} · {pinnedPost.time}</span>
                </div>
              </div>
              <h3 style={s.pinnedTitle}>{pinnedPost.title}</h3>
              <p style={s.pinnedExcerpt}>{pinnedPost.excerpt}</p>
              <div style={s.pinnedIngredients}>
                {pinnedPost.ingredients?.map(ing => (
                  <IngredientPill key={ing} name={ing} navigate={navigate} />
                ))}
              </div>
              <div style={s.pinnedFooter}>
                <ReactionMini reactions={pinnedPost.reactions} />
                <span style={s.pinnedReadMore}>閱讀全文 →</span>
              </div>
            </div>
          )}

          {/* Tab 列 */}
          <div style={s.tabRow}>
            <div style={s.tabs}>
              {TABS.map(tab_ => (
                <button
                  key={tab_.key}
                  style={{ ...s.tab, ...(tab === tab_.key ? s.tabActive : {}) }}
                  onClick={() => setTab(tab_.key)}
                >
                  {tab_.label}
                  {tab === tab_.key && <span style={s.tabLine} />}
                </button>
              ))}
            </div>
            <span style={s.postCount}>{filtered.length} 篇</span>
          </div>

          {/* 標籤 filter */}
          <div style={s.tagRow}>
            {ALL_TAGS.map(tag => (
              <button
                key={tag}
                style={{ ...s.tagChip, ...(activeTag === tag ? s.tagChipActive : {}) }}
                onClick={() => setActiveTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>

          {/* 貼文列表 */}
          {filtered.length === 0 ? (
            <EmptyState onNewPost={() => setShowNewPost(true)} />
          ) : (
            filtered.map((post, i) => (
              <PostCard
                key={post.id}
                post={post}
                idx={i}
                navigate={navigate}
              />
            ))
          )}
        </main>

        {/* ── Sidebar ── */}
        <aside style={s.sidebar}>

          {/* 本週熱門話題 */}
          <div style={s.sideCard} className="g-reveal">
            <p style={s.sideTitle}>本週熱門話題</p>
            <div style={s.trendingList}>
              {TRENDING.map((item, i) => (
                <button
                  key={item.tag}
                  style={s.trendingRow}
                  onClick={() => setSearch(item.tag.replace('#', ''))}
                >
                  <span style={s.trendingRank}>{i + 1}</span>
                  <span style={s.trendingTag}>{item.tag}</span>
                  <span style={s.trendingCount}>{item.count} 篇</span>
                </button>
              ))}
            </div>
          </div>

          {/* 成分知識連結 */}
          <div style={s.sideCard} className="g-reveal delay-1">
            <p style={s.sideTitle}>本週成分焦點</p>
            <div style={s.ingredientSpotlight}>
              <div style={s.spotlightTop}>
                <span style={s.spotlightName}>{INGREDIENT_SPOTLIGHT.name}</span>
                <span style={s.spotlightBadge}>安全</span>
              </div>
              <p style={s.spotlightDesc}>{INGREDIENT_SPOTLIGHT.summary}</p>
              <div style={s.spotlightFooter}>
                <span style={s.spotlightCount}>{INGREDIENT_SPOTLIGHT.postCount} 篇討論</span>
                <button
                  style={s.spotlightBtn}
                  onClick={() => navigate(`/products?q=${INGREDIENT_SPOTLIGHT.name}`)}
                >
                  查看成分 →
                </button>
              </div>
            </div>
          </div>

          {/* 相關問答 */}
          <div style={s.sideCard} className="g-reveal delay-1">
            <p style={s.sideTitle}>最新問答</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {RELATED_QA.map(qa => (
                <button
                  key={qa.id}
                  style={s.qaRow}
                  onClick={() => navigate('/qa')}
                >
                  <span style={s.qaQ}>{qa.q}</span>
                  <span style={s.qaCount}>{qa.answers} 則回答</span>
                </button>
              ))}
              <button style={s.qaAskBtn} onClick={() => navigate('/qa/ask')}>
                <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                  <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
                提出你的問題
              </button>
            </div>
          </div>

          {/* 活躍成員 */}
          <div style={s.sideCard} className="g-reveal delay-2">
            <p style={s.sideTitle}>活躍成員</p>
            <div style={s.memberList}>
              {ACTIVE_MEMBERS.map(m => (
                <div key={m.name} style={s.memberRow}>
                  <div style={{ ...s.memberAvatar, backgroundColor: m.color }}>{m.initial}</div>
                  <div style={s.memberInfo}>
                    <span style={s.memberName}>{m.name}</span>
                    <span style={s.memberPosts}>{m.posts} 篇貼文 · {m.skinType}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>
      </div>
    </div>
  );
}

/* ─── 反應 mini-count ─────────────────────────────────────── */
function ReactionMini({ reactions }) {
  const total = Object.values(reactions || {}).reduce((s, n) => s + n, 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={s.reactionMiniIcons}>❤️ 📚 🙋</span>
      <span style={s.reactionMiniCount}>{total}</span>
    </div>
  );
}

/* ─── 貼文卡片 ─────────────────────────────────────────────── */
function PostCard({ post, idx, navigate }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);
  const [hovered, setHovered] = useState(false);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
  };

  const totalReactions = Object.values(post.reactions || {}).reduce((s, n) => s + n, 0);

  return (
    <div
      style={{
        ...s.card,
        animationDelay: `${idx * 60}ms`,
        ...(hovered ? s.cardHovered : {}),
      }}
      className="g-fade-up"
      onClick={() => navigate(`/community/post/${post.id}`)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* 頂部：作者 + 熱門標記 */}
      <div style={s.cardTop}>
        <div style={s.authorRow}>
          <div style={{ ...s.avatar, backgroundColor: post.authorColor }}>{post.initial}</div>
          <div style={s.authorInfo}>
            <span style={s.authorName}>{post.author}</span>
            <span style={s.authorMeta}>{post.dept} · {post.time}</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
          {post.hot && <span style={s.hotBadge}>熱門</span>}
        </div>
      </div>

      {/* 標籤 */}
      <div style={s.cardTags}>
        {post.tags.map(tag => (
          <span key={tag} style={s.cardTag}>{tag}</span>
        ))}
      </div>

      {/* 標題 + 摘要 */}
      <h3 style={s.cardTitle}>{post.title}</h3>
      <p style={s.cardExcerpt}>{post.excerpt}</p>

      {/* 成分 Pills */}
      {post.ingredients?.length > 0 && (
        <div style={s.cardIngredients}>
          <span style={s.ingredientsLabel}>文中提及</span>
          {post.ingredients.map(ing => (
            <IngredientPill key={ing} name={ing} navigate={navigate} />
          ))}
        </div>
      )}

      {/* 底部：互動 */}
      <div style={s.cardFooter}>
        <div style={s.cardStats}>
          <button
            style={{ ...s.statBtn, ...(liked ? s.statBtnLiked : {}) }}
            onClick={handleLike}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill={liked ? T.accent : 'none'}>
              <path d="M7 12S1.5 8.5 1.5 4.5a2.5 2.5 0 015-0 2.5 2.5 0 015 0C11.5 8.5 7 12 7 12z"
                stroke={T.accent} strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            {likes}
          </button>
          <button style={s.statBtn} onClick={e => { e.stopPropagation(); navigate(`/community/post/${post.id}#comments`); }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z"
                stroke={T.textTertiary} strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            {post.comments}
          </button>
          <span style={s.viewCount}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <ellipse cx="6.5" cy="6.5" rx="5.5" ry="3.5" stroke={T.textTertiary} strokeWidth="1.2"/>
              <circle cx="6.5" cy="6.5" r="1.5" fill={T.textTertiary}/>
            </svg>
            {post.views}
          </span>
          {totalReactions > 0 && (
            <span style={s.reactionCount}>· {totalReactions} 個反應</span>
          )}
        </div>
        <span style={s.readMore}>閱讀全文 →</span>
      </div>
    </div>
  );
}

/* ─── 空狀態 ─────────────────────────────────────────────── */
function EmptyState({ onNewPost }) {
  return (
    <div style={s.empty}>
      <p style={s.emptyTitle}>找不到符合的貼文</p>
      <p style={s.emptySub}>試試其他關鍵字，或成為第一個討論這個話題的人</p>
      <button style={s.emptyBtn} onClick={onNewPost}>發布貼文</button>
    </div>
  );
}

/* ─── Styles ─────────────────────────────────────────────── */
const s = {
  page: {
    paddingTop: '64px',
    backgroundColor: T.bgBase,
    minHeight: '100vh',
  },

  /* Hero */
  hero: {
    backgroundColor: '#1C1917',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '48px 40px 32px',
  },
  heroInner: {
    maxWidth: '1100px', margin: '0 auto',
    display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
    gap: '32px', flexWrap: 'wrap',
  },
  heroLeft: { display: 'flex', flexDirection: 'column', gap: '8px' },
  heroEyebrow: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 500,
    letterSpacing: '0.18em', color: T.accent, margin: 0,
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '40px', fontWeight: 300, color: '#F7F4F2', margin: 0, letterSpacing: '0.04em',
  },
  heroSub: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: 'rgba(247,244,242,0.45)', margin: 0, maxWidth: '440px', lineHeight: 1.6,
  },
  heroStats: { display: 'flex', gap: '32px', paddingBottom: '4px' },
  statItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' },
  statNum: {
    fontFamily: '"Cormorant Garamond",serif', fontSize: '28px', fontWeight: 400,
    color: '#F7F4F2', lineHeight: 1,
  },
  statLabel: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '11px',
    color: 'rgba(247,244,242,0.4)',
  },

  searchRow: {
    maxWidth: '1100px', margin: '24px auto 0',
    display: 'flex', gap: '12px', alignItems: 'center',
  },
  searchBox: {
    flex: 1, maxWidth: '480px', height: '44px',
    backgroundColor: 'rgba(247,244,242,0.07)',
    border: '1px solid rgba(247,244,242,0.12)',
    borderRadius: '10px',
    display: 'flex', alignItems: 'center', gap: '10px', padding: '0 16px',
    transition: 'border-color 150ms, background-color 150ms',
  },
  searchBoxFocus: {
    backgroundColor: 'rgba(247,244,242,0.11)',
    borderColor: 'rgba(196,137,122,0.5)',
  },
  searchInput: {
    flex: 1, background: 'none', border: 'none', outline: 'none',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', color: '#F7F4F2',
  },
  searchClear: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '12px', color: 'rgba(247,244,242,0.4)', padding: '2px',
  },
  newPostBtn: {
    height: '44px', padding: '0 20px',
    display: 'flex', alignItems: 'center', gap: '8px',
    backgroundColor: T.accent, color: '#fff', border: 'none', borderRadius: '10px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', fontWeight: 500, cursor: 'pointer',
    letterSpacing: '0.02em', whiteSpace: 'nowrap',
    transition: 'background-color 150ms',
  },

  body: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '32px 40px 64px',
    display: 'flex', gap: '32px', alignItems: 'flex-start',
  },
  main: {
    flex: 1, minWidth: 0,
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  sidebar: {
    width: '260px', flexShrink: 0,
    display: 'flex', flexDirection: 'column', gap: '14px',
    position: 'sticky', top: '80px',
  },

  /* Personalized recommendation */
  recommendSection: {
    backgroundColor: `rgba(196,137,122,0.06)`,
    border: `1px solid rgba(196,137,122,0.2)`,
    borderRadius: '12px',
    padding: '16px 20px',
  },
  recommendHeader: {
    display: 'flex', alignItems: 'center', gap: '10px',
    marginBottom: '12px',
  },
  recommendEyebrow: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent,
  },
  recommendSub: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textTertiary,
  },
  recommendRow: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' },
  recommendCard: {
    backgroundColor: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: '10px', padding: '12px 14px',
    cursor: 'pointer', transition: 'box-shadow 150ms',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  recommendCardTop: { display: 'flex', alignItems: 'center', gap: '7px' },
  recAvatar: {
    width: '24px', height: '24px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond",serif', fontSize: '11px', color: '#fff', flexShrink: 0,
  },
  recAuthor: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    fontWeight: 500, color: T.textSecondary,
  },
  recTitle: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    fontWeight: 500, color: T.textPrimary, margin: 0, lineHeight: 1.45,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  recFooter: { display: 'flex', gap: '10px' },
  recStat: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },

  /* Pinned post */
  pinnedCard: {
    backgroundColor: T.bgSurface,
    border: `1.5px solid ${T.accentLight}`,
    borderRadius: '12px', padding: '20px 24px',
    cursor: 'pointer', position: 'relative', overflow: 'hidden',
    transition: 'box-shadow 200ms',
    display: 'flex', flexDirection: 'column', gap: '10px',
  },
  pinnedBadge: {
    display: 'inline-flex', alignSelf: 'flex-start',
    padding: '3px 10px', borderRadius: '999px',
    backgroundColor: `rgba(196,137,122,0.12)`,
    border: `1px solid rgba(196,137,122,0.25)`,
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.08em', color: T.accent,
  },
  pinnedTop: { display: 'flex', alignItems: 'center', gap: '10px' },
  pinnedTitle: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '22px', fontWeight: 400, color: T.textPrimary,
    margin: 0, lineHeight: 1.35,
  },
  pinnedExcerpt: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: T.textSecondary, margin: 0, lineHeight: 1.65,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  pinnedIngredients: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  pinnedFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '8px', borderTop: `1px solid ${T.border}`, marginTop: '2px',
  },
  pinnedReadMore: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '12px',
    color: T.accent, fontWeight: 500,
  },

  /* Tabs */
  tabRow: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    borderBottom: `1px solid ${T.border}`,
  },
  tabs: { display: 'flex' },
  tab: {
    position: 'relative', padding: '10px 16px',
    background: 'none', border: 'none',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '14px', color: T.textTertiary, cursor: 'pointer',
  },
  tabActive: { color: T.textPrimary, fontWeight: 500 },
  tabLine: {
    position: 'absolute', bottom: '-1px', left: '16px', right: '16px',
    height: '2px', backgroundColor: T.accent, borderRadius: '2px 2px 0 0',
  },
  postCount: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '12px', color: T.textTertiary,
  },

  /* Tag filter */
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px' },
  tagChip: {
    height: '28px', padding: '0 12px', borderRadius: '999px',
    border: `1px solid ${T.border}`, backgroundColor: T.bgSubtle,
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', color: T.textSecondary, cursor: 'pointer', transition: 'all 150ms',
  },
  tagChipActive: { backgroundColor: T.accent, borderColor: T.accent, color: '#fff' },

  /* Post card */
  card: {
    backgroundColor: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderRadius: '12px', padding: '20px 24px',
    display: 'flex', flexDirection: 'column', gap: '10px',
    cursor: 'pointer',
    transition: 'box-shadow 200ms, border-color 200ms, transform 200ms',
  },
  cardHovered: {
    boxShadow: '0 4px 16px rgba(28,25,23,0.08)',
    borderColor: T.accentLight,
    transform: 'translateY(-2px)',
  },
  cardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  authorRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  avatar: {
    width: '34px', height: '34px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond",serif', fontSize: '15px',
    color: '#fff', flexShrink: 0,
  },
  authorInfo: { display: 'flex', flexDirection: 'column', gap: '1px' },
  authorName: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    fontWeight: 500, color: T.textPrimary,
  },
  authorMeta: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '11px',
    color: T.textTertiary,
  },
  hotBadge: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.08em', color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.12)',
    border: `1px solid rgba(196,137,122,0.2)`,
    borderRadius: '999px', padding: '2px 8px',
  },
  cardTags: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  cardTag: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '11px',
    color: T.textTertiary, backgroundColor: T.bgSubtle,
    border: `1px solid ${T.border}`, borderRadius: '999px', padding: '2px 8px',
  },
  cardTitle: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '20px', fontWeight: 400, color: T.textPrimary,
    margin: 0, lineHeight: 1.35, letterSpacing: '0.01em',
  },
  cardExcerpt: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: T.textSecondary, margin: 0, lineHeight: 1.65,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  cardIngredients: {
    display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center',
    paddingTop: '2px',
  },
  ingredientsLabel: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '11px',
    color: T.textTertiary, marginRight: '2px',
  },
  cardFooter: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    paddingTop: '8px', borderTop: `1px solid ${T.border}`, marginTop: '2px',
  },
  cardStats: { display: 'flex', alignItems: 'center', gap: '12px' },
  statBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: 'none', border: 'none',
    fontFamily: '"DM Sans",sans-serif', fontSize: '13px',
    color: T.textTertiary, cursor: 'pointer', padding: '4px 2px',
  },
  statBtnLiked: { color: T.accent },
  viewCount: {
    display: 'flex', alignItems: 'center', gap: '4px',
    fontFamily: '"DM Sans",sans-serif', fontSize: '12px', color: T.textTertiary,
  },
  reactionCount: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '12px', color: T.textTertiary,
  },
  reactionMiniIcons: { fontSize: '13px', letterSpacing: '-2px' },
  reactionMiniCount: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '12px', color: T.textTertiary,
  },
  readMore: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '12px',
    color: T.accent, fontWeight: 500,
  },

  /* Empty */
  empty: { padding: '48px 0', textAlign: 'center' },
  emptyTitle: {
    fontFamily: '"Cormorant Garamond",serif', fontSize: '22px', fontWeight: 400,
    color: T.textSecondary, margin: '0 0 8px',
  },
  emptySub: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: T.textTertiary, margin: '0 0 16px',
  },
  emptyBtn: {
    height: '40px', padding: '0 20px',
    backgroundColor: T.accent, border: 'none', borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', fontWeight: 500, color: '#fff', cursor: 'pointer',
  },

  /* Sidebar card */
  sideCard: {
    backgroundColor: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: '12px', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  sideTitle: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent, margin: 0,
  },

  /* Trending */
  trendingList: { display: 'flex', flexDirection: 'column', gap: '4px' },
  trendingRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'none', border: 'none', width: '100%',
    padding: '6px 8px', borderRadius: '8px', cursor: 'pointer',
    transition: 'background-color 120ms', textAlign: 'left',
  },
  trendingRank: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', fontWeight: 600,
    color: T.textTertiary, width: '14px', flexShrink: 0,
  },
  trendingTag: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: T.textSecondary, flex: 1,
  },
  trendingCount: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },

  /* Ingredient spotlight */
  ingredientSpotlight: { display: 'flex', flexDirection: 'column', gap: '8px' },
  spotlightTop: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  spotlightName: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '22px', fontWeight: 400, color: T.textPrimary,
  },
  spotlightBadge: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    color: T.safe, backgroundColor: 'rgba(123,174,138,0.12)',
    border: '1px solid rgba(123,174,138,0.28)',
    borderRadius: '999px', padding: '2px 8px',
  },
  spotlightDesc: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textSecondary, margin: 0, lineHeight: 1.6,
  },
  spotlightFooter: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  spotlightCount: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },
  spotlightBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: '"DM Sans",sans-serif', fontSize: '12px',
    fontWeight: 500, color: T.accent,
  },

  /* QA sidebar */
  qaRow: {
    display: 'flex', flexDirection: 'column', gap: '4px',
    background: 'none', border: 'none', width: '100%',
    padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
    textAlign: 'left', transition: 'background-color 120ms',
    backgroundColor: T.bgSubtle,
  },
  qaQ: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textSecondary, lineHeight: 1.5,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  qaCount: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },
  qaAskBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    height: '34px', borderRadius: '8px',
    border: `1px dashed ${T.border}`,
    backgroundColor: 'transparent', cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', color: T.textTertiary,
    transition: 'border-color 120ms, color 120ms',
    marginTop: '2px',
  },

  /* Members */
  memberList: { display: 'flex', flexDirection: 'column', gap: '10px' },
  memberRow: { display: 'flex', alignItems: 'center', gap: '10px' },
  memberAvatar: {
    width: '30px', height: '30px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond",serif', fontSize: '13px',
    color: '#fff', flexShrink: 0,
  },
  memberInfo: { display: 'flex', flexDirection: 'column', gap: '1px', minWidth: 0 },
  memberName: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: T.textPrimary, fontWeight: 500,
  },
  memberPosts: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },
};
