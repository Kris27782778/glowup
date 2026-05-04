import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useReveal } from './hooks/useReveal';
import { useLang } from './hooks/useLang';

/* ─── Mock data ─────────────────────────────────────────── */
const MOCK_POSTS = [
  {
    id: 1, initial: '林', authorColor: '#C4897A',
    author: '林小羽', dept: '化妝品系', time: '2 小時前',
    tags: ['油性肌', '成分討論'],
    title: '用了一個月角鯊烷的心得：油肌也能超水嫩',
    excerpt: '一直以為油肌不能碰油，但加了角鯊烷之後膚況穩了很多，皮脂分泌反而變少。分享我目前的早晚保養流程給大家參考…',
    likes: 48, comments: 12, views: 234, hot: true,
  },
  {
    id: 2, initial: '陳', authorColor: '#9E8A7A',
    author: '陳柔安', dept: '護理學系', time: '5 小時前',
    tags: ['敏感肌', '去角質'],
    title: '終於找到敏感肌也能用的去角質方法',
    excerpt: '試過幾款果酸都刺激到不行，後來換成低濃度杏仁酸每週一次，完全沒有泛紅，效果還很好！',
    likes: 31, comments: 7, views: 156, hot: false,
  },
  {
    id: 3, initial: '王', authorColor: '#7A8A9E',
    author: '王思涵', dept: '化學系', time: '昨天',
    tags: ['成分討論', '抗老'],
    title: '菸鹼醯胺 5% vs 10%，整理研究與實測差異',
    excerpt: '整理了幾篇期刊和自身使用三個月的結果，兩個濃度對色沉的影響差距其實不如想像中大，但刺激性差很多。',
    likes: 87, comments: 24, views: 892, hot: true,
  },
  {
    id: 4, initial: '張', authorColor: '#8A9E7A',
    author: '張宇軒', dept: '資訊管理學系', time: '昨天',
    tags: ['混合性肌', '保濕'],
    title: 'T 區控油、兩頰保濕：分區保養的實際操作法',
    excerpt: '混合肌最麻煩的就是兩個區域的需求完全不同，這是我目前在用的早晚保養流程，用了半年下來效果很穩定。',
    likes: 22, comments: 5, views: 103, hot: false,
  },
  {
    id: 5, initial: '黃', authorColor: '#A08060',
    author: '黃品蓁', dept: '化妝品系', time: '2 天前',
    tags: ['防曬推薦', '保濕'],
    title: '2025 輕薄防曬推薦：這幾款化完妝也能補擦',
    excerpt: '測試了七款號稱輕薄的防曬，記錄各自的膚感、成膜速度和補擦疊加效果，適合混合肌和愛妝容的人參考。',
    likes: 64, comments: 18, views: 445, hot: false,
  },
  {
    id: 6, initial: '吳', authorColor: '#9A7AA0',
    author: '吳宜庭', dept: '生物科技學系', time: '3 天前',
    tags: ['屏障修護', '敏感肌'],
    title: '積雪草（CICA）原來這樣用才對？整理常見誤解',
    excerpt: '積雪草的消炎功效很常被誇大，實際研究顯示它主要是促進膠原蛋白合成。來整理一下實際有效的用法和適合誰用。',
    likes: 41, comments: 9, views: 278, hot: false,
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
  { initial: '林', color: '#C4897A', name: '林小羽', posts: 12 },
  { initial: '王', color: '#7A8A9E', name: '王思涵', posts: 9 },
  { initial: '黃', color: '#A08060', name: '黃品蓁', posts: 7 },
];

/* ─── 主元件 ─────────────────────────────────────────────── */
export default function Community() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [tab,        setTab]        = useState('latest');
  const [activeTag,  setActiveTag]  = useState('全部');
  const [search,     setSearch]     = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  useReveal();

  const TABS = [
    { key: 'latest',   label: t('最新') || '最新' },
    { key: 'hot',      label: t('熱門') },
    { key: 'featured', label: t('精選') || '精選' },
  ];

  const filtered = MOCK_POSTS
    .filter(p => activeTag === '全部' || p.tags.includes(activeTag))
    .filter(p => !search || p.title.includes(search) || p.excerpt.includes(search))
    .sort((a, b) => tab === 'hot' ? b.likes - a.likes : b.id - a.id);

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <div style={s.hero} className="community-hero">
        <div style={s.heroInner} className="community-hero-inner">
          <div style={s.heroLeft}>
            <p style={s.heroEyebrow}>COMMUNITY</p>
            <h1 style={s.heroTitle} className="community-hero-title">{t('社群討論')}</h1>
            <p style={s.heroSub}>{t('與輔大同學交流真實的保養心得，找到你信任的美妝知識。') || '與輔大同學交流真實的保養心得，找到你信任的美妝知識。'}</p>
          </div>
          <div style={s.heroStats} className="community-hero-stats">
            {[
              { num: '1,240', label: t('篇貼文') || '篇貼文' },
              { num: '368',   label: t('位成員') || '位成員' },
              { num: '89',    label: t('個標籤') || '個標籤' },
            ].map(item => (
              <div key={item.label} style={s.statItem}>
                <span style={s.statNum}>{item.num}</span>
                <span style={s.statLabel}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 搜尋 */}
        <div style={s.searchRow} className="community-search">
          <div style={{ ...s.searchBox, ...(searchFocus ? s.searchBoxFocus : {}) }} className="community-search-box">
            <svg width="15" height="15" viewBox="0 0 15 15" fill="none" style={{ flexShrink: 0 }}>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="rgba(247,244,242,0.45)" strokeWidth="1.4"/>
              <path d="M10 10L13 13" stroke="rgba(247,244,242,0.45)" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            <input
              style={s.searchInput}
              type="text"
              placeholder={t('搜尋貼文、標籤…') || '搜尋貼文、標籤…'}
              value={search}
              onChange={e => setSearch(e.target.value)}
              onFocus={() => setSearchFocus(true)}
              onBlur={() => setSearchFocus(false)}
            />
          </div>
          <button style={s.newPostBtn} className="community-new-post-btn" onClick={() => {}}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
            </svg>
            {t('發布貼文') || '發布貼文'}
          </button>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={s.body} className="community-body">

        {/* ── Main ── */}
        <main style={s.main}>

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
            <span style={s.postCount}>{filtered.length} {t('篇') || '篇'}</span>
          </div>

          {/* 標籤 filter */}
          <div style={s.tagRow} className="tag-row">
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

          {/* 貼文列表 */}
          {filtered.length === 0 ? (
            <div style={s.empty}>
              <p style={s.emptyTitle}>{t('找不到符合的貼文') || '找不到符合的貼文'}</p>
              <p style={s.emptySub}>{t('試試其他關鍵字或標籤') || '試試其他關鍵字或標籤'}</p>
            </div>
          ) : (
            filtered.map((post, i) => (
              <PostCard key={post.id} post={post} idx={i} t={t} />
            ))
          )}
        </main>

        {/* ── Sidebar ── */}
        <aside style={s.sidebar} className="community-sidebar">

          {/* 本週熱門話題 */}
          <div style={s.sideCard} className="g-reveal">
            <p style={s.sideTitle}>{t('本週熱門話題') || '本週熱門話題'}</p>
            <div style={s.trendingList}>
              {TRENDING.map((item, i) => (
                <div key={item.tag} style={s.trendingRow}>
                  <span style={s.trendingRank}>{i + 1}</span>
                  <span style={s.trendingTag}>{item.tag}</span>
                  <span style={s.trendingCount}>{item.count} {t('篇') || '篇'}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 活躍成員 */}
          <div style={s.sideCard} className="g-reveal delay-1">
            <p style={s.sideTitle}>{t('活躍成員') || '活躍成員'}</p>
            <div style={s.memberList}>
              {ACTIVE_MEMBERS.map(m => (
                <div key={m.name} style={s.memberRow}>
                  <div style={{ ...s.memberAvatar, backgroundColor: m.color }}>{m.initial}</div>
                  <div style={s.memberInfo}>
                    <span style={s.memberName}>{m.name}</span>
                    <span style={s.memberPosts}>{m.posts} {t('篇貼文') || '篇貼文'}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 快速入口 */}
          <div style={s.sideCard} className="g-reveal delay-2">
            <p style={s.sideTitle}>{t('快速入口')}</p>
            <button style={s.quickBtn} onClick={() => navigate('/qa')}>
              <span>{t('問答') || '問答'}</span>
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

/* ─── 貼文卡片 ─────────────────────────────────────────── */
function PostCard({ post, idx, t }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(post.likes);

  const handleLike = (e) => {
    e.stopPropagation();
    setLiked(l => !l);
    setLikes(n => liked ? n - 1 : n + 1);
  };

  return (
    <div
      style={{ ...s.card, animationDelay: `${idx * 60}ms` }}
      className="g-fade-up"
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
        {post.hot && (
          <span style={s.hotBadge}>{t('熱門')}</span>
        )}
      </div>

      {/* 標籤 */}
      <div style={s.cardTags}>
        {post.tags.map(tag => (
          <span key={tag} style={s.cardTag}>{t(tag) || tag}</span>
        ))}
      </div>

      {/* 標題 + 摘要 */}
      <h3 style={s.cardTitle}>{post.title}</h3>
      <p style={s.cardExcerpt}>{post.excerpt}</p>

      {/* 底部：互動 */}
      <div style={s.cardFooter}>
        <div style={s.cardStats}>
          <button
            style={{ ...s.statBtn, ...(liked ? s.statBtnLiked : {}) }}
            onClick={handleLike}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill={liked ? 'var(--accent)' : 'none'}>
              <path d="M7 12S1.5 8.5 1.5 4.5a2.5 2.5 0 015-0 2.5 2.5 0 015 0C11.5 8.5 7 12 7 12z"
                stroke="var(--accent)" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            {likes}
          </button>
          <button style={s.statBtn}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2h10a1 1 0 011 1v6a1 1 0 01-1 1H5l-3 2V3a1 1 0 011-1z"
                stroke="var(--text-tertiary)" strokeWidth="1.3" strokeLinejoin="round"/>
            </svg>
            {post.comments}
          </button>
          <span style={s.viewCount}>
            <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
              <ellipse cx="6.5" cy="6.5" rx="5.5" ry="3.5" stroke="var(--text-tertiary)" strokeWidth="1.2"/>
              <circle cx="6.5" cy="6.5" r="1.5" fill="var(--text-tertiary)"/>
            </svg>
            {post.views}
          </span>
        </div>
        <button style={s.shareBtn}>{t('分享')}</button>
      </div>
    </div>
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
  newPostBtn: {
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
  tabs: {
    display: 'flex',
  },
  tab: {
    position: 'relative',
    padding: '10px 16px',
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    letterSpacing: '0.01em',
  },
  tabActive: {
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
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
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
  },
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

  /* Post card */
  card: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px 24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    cursor: 'pointer',
    transition: 'box-shadow 200ms, border-color 200ms',
  },
  cardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  avatar: {
    width: '34px',
    height: '34px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '15px',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  authorInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
  },
  authorName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
  },
  authorMeta: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },
  hotBadge: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'var(--accent)',
    backgroundColor: 'rgba(196,137,122,0.12)',
    border: '1px solid rgba(196,137,122,0.2)',
    borderRadius: '999px',
    padding: '2px 8px',
  },
  cardTags: {
    display: 'flex',
    gap: '6px',
    flexWrap: 'wrap',
  },
  cardTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '999px',
    padding: '2px 8px',
  },
  cardTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.35,
    letterSpacing: '0.01em',
  },
  cardExcerpt: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.65,
    display: '-webkit-box',
    WebkitLineClamp: 2,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: '8px',
    borderTop: '1px solid var(--border)',
    marginTop: '2px',
  },
  cardStats: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  statBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: '4px 2px',
  },
  statBtnLiked: {
    color: 'var(--accent)',
  },
  viewCount: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
  },
  shareBtn: {
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    padding: '4px 0',
  },

  /* Empty */
  empty: {
    padding: '48px 0',
    textAlign: 'center',
  },
  emptyTitle: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '22px',
    fontWeight: 400,
    color: 'var(--text-secondary)',
    margin: '0 0 8px',
  },
  emptySub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-tertiary)',
    margin: 0,
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
    fontSize: '10px',
    fontWeight: 600,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    margin: 0,
  },

  /* Trending */
  trendingList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  trendingRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  trendingRank: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 600,
    color: 'var(--text-tertiary)',
    width: '16px',
  },
  trendingTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    flex: 1,
  },
  trendingCount: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },

  /* Members */
  memberList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  memberRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  memberAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '13px',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  memberInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    minWidth: 0,
  },
  memberName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  memberPosts: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
  },

  /* Quick buttons */
  quickBtn: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '9px 12px',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'background-color 150ms',
  },
};
