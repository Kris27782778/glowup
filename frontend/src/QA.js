import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useReveal } from './hooks/useReveal';
import { useLang } from './hooks/useLang';



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
  const location = useLocation();
  const { t } = useLang();
  const [questions,   setQuestions]   = useState([]);
  const [tab,         setTab]         = useState('all');
  const [activeTag,   setActiveTag]   = useState('全部');
  const [search,      setSearch]      = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [expandedId,  setExpandedId]  = useState(null);
  useReveal();

  /* 頁面載入時從後端拿問題 */
  useEffect(() => {
    fetch('http://localhost:5001/api/questions')
      .then(r => r.json())
      .then(data => {
        // 把後端格式轉成畫面需要的格式
        const formatted = data.map(q => ({
          id: q.question_id,
          title: q.title,
          excerpt: q.detail,
          tags: q.tags || [],
          solved: q.solved,
          views: q.views,
          hot: false,
          initial: '?',
          authorColor: '#9E8A7A',
          author: '使用者',
          dept: '',
          time: new Date(q.created_at).toLocaleDateString('zh-TW'),
          aiAnswer: '',
          expert: null,
          community: [],
          _mine: false,
        }));
        setQuestions(formatted);
      })
      .catch(err => console.error('載入問題失敗', err));
  }, []);

  /* 從 AskQuestion 頁面帶回的新問題 */
  useEffect(() => {
    const nq = location.state?.newQuestion;
    if (nq) {
      setQuestions(prev => [nq, ...prev]);
      setTab('mine');
      window.history.replaceState({}, '');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const TABS = [
    { key: 'all',      label: t('全部問題') || '全部問題' },
    { key: 'unsolved', label: t('未解決') || '未解決' },
    { key: 'solved',   label: t('已解決') || '已解決' },
    { key: 'mine',     label: t('我的提問') || '我的提問' },
  ];

  const filtered = questions
    .filter(q => {
      if (tab === 'solved')   return q.solved;
      if (tab === 'unsolved') return !q.solved;
      if (tab === 'mine')     return q._mine === true;
      return true;
    })
    .filter(q => activeTag === '全部' || q.tags.includes(activeTag))
    .filter(q => !search || q.title.includes(search) || q.excerpt.includes(search));

  const handleToggle = (id) => setExpandedId(prev => prev === id ? null : id);

  return (
    <div style={s.page}>

      {/* ── Hero ── */}
      <div style={s.hero}>
        {/* 裝飾圓 */}
        <div style={s.heroDeco1} />
        <div style={s.heroDeco2} />

        <div style={s.heroInner}>
          <p style={s.heroEyebrow}>Q &amp; A</p>
          <h1 style={s.heroTitle}>{t('問答')}</h1>
          <p style={s.heroSub}>
            {t('向社群提出你的保養疑問，獲得同學的真實解答。') || '向社群提出你的保養疑問，獲得同學的真實解答。'}
          </p>

          {/* 搜尋 + 提問 */}
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
            <button style={s.askBtn} onClick={() => navigate('/qa/ask')}>
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <path d="M6.5 1v11M1 6.5h11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
              </svg>
              {t('提出問題') || '提出問題'}
            </button>
          </div>

        </div>
      </div>

      {/* ── Body ── */}
      <div style={s.body}>

        {/* ── Main ── */}
        <main style={s.main}>

          {/* Tab 列（Segment control 樣式） */}
          <div style={s.tabRow}>
            <div style={s.segmentGroup}>
              {TABS.map(tb => (
                <button
                  key={tb.key}
                  style={{ ...s.segmentBtn, ...(tab === tb.key ? s.segmentBtnActive : {}) }}
                  onClick={() => setTab(tb.key)}
                >
                  {tb.label}
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
  const answerTotal = (q.community?.length || 0) + (q.expert ? 1 : 0) + 1;
  const statusColor = q.solved ? '#5A9E7A' : '#C4A35A';

  return (
    <div style={{ ...s.card, animationDelay: `${idx * 60}ms` }} className="g-fade-up">

      {/* ── 橫向主體：狀態條 + 內容 + 右側統計 ── */}
      <div style={s.cardInner}>

        {/* 左側狀態色條 */}
        <div style={{ ...s.statusStrip, backgroundColor: statusColor }} />

        {/* 中間：問題主要資訊 */}
        <div style={s.cardContent}>
          {/* 標籤 + 熱門 */}
          <div style={s.cardTags}>
            {q.tags.map(tag => (
              <span key={tag} style={s.cardTag}>{t(tag) || tag}</span>
            ))}
            {q.hot && <span style={s.hotBadge}>{t('熱門') || '熱門'}</span>}
          </div>

          {/* 問題標題 */}
          <h3 style={s.cardTitle}>{q.title}</h3>

          {/* 作者列 */}
          <div style={s.authorRow}>
            <div style={{ ...s.avatar, backgroundColor: q.authorColor }}>{q.initial}</div>
            <span style={s.authorName}>{q.author}</span>
            <span style={s.authorDot}>·</span>
            <span style={s.authorMeta}>{q.dept}</span>
            <span style={s.authorDot}>·</span>
            <span style={s.authorMeta}>{q.time}</span>
          </div>
        </div>

        {/* 右側：統計 + 操作 */}
        <div style={s.cardSide}>
          {/* 回答數泡泡 */}
          <div style={{ ...s.answerBubble, borderColor: q.solved ? 'rgba(90,158,122,0.3)' : 'var(--border)' }}>
            <span style={{ ...s.answerBubbleNum, color: statusColor }}>{answerTotal}</span>
            <span style={s.answerBubbleLabel}>{t('則回答') || '則回答'}</span>
          </div>

        </div>
      </div>

      {/* 展開按鈕 */}
      <div style={s.cardFooter}>
        <button style={s.expandBtn} onClick={onToggle}>
          {expanded ? (t('收起回答') || '收起回答') : (t('查看回答') || '查看回答')}
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

  /* Hero — 深色置中 */
  hero: {
    backgroundColor: '#1C1917',
    borderBottom: '1px solid rgba(255,255,255,0.06)',
    padding: '56px 40px 40px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroDeco1: {
    position: 'absolute',
    width: '480px', height: '480px', borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.08)',
    top: '-200px', right: '-100px', pointerEvents: 'none',
  },
  heroDeco2: {
    position: 'absolute',
    width: '280px', height: '280px', borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.06)',
    bottom: '-120px', left: '8%', pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: '640px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    position: 'relative',
    zIndex: 1,
  },
  heroEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.2em',
    color: 'var(--accent)',
    margin: 0,
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '48px',
    fontWeight: 300,
    color: '#F7F4F2',
    margin: 0,
    letterSpacing: '0.04em',
    textAlign: 'center',
  },
  heroSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'rgba(247,244,242,0.5)',
    margin: '0 0 8px',
    textAlign: 'center',
    lineHeight: 1.6,
  },
  heroStats: {
    display: 'flex',
    gap: '0',
    borderTop: '1px solid rgba(255,255,255,0.08)',
    marginTop: '8px',
    paddingTop: '20px',
    width: '100%',
    justifyContent: 'center',
  },
  statItem: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    padding: '0 32px',
  },
  statItemBorder: {
    borderRight: '1px solid rgba(255,255,255,0.08)',
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
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
    width: '100%',
  },
  searchBox: {
    flex: 1,
    height: '48px',
    backgroundColor: 'rgba(247,244,242,0.07)',
    border: '1px solid rgba(247,244,242,0.12)',
    borderRadius: '12px',
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
    fontSize: '14px',
    color: '#F7F4F2',
  },
  askBtn: {
    height: '48px',
    padding: '0 22px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--accent)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
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

  /* Tabs — Segment control */
  tabRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  segmentGroup: {
    display: 'flex',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '3px',
    gap: '2px',
  },
  segmentBtn: {
    padding: '6px 14px',
    borderRadius: '7px',
    border: 'none',
    background: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 400,
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    transition: 'all 150ms',
    whiteSpace: 'nowrap',
  },
  segmentBtnActive: {
    backgroundColor: 'var(--bg-surface)',
    color: 'var(--text-primary)',
    fontWeight: 500,
    boxShadow: '0 1px 4px rgba(28,25,23,0.08)',
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
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 200ms',
  },
  cardInner: {
    display: 'flex',
    alignItems: 'stretch',
    gap: '0',
  },
  statusStrip: {
    width: '4px',
    flexShrink: 0,
    borderRadius: '0',
  },
  cardContent: {
    flex: 1,
    minWidth: 0,
    padding: '18px 20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardSide: {
    flexShrink: 0,
    width: '96px',
    borderLeft: '1px solid var(--border)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '16px 8px',
    backgroundColor: 'var(--bg-base)',
  },
  answerBubble: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '2px',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    padding: '8px 12px',
    backgroundColor: 'var(--bg-surface)',
    width: '100%',
    boxSizing: 'border-box',
  },
  answerBubbleNum: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '22px',
    fontWeight: 400,
    lineHeight: 1,
  },
  answerBubbleLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '10px',
    color: 'var(--text-tertiary)',
  },
  cardFooter: {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
    padding: '10px 20px',
    borderTop: '1px solid var(--border)',
    backgroundColor: 'var(--bg-base)',
  },
  authorRow: { display: 'flex', alignItems: 'center', gap: '6px' },
  avatar: {
    width: '20px', height: '20px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '10px', color: '#FFFFFF', flexShrink: 0,
  },
  authorName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)',
  },
  authorDot: {
    fontSize: '10px',
    color: 'var(--text-tertiary)',
  },
  authorMeta: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
  },
  hotBadge: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 600, letterSpacing: '0.06em',
    color: 'var(--accent)',
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: '1px solid rgba(196,137,122,0.2)',
    borderRadius: '999px', padding: '1px 7px',
  },
  statusBadge: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '10px', fontWeight: 500,
    borderRadius: '999px', padding: '2px 9px', letterSpacing: '0.02em',
    textAlign: 'center',
  },
  statusSolved: {
    color: '#5A9E7A',
    backgroundColor: 'rgba(90,158,122,0.1)',
    border: '1px solid rgba(90,158,122,0.25)',
  },
  statusUnsolved: {
    color: '#B8902A',
    backgroundColor: 'rgba(196,163,90,0.1)',
    border: '1px solid rgba(196,163,90,0.25)',
  },
  cardTags: { display: 'flex', gap: '5px', flexWrap: 'wrap', alignItems: 'center' },
  cardTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '999px', padding: '1px 8px',
  },
  cardTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '19px', fontWeight: 400,
    color: 'var(--text-primary)', margin: 0,
    lineHeight: 1.4, letterSpacing: '0.01em',
  },
  viewCount: {
    display: 'flex', alignItems: 'center', gap: '3px',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
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
    display: 'flex',
    flexDirection: 'column',
    gap: '0px',
    borderTop: '1px solid var(--border)',
    padding: '20px 24px 20px',
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
