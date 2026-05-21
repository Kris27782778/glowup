import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from './hooks/useReveal';
import API_BASE from './config';

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

const TAG_GROUPS = [
  { label: '膚質', tags: ['油性肌', '乾性肌', '混合性肌', '敏感肌', '中性肌'] },
  { label: '領域', tags: ['保養品', '化妝品'] },
  { label: '類型', tags: ['心得分享', '請益討論', '成分研究', '開箱評測'] },
  { label: '功效', tags: ['保濕', '控油', '去角質', '抗老', '防曬推薦', '成分討論', '屏障修護'] },
];

const TRENDING_FALLBACK = [
  { tag: '#保濕', count: null },
  { tag: '#敏感肌', count: null },
  { tag: '#控油', count: null },
];


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

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)    return '剛剛';
  if (diff < 3600)  return `${Math.floor(diff / 60)} 分鐘前`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} 小時前`;
  const d = Math.floor(diff / 86400); return d === 1 ? '昨天' : `${d} 天前`;
}
function avatarColor(str) {
  const colors = ['#C4897A','#9E8A7A','#7A8A9E','#8A9E7A','#A08060','#9A7AA0'];
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

export default function Community() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('latest');
  const [activeTags, setActiveTags] = useState([]);
  const [search, setSearch] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [showNewPost, setShowNewPost] = useState(false);

  const [apiPosts,    setApiPosts]    = useState([]);
  const [hotPosts,    setHotPosts]    = useState([]);
  const [apiLoaded,   setApiLoaded]   = useState(false);
  const [hotLoaded,   setHotLoaded]   = useState(false);
  const [trending,    setTrending]    = useState([]);
  const [unsung,      setUnsung]      = useState([]);

  const mapPost = p => ({
    id:          p.post_id,
    initial:     (p.users?.nickname || '?')[0],
    authorColor: avatarColor(p.users?.nickname || ''),
    author:      p.users?.nickname || '匿名',
    dept:        p.users?.department_grade || '',
    time:        timeAgo(p.created_at),
    tags:        [p.skin_type, p.domain, p.post_type, p.sub_category, ...(p.effect_tags || [])].filter(Boolean),
    title:       p.title,
    excerpt:     p.content,
    ingredients: p.ingredients || [],
    likes:       p.helpful_count || 0,
    comments:    p.comment_count || 0,
    views:       p.views || 0,
    hot:         (p.helpful_count || 0) >= 20,
    pinned:      false,
    reactions:   { heart: p.helpful_count || 0 },
    skinTypes:   [p.skin_type],
  });

  useEffect(() => {
    fetch(`${API_BASE}/api/posts/trending-tags`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data) && data.length > 0) setTrending(data); })
      .catch(() => {});
    fetch(`${API_BASE}/api/posts/unsung`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setUnsung(data); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/posts?limit=50`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.data)) setApiPosts(data.data.map(mapPost));
        setApiLoaded(true);
      })
      .catch(() => setApiLoaded(true));
  }, []);

  useEffect(() => {
    fetch(`${API_BASE}/api/posts/hot?limit=50`)
      .then(r => r.json())
      .then(data => {
        if (Array.isArray(data.data)) setHotPosts(data.data.map(mapPost));
        setHotLoaded(true);
      })
      .catch(() => setHotLoaded(true));
  }, []);

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

  const isHot = tab === 'hot';
  const sourcePosts = isHot
    ? (hotLoaded && hotPosts.length > 0 ? hotPosts : (apiLoaded && apiPosts.length > 0 ? apiPosts : MOCK_POSTS))
    : (apiLoaded && apiPosts.length > 0 ? apiPosts : MOCK_POSTS);

  const toggleTag = tag =>
    setActiveTags(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]);

  const filtered = sourcePosts
    .filter(p => activeTags.length === 0 || activeTags.every(tag => p.tags.includes(tag)))
    .filter(p => !search || p.title.includes(search) || p.excerpt.includes(search))
    .sort((a, b) => isHot ? 0 : b.id - a.id);

  // 根據用戶膚質推薦貼文
  const recommended = userSkinType
    ? MOCK_POSTS.filter(p => p.skinTypes?.includes(userSkinType) && p.id !== 3).slice(0, 2)
    : [];


 
  

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
              { num: apiLoaded ? String(apiPosts.length) : '—', label: '篇貼文' },
              { num: '1',   label: '位成員' },
              { num: '15',  label: '個標籤' },
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
          <button style={s.newPostBtn} onClick={() => navigate('/community/new')}>
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
          {recommended.length > 0 && !search && activeTags.length === 0 && (
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
                    onClick={() => navigate(`/community/${post.id}`)}
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
          <div style={s.filterArea}>
            {TAG_GROUPS.map((group) => (
              <div key={group.label} style={s.filterGroup}>
                <span style={s.filterDivider} />
                <span style={s.filterLabel}>{group.label}</span>
                {group.tags.map(tag => (
                  <button
                    key={tag}
                    style={{ ...s.tagChip, ...(activeTags.includes(tag) ? s.tagChipActive : {}) }}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            ))}
            {activeTags.length > 0 && (
              <button style={s.clearBtn} onClick={() => setActiveTags([])}>
                清除篩選 ×
              </button>
            )}
          </div>

          {/* 貼文列表 */}
          {filtered.length === 0 ? (
            <EmptyState
              mode={activeTags.length === 0 && !search ? 'no-posts' : 'no-results'}
              onNewPost={() => navigate('/community/new')}
            />
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
              {(trending.length > 0 ? trending : TRENDING_FALLBACK).map((item, i) => (
                <button
                  key={item.tag}
                  style={s.trendingRow}
                  onClick={() => setSearch(item.tag.replace('#', ''))}
                >
                  <span style={s.trendingRank}>{i + 1}</span>
                  <span style={s.trendingTag}>{item.tag}</span>
                  <span style={s.trendingCount}>{item.count !== null ? `${item.count} 篇` : '—'}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 尚未發光的文章 */}
          <div style={s.sideCard} className="g-reveal delay-2">
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <p style={s.sideTitle}>尚未發光的文章</p>
              <span style={s.unsungDot} />
            </div>
            {unsung.length === 0 ? (
              <p style={{ fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px', color: T.textTertiary, margin: 0 }}>
                暫時沒有資料
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {unsung.map((p, i) => (
                  <button key={p.post_id} style={s.popularRow} onClick={() => navigate(`/community/${p.post_id}`)}>
                    <span style={{ ...s.popularRank, color: T.textTertiary }}>{i + 1}</span>
                    <div style={s.popularInfo}>
                      <span style={s.popularTitle}>{p.title}</span>
                      <span style={s.popularMeta}>
                        {p.users?.nickname} · ♡ {p.helpful_count} · 💬 {p.comment_count}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

        </aside>
      </div>
    </div>
  );
}


/* ─── 貼文卡片 ─────────────────────────────────────────────── */
function PostCard({ post, idx, navigate }) {
  const [hovered, setHovered] = useState(false);

  const totalReactions = Object.values(post.reactions || {}).reduce((s, n) => s + n, 0);

  return (
    <div
      style={{
        ...s.card,
        animationDelay: `${idx * 60}ms`,
        ...(hovered ? s.cardHovered : {}),
      }}
      className="g-fade-up"
      onClick={() => navigate(`/community/${post.id}`)}
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
          <span style={s.statBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 12S1.5 8.5 1.5 4.5a2.5 2.5 0 015-0 2.5 2.5 0 015 0C11.5 8.5 7 12 7 12z"
                stroke={T.accent} strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            {post.likes}
          </span>
          <span style={s.statBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z"
                stroke={T.textTertiary} strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            {post.comments}
          </span>
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
function EmptyState({ mode, onNewPost }) {
  const isBlank = mode === 'no-posts';
  return (
    <div style={s.empty}>
      <p style={s.emptyTitle}>{isBlank ? '還沒有人分享' : '目前沒有符合條件的貼文'}</p>
      <p style={s.emptySub}>
        {isBlank ? '成為第一個在社群分享保養心得的人' : '試試減少篩選條件，或換個關鍵字搜尋'}
      </p>
      {isBlank && <button style={s.emptyBtn} onClick={onNewPost}>發布貼文</button>}
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
  filterArea: {
    display: 'flex', flexWrap: 'wrap', gap: '8px 14px',
    alignItems: 'center', padding: '12px 0',
    borderBottom: `1px solid ${T.border}`,
  },
  filterGroup: { display: 'flex', alignItems: 'center', gap: '5px', flexWrap: 'wrap' },
  filterLabel: {
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.08em',
    color: T.textTertiary, textTransform: 'uppercase', marginRight: '2px', userSelect: 'none',
  },
  filterDivider: {
    width: '1px', height: '14px', backgroundColor: T.border,
    flexShrink: 0, alignSelf: 'center',
  },
  clearBtn: {
    height: '26px', padding: '0 10px', borderRadius: '999px',
    border: `1px solid rgba(196,137,122,0.35)`,
    backgroundColor: 'rgba(196,137,122,0.07)',
    color: T.accent, fontSize: '11px', fontWeight: 500, cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    whiteSpace: 'nowrap', transition: 'all 150ms',
  },
  tagChip: {
    height: '26px', padding: '0 11px', borderRadius: '999px',
    border: `1px solid ${T.border}`, backgroundColor: T.bgSubtle,
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', color: T.textSecondary, cursor: 'pointer', transition: 'all 150ms',
  },
  tagChipActive: { backgroundColor: T.accent, borderColor: T.accent, color: '#fff' },

  /* Post card */
  card: {
    backgroundColor: T.bgSurface,
    border: '1px solid rgba(196,137,122,0.12)',
    borderRadius: '12px', padding: '20px 24px',
    display: 'flex', flexDirection: 'column', gap: '10px',
    cursor: 'pointer',
    boxShadow: '0 10px 28px rgba(28,25,23,0.035)',
    outline: 'none',
    transition: 'box-shadow 200ms, border-color 200ms, transform 200ms, background-color 200ms',
  },
  cardHovered: {
    boxShadow: '0 16px 36px rgba(28,25,23,0.07)',
    borderColor: 'rgba(196,137,122,0.26)',
    backgroundColor: '#FFFDFB',
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
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    fontFamily: '"DM Sans",sans-serif', fontSize: '13px',
    color: T.textTertiary, padding: '4px 2px',
  },
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

  /* Popular posts sidebar */
  popularRow: {
    display: 'flex', alignItems: 'flex-start', gap: '8px',
    background: 'none', border: 'none', width: '100%',
    padding: '7px 8px', borderRadius: '8px', cursor: 'pointer',
    textAlign: 'left', transition: 'background-color 120ms',
  },
  popularRank: {
    fontFamily: '"Cormorant Garamond",serif', fontSize: '16px', fontWeight: 400,
    color: T.accentLight, width: '16px', flexShrink: 0, lineHeight: 1.2,
  },
  popularInfo: { display: 'flex', flexDirection: 'column', gap: '3px', minWidth: 0 },
  popularTitle: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    fontWeight: 500, color: T.textPrimary, lineHeight: 1.45,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  popularMeta: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },

  unsungDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    backgroundColor: T.textTertiary, flexShrink: 0, marginBottom: '1px',
    opacity: 0.45,
  },
};
