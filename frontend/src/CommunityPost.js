import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_POSTS } from './Community';

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

/* ─── 完整貼文詳細資料 ─────────────────────────────────── */
const POSTS_DETAIL = {
  1: {
    content: [
      { type: 'p', text: '大家好，我是林小羽，化妝品系大三。一直以來都覺得油肌不能碰任何油脂，但最近嘗試了角鯊烷之後完全改變了我的想法。' },
      { type: 'p', text: '角鯊烷（Squalane）是一種從角鯊烯（Squalene）氫化而來的成分，天然存在於人體皮脂中。正因為它的分子結構和皮脂高度相似，所以完全不會堵塞毛孔，反而能幫助皮脂腺「覺得夠了」，減少過度分泌。' },
      { type: 'heading', text: '我的使用方式' },
      { type: 'p', text: '我用的是 The Ordinary 的 100% 角鯊烷，每晚在乳液之後點 1-2 滴，直接按壓在臉上。第一週會覺得有點油膩感，但一個月下來 T 區出油明顯減少，兩頰變得很柔嫩。' },
      { type: 'p', text: '另外我也在玻尿酸之後疊用，這樣可以幫助鎖住前面補充的水分，整體保水效果更好。' },
      { type: 'heading', text: '注意事項' },
      { type: 'p', text: '雖然角鯊烷適合大多數膚質，但如果你的膚質偏向混合偏油，建議只在乾燥的兩頰和眼周使用，T 區可以略過或是非常薄量。另外一定要選「Squalane」而不是「Squalene」，後者是未氧化版本，不穩定且致粉刺性更高。' },
    ],
    ingredients: [
      { name: '角鯊烷', safety: 'safe', summary: '仿真皮脂，非致粉刺，高度相容各膚質', ewg: 1 },
      { name: '玻尿酸', safety: 'safe', summary: '天然保濕因子，可吸附數倍重量水分', ewg: 1 },
    ],
    products: [
      { name: 'The Ordinary 100% Squalane', brand: 'The Ordinary' },
      { name: 'COSRX Hyaluronic Acid Hydra Power Essence', brand: 'COSRX' },
    ],
    comments: [
      {
        id: 1, initial: '陳', color: '#9E8A7A', author: '陳柔安', time: '1 小時前',
        text: '太有幫助了！我也是油肌一直不敢用油，這篇讓我決定去嘗試看看。請問你是在乳液前還是後用角鯊烷？',
        likes: 5, liked: false,
        replies: [
          {
            id: 11, initial: '林', color: '#C4897A', author: '林小羽', time: '50 分鐘前',
            text: '我是在乳液之後、睡前用，這樣當作最後一層的鎖水油。如果你是早上也想用，可以放在防曬前！',
            likes: 3, liked: false,
          }
        ],
      },
      {
        id: 2, initial: '王', color: '#7A8A9E', author: '王思涵', time: '45 分鐘前',
        text: '補充一點化學觀點：角鯊烷因為完全飽和，所以氧化穩定性很高，不容易酸敗。這也是為什麼相比其他植物油，它更適合長期使用。',
        likes: 12, liked: false,
        replies: [],
      },
      {
        id: 3, initial: '張', color: '#8A9E7A', author: '張宇軒', time: '20 分鐘前',
        text: '同感！我用了兩個月了，皮膚出油量真的明顯改善。推薦一起搭配神經醯胺，修護效果更好。',
        likes: 7, liked: false,
        replies: [],
      },
    ],
    relatedQA: [
      { id: 1, q: '角鯊烷和荷荷芭油哪個更適合油性肌？', answers: 3 },
      { id: 2, q: '植物角鯊烷和鯊魚角鯊烷有差嗎？', answers: 2 },
    ],
    relatedPosts: [3, 4],
    readTime: '4 分鐘',
  },
  2: {
    content: [
      { type: 'p', text: '敏感肌的我試過各種去角質，最後找到了一個非常溫和的方式跟大家分享。' },
      { type: 'heading', text: '為什麼選擇杏仁酸' },
      { type: 'p', text: '杏仁酸（Mandelic Acid）分子量在所有果酸中是最大的，所以穿透性最低，刺激性也最小。對敏感肌和初接觸果酸的人非常友好。' },
      { type: 'p', text: '我用的是 6% 濃度，每週只用一次，在洗完臉後點在全臉，放置 10 分鐘再沖掉。搭配積雪草成分的精華後，完全沒有任何泛紅反應。' },
    ],
    ingredients: [
      { name: '杏仁酸', safety: 'caution', summary: '大分子果酸，溫和去角質，適合敏感肌', ewg: 3 },
      { name: '積雪草', safety: 'safe', summary: '促進膠原蛋白合成，舒緩修護屏障', ewg: 1 },
    ],
    products: [
      { name: 'Paula\'s Choice Mandelic Acid', brand: "Paula's Choice" },
    ],
    comments: [
      {
        id: 1, initial: '吳', color: '#9A7AA0', author: '吳宜庭', time: '3 小時前',
        text: '杏仁酸真的很友好！我也是用這個，建議初次使用的人可以從每兩週一次開始，慢慢讓皮膚適應。',
        likes: 8, liked: false,
        replies: [],
      },
    ],
    relatedQA: [
      { id: 3, q: '果酸和水楊酸的適用情況有什麼不同？', answers: 5 },
    ],
    relatedPosts: [1, 6],
    readTime: '3 分鐘',
  },
  3: {
    content: [
      { type: 'p', text: '這篇整理了我查到的幾篇研究，加上自己使用三個月的實測，想給大家一個比較客觀的對比。' },
      { type: 'heading', text: '研究數據怎麼說' },
      { type: 'p', text: '根據 2002 年在 Dermatology 期刊發表的雙盲研究，5% 菸鹼醯胺對色沉的改善效果在 12 週後約達到 35%。而 10% 濃度的研究顯示效果並沒有顯著更好（約 38%），但刺激性（潮紅、搔癢）的發生率從 5% 的 8% 上升到 10% 的 23%。' },
      { type: 'heading', text: '實測感受' },
      { type: 'p', text: '我是混合性肌，先用 5% 兩個月，膚色確實均勻了一些，毛孔也比較細緻。後來換成 10%，前兩週有輕微泛紅，之後適應了就沒問題，但效果改善沒有明顯到值得忍受不適。' },
      { type: 'p', text: '如果你是膚質耐受度一般的人，5% 完全夠用。A醇也可以搭配但要注意不要和高濃度 VC 同時使用。' },
    ],
    ingredients: [
      { name: '菸鹼醯胺', safety: 'safe', summary: 'B3 維生素，縮毛孔、提亮、控油三效', ewg: 1 },
      { name: 'A醇', safety: 'caution', summary: '視黃醇，強效抗老，需循序漸進', ewg: 7 },
    ],
    products: [
      { name: 'The Ordinary Niacinamide 10% + Zinc 1%', brand: 'The Ordinary' },
      { name: 'Paula\'s Choice 1% Retinol Treatment', brand: "Paula's Choice" },
    ],
    comments: [
      {
        id: 1, initial: '黃', color: '#A08060', author: '黃品蓁', time: '2 小時前',
        text: '感謝這篇！我一直在 5% 和 10% 之間猶豫，看完這篇決定繼續用 5%。',
        likes: 14, liked: false,
        replies: [
          {
            id: 11, initial: '王', color: '#7A8A9E', author: '王思涵', time: '1 小時前',
            text: '對，一般狀況下 5% 是最好的選擇，效果和耐受性的平衡點。',
            likes: 6, liked: false,
          }
        ],
      },
      {
        id: 2, initial: '林', color: '#C4897A', author: '林小羽', time: '30 分鐘前',
        text: '請問 A醇和菸鹼醯胺可以同一個晚上用嗎？還是要分開？',
        likes: 3, liked: false,
        replies: [],
      },
    ],
    relatedQA: [
      { id: 2, q: '菸鹼醯胺和維C可以同時用嗎？', answers: 5 },
      { id: 4, q: '第一次用 A醇怎麼建立耐受？', answers: 7 },
    ],
    relatedPosts: [1, 5],
    readTime: '6 分鐘',
  },
};

// 補齊其他貼文的基本詳細資料
[4, 5, 6].forEach(id => {
  if (!POSTS_DETAIL[id]) {
    const post = MOCK_POSTS.find(p => p.id === id);
    POSTS_DETAIL[id] = {
      content: [
        { type: 'p', text: post?.excerpt || '' },
        { type: 'p', text: '（完整內文載入中…）' },
      ],
      ingredients: (post?.ingredients || []).map(name => ({
        name, safety: 'safe', summary: '', ewg: null,
      })),
      products: [],
      comments: [],
      relatedQA: [],
      relatedPosts: [],
      readTime: '3 分鐘',
    };
  }
});

/* ─── 反應系統設定 ─────────────────────────────────────── */
const REACTIONS = [
  { key: 'heart',   emoji: '❤️', label: '喜歡' },
  { key: 'learn',   emoji: '📚', label: '學到了' },
  { key: 'same',    emoji: '🙋', label: '我也是' },
  { key: 'wow',     emoji: '✨', label: '漲知識' },
  { key: 'helpful', emoji: '💡', label: '有幫助' },
];

const SAFETY_STYLE = {
  safe:    { color: '#4A8A60', bg: 'rgba(123,174,138,0.1)',  border: 'rgba(123,174,138,0.28)', label: '安全' },
  caution: { color: '#9A7020', bg: 'rgba(212,168,67,0.1)',   border: 'rgba(212,168,67,0.3)',   label: '注意' },
  risk:    { color: '#9A3020', bg: 'rgba(196,97,74,0.1)',    border: 'rgba(196,97,74,0.3)',    label: '風險' },
};

/* ─── 工具：將內文中的成分名稱轉成高亮 span ─────────────── */
function HighlightedText({ text, ingredients, navigate }) {
  if (!ingredients?.length) return <span>{text}</span>;
  const names = ingredients.map(i => i.name);
  const regex = new RegExp(`(${names.map(n => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})`, 'g');
  const parts = text.split(regex);
  return (
    <>
      {parts.map((part, i) =>
        names.includes(part) ? (
          <button
            key={i}
            style={cs.inlineIngredient}
            onClick={() => navigate(`/products?q=${encodeURIComponent(part)}`)}
          >
            {part}
          </button>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

/* ─── 主元件 ─────────────────────────────────────────────── */
export default function CommunityPost() {
  const { id } = useParams();
  const navigate = useNavigate();
  const commentsRef = useRef(null);

  const postId = parseInt(id, 10);
  const post = MOCK_POSTS.find(p => p.id === postId);
  const detail = POSTS_DETAIL[postId];

  const [myReactions, setMyReactions] = useState({});
  const [reactionCounts, setReactionCounts] = useState(() => {
    const base = post?.reactions || {};
    return { heart: 0, learn: 0, same: 0, wow: 0, helpful: 0, ...base };
  });
  const [bookmarked, setBookmarked] = useState(false);
  const [comments, setComments] = useState(detail?.comments || []);
  const [commentText, setCommentText] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  const [commentFocus, setCommentFocus] = useState(false);
  const [showExtendAsk, setShowExtendAsk] = useState(false);

  // 處理跳到留言區
  useEffect(() => {
    if (window.location.hash === '#comments' && commentsRef.current) {
      setTimeout(() => commentsRef.current.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, []);

  if (!post || !detail) {
    return (
      <div style={{ ...cs.page, display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div style={{ textAlign: 'center' }}>
          <p style={{ fontFamily: '"Cormorant Garamond",serif', fontSize: '24px', color: T.textSecondary }}>找不到這篇貼文</p>
          <button style={cs.backBtn} onClick={() => navigate('/community')}>← 回社群</button>
        </div>
      </div>
    );
  }

  const toggleReaction = (key) => {
    const isActive = myReactions[key];
    setMyReactions(prev => ({ ...prev, [key]: !isActive }));
    setReactionCounts(prev => ({ ...prev, [key]: isActive ? prev[key] - 1 : prev[key] + 1 }));
  };

  const handleComment = () => {
    if (!commentText.trim()) return;
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;
    const newComment = {
      id: Date.now(), initial: user?.nickname?.[0] || '我',
      color: T.accent, author: user?.nickname || '我',
      time: '剛剛', text: commentText.trim(), likes: 0, liked: false, replies: [],
    };
    setComments(prev => [newComment, ...prev]);
    setCommentText('');
  };

  const handleReply = (commentId) => {
    if (!replyText.trim()) return;
    const stored = localStorage.getItem('user');
    const user = stored ? JSON.parse(stored) : null;
    const newReply = {
      id: Date.now(), initial: user?.nickname?.[0] || '我',
      color: T.accent, author: user?.nickname || '我',
      time: '剛剛', text: replyText.trim(), likes: 0, liked: false,
    };
    setComments(prev => prev.map(c =>
      c.id === commentId ? { ...c, replies: [...(c.replies || []), newReply] } : c
    ));
    setReplyText('');
    setReplyingTo(null);
  };

  const toggleCommentLike = (commentId, replyId) => {
    setComments(prev => prev.map(c => {
      if (c.id === commentId) {
        if (replyId) {
          return {
            ...c,
            replies: c.replies.map(r =>
              r.id === replyId ? { ...r, liked: !r.liked, likes: r.liked ? r.likes - 1 : r.likes + 1 } : r
            ),
          };
        }
        return { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 };
      }
      return c;
    }));
  };

  const relatedPosts = (detail.relatedPosts || [])
    .map(rid => MOCK_POSTS.find(p => p.id === rid))
    .filter(Boolean);

  return (
    <div style={cs.page}>
      {/* ── 延伸提問 overlay ── */}
      {showExtendAsk && (
        <ExtendAskModal
          postTitle={post.title}
          onConfirm={() => {
            setShowExtendAsk(false);
            navigate('/qa/ask', { state: { prefill: `關於「${post.title}」，我想進一步了解…` } });
          }}
          onClose={() => setShowExtendAsk(false)}
        />
      )}

      {/* ── Breadcrumb bar ── */}
      <div style={cs.topBar}>
        <div style={cs.topBarInner}>
          <button style={cs.backBtn} onClick={() => navigate('/community')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L4 7l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            回社群
          </button>
          <div style={cs.breadcrumb}>
            <span style={cs.breadcrumbItem} onClick={() => navigate('/community')}>社群討論</span>
            <span style={cs.breadcrumbSep}>›</span>
            <span style={cs.breadcrumbCurrent}>{post.tags[0]}</span>
          </div>
        </div>
      </div>

      {/* ── 主體 ── */}
      <div style={cs.body}>
        {/* ── 左側主要內容 ── */}
        <article style={cs.article}>

          {/* 文章標頭 */}
          <header style={cs.articleHeader}>
            {/* 作者列 */}
            <div style={cs.authorRow}>
              <div style={{ ...cs.avatar, backgroundColor: post.authorColor }}>{post.initial}</div>
              <div style={cs.authorInfo}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={cs.authorName}>{post.author}</span>
                  {post.hot && <span style={cs.hotBadge}>熱門</span>}
                </div>
                <span style={cs.authorMeta}>{post.dept} · {post.time} · 閱讀時間 {detail.readTime}</span>
              </div>
              <button style={cs.followBtn}>追蹤</button>
            </div>

            {/* 標籤列 */}
            <div style={cs.tagRow}>
              {post.tags.map(tag => (
                <span key={tag} style={cs.tag}>{tag}</span>
              ))}
              {post.skinTypes?.map(st => (
                <span key={st} style={cs.skinTag}>{st}</span>
              ))}
            </div>

            {/* 大標題 */}
            <h1 style={cs.title}>{post.title}</h1>

            {/* 數據列 */}
            <div style={cs.metaRow}>
              <span style={cs.metaItem}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <ellipse cx="6.5" cy="6.5" rx="5.5" ry="3.5" stroke={T.textTertiary} strokeWidth="1.2"/>
                  <circle cx="6.5" cy="6.5" r="1.5" fill={T.textTertiary}/>
                </svg>
                {post.views} 次瀏覽
              </span>
              <span style={cs.metaItem}>
                <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                  <path d="M1.5 1.5h10a1 1 0 011 1v6a1 1 0 01-1 1H4.5l-3 2V2.5a1 1 0 011-1z"
                    stroke={T.textTertiary} strokeWidth="1.2" strokeLinejoin="round"/>
                </svg>
                {comments.length} 則留言
              </span>
            </div>
          </header>

          {/* 文章正文 */}
          <div style={cs.contentArea}>
            {detail.content.map((block, i) => {
              if (block.type === 'heading') {
                return <h2 key={i} style={cs.contentHeading}>{block.text}</h2>;
              }
              return (
                <p key={i} style={cs.contentP}>
                  <HighlightedText
                    text={block.text}
                    ingredients={detail.ingredients}
                    navigate={navigate}
                  />
                </p>
              );
            })}
          </div>

          {/* 提及成分欄 */}
          {detail.ingredients?.length > 0 && (
            <div style={cs.ingredientBar}>
              <p style={cs.ingredientBarTitle}>文中提及的成分</p>
              <div style={cs.ingredientList}>
                {detail.ingredients.map(ing => {
                  const ss = SAFETY_STYLE[ing.safety] || SAFETY_STYLE.safe;
                  return (
                    <button
                      key={ing.name}
                      style={{ ...cs.ingredientCard, borderColor: ss.border, backgroundColor: ss.bg }}
                      onClick={() => navigate(`/products?q=${encodeURIComponent(ing.name)}`)}
                    >
                      <div style={cs.ingredientCardTop}>
                        <span style={{ ...cs.ingredientCardName, color: ss.color }}>{ing.name}</span>
                        <span style={{ ...cs.ingredientSafetyBadge, color: ss.color, borderColor: ss.border, backgroundColor: ss.bg }}>
                          {ss.label}
                          {ing.ewg != null && ` · EWG ${ing.ewg}`}
                        </span>
                      </div>
                      {ing.summary && <p style={cs.ingredientCardDesc}>{ing.summary}</p>}
                      <span style={{ ...cs.ingredientCardLink, color: ss.color }}>查看完整成分 →</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* 提及產品 */}
          {detail.products?.length > 0 && (
            <div style={cs.productBar}>
              <p style={cs.productBarTitle}>文中提及的產品</p>
              <div style={cs.productList}>
                {detail.products.map(prod => (
                  <button
                    key={prod.name}
                    style={cs.productChip}
                    onClick={() => navigate(`/products?q=${encodeURIComponent(prod.brand)}`)}
                  >
                    <span style={cs.productBrand}>{prod.brand}</span>
                    <span style={cs.productName}>{prod.name}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 反應列 */}
          <div style={cs.reactionBar}>
            <p style={cs.reactionLabel}>這篇文章對你有幫助嗎？</p>
            <div style={cs.reactionRow}>
              {REACTIONS.map(r => {
                const active = myReactions[r.key];
                return (
                  <button
                    key={r.key}
                    style={{ ...cs.reactionBtn, ...(active ? cs.reactionBtnActive : {}) }}
                    onClick={() => toggleReaction(r.key)}
                  >
                    <span style={cs.reactionEmoji}>{r.emoji}</span>
                    <span style={{ ...cs.reactionCount, ...(active ? { color: T.accent } : {}) }}>
                      {reactionCounts[r.key] || 0}
                    </span>
                    <span style={cs.reactionName}>{r.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 動作列 */}
          <div style={cs.actionBar}>
            <button
              style={{ ...cs.actionBtn, ...(bookmarked ? cs.actionBtnActive : {}) }}
              onClick={() => setBookmarked(b => !b)}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill={bookmarked ? T.accent : 'none'}>
                <path d="M3 2h8a1 1 0 011 1v9l-5-3-5 3V3a1 1 0 011-1z"
                  stroke={bookmarked ? T.accent : T.textSecondary} strokeWidth="1.3" strokeLinejoin="round"/>
              </svg>
              {bookmarked ? '已收藏' : '收藏文章'}
            </button>

            <button style={cs.actionBtn}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M10 1.5L13 4.5L10 7.5M1 4.5h12M4 6.5L1 9.5L4 12.5M13 9.5H1" stroke={T.textSecondary} strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              分享
            </button>

            <button style={cs.extendAskBtn} onClick={() => setShowExtendAsk(true)}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5.5 5.5a1.5 1.5 0 113 0c0 .83-.67 1.5-1.5 1.5v1M7 10h.01" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              延伸提問
            </button>
          </div>

          {/* ── 留言區 ── */}
          <section style={cs.commentsSection} ref={commentsRef} id="comments">
            <h2 style={cs.commentsTitle}>
              討論（{comments.length} 則）
            </h2>

            {/* 留言輸入框 */}
            <div style={cs.commentInputWrap}>
              <div style={{ ...cs.commentInputAvatar }}>我</div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <textarea
                  style={{ ...cs.commentInput, ...(commentFocus ? cs.commentInputFocus : {}) }}
                  placeholder="分享你的想法或補充資訊…"
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  onFocus={() => setCommentFocus(true)}
                  onBlur={() => setCommentFocus(false)}
                  rows={3}
                />
                {(commentFocus || commentText) && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button style={cs.commentCancelBtn} onClick={() => { setCommentText(''); setCommentFocus(false); }}>取消</button>
                    <button
                      style={{ ...cs.commentSubmitBtn, ...(!commentText.trim() ? cs.commentSubmitDisabled : {}) }}
                      disabled={!commentText.trim()}
                      onClick={handleComment}
                    >
                      發布留言
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* 留言列表 */}
            <div style={cs.commentList}>
              {comments.map(comment => (
                <div key={comment.id} style={cs.commentItem}>
                  {/* 主留言 */}
                  <div style={cs.commentRow}>
                    <div style={{ ...cs.commentAvatar, backgroundColor: comment.color }}>{comment.initial}</div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={cs.commentMeta}>
                        <span style={cs.commentAuthor}>{comment.author}</span>
                        <span style={cs.commentTime}>{comment.time}</span>
                      </div>
                      <p style={cs.commentText}>{comment.text}</p>
                      <div style={cs.commentActions}>
                        <button
                          style={{ ...cs.commentActionBtn, ...(comment.liked ? { color: T.accent } : {}) }}
                          onClick={() => toggleCommentLike(comment.id, null)}
                        >
                          ♡ {comment.likes}
                        </button>
                        <button
                          style={cs.commentActionBtn}
                          onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                        >
                          回覆
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* 回覆列 */}
                  {comment.replies?.length > 0 && (
                    <div style={cs.repliesWrap}>
                      {comment.replies.map(reply => (
                        <div key={reply.id} style={cs.replyRow}>
                          <div style={{ ...cs.commentAvatar, ...cs.replyAvatar, backgroundColor: reply.color }}>
                            {reply.initial}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={cs.commentMeta}>
                              <span style={cs.commentAuthor}>{reply.author}</span>
                              <span style={cs.commentTime}>{reply.time}</span>
                            </div>
                            <p style={cs.commentText}>{reply.text}</p>
                            <button
                              style={{ ...cs.commentActionBtn, ...(reply.liked ? { color: T.accent } : {}) }}
                              onClick={() => toggleCommentLike(comment.id, reply.id)}
                            >
                              ♡ {reply.likes}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* 回覆輸入框 */}
                  {replyingTo === comment.id && (
                    <div style={{ ...cs.replyInputWrap }}>
                      <div style={{ ...cs.commentAvatar, ...cs.replyAvatar }}>我</div>
                      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        <textarea
                          style={cs.replyInput}
                          placeholder={`回覆 ${comment.author}…`}
                          value={replyText}
                          onChange={e => setReplyText(e.target.value)}
                          rows={2}
                          autoFocus
                        />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                          <button style={cs.commentCancelBtn} onClick={() => { setReplyingTo(null); setReplyText(''); }}>取消</button>
                          <button
                            style={{ ...cs.commentSubmitBtn, ...(!replyText.trim() ? cs.commentSubmitDisabled : {}) }}
                            disabled={!replyText.trim()}
                            onClick={() => handleReply(comment.id)}
                          >
                            發布回覆
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </article>

        {/* ── 右側 Sidebar ── */}
        <aside style={cs.sidebar}>

          {/* 作者卡片 */}
          <div style={cs.sideCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ ...cs.sideAvatar, backgroundColor: post.authorColor }}>{post.initial}</div>
              <div>
                <p style={cs.sideAuthorName}>{post.author}</p>
                <p style={cs.sideAuthorDept}>{post.dept}</p>
              </div>
            </div>
            <button style={cs.sideFollowBtn}>追蹤作者</button>
            <div style={cs.sideAuthorStats}>
              <div style={cs.sideAuthorStat}>
                <span style={cs.sideAuthorStatNum}>12</span>
                <span style={cs.sideAuthorStatLabel}>篇貼文</span>
              </div>
              <div style={cs.sideAuthorStat}>
                <span style={cs.sideAuthorStatNum}>234</span>
                <span style={cs.sideAuthorStatLabel}>追蹤者</span>
              </div>
            </div>
          </div>

          {/* 成分快查 */}
          {detail.ingredients?.length > 0 && (
            <div style={cs.sideCard}>
              <p style={cs.sideTitle}>文中成分速查</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {detail.ingredients.map(ing => {
                  const ss = SAFETY_STYLE[ing.safety] || SAFETY_STYLE.safe;
                  return (
                    <button
                      key={ing.name}
                      style={cs.sideIngRow}
                      onClick={() => navigate(`/products?q=${encodeURIComponent(ing.name)}`)}
                    >
                      <span style={{ ...cs.sideIngDot, backgroundColor: ss.color }} />
                      <span style={cs.sideIngName}>{ing.name}</span>
                      <span style={{ ...cs.sideIngBadge, color: ss.color }}>{ss.label}</span>
                    </button>
                  );
                })}
                <button style={cs.sideIngMoreBtn} onClick={() => navigate('/products')}>
                  查看成分資料庫 →
                </button>
              </div>
            </div>
          )}

          {/* 相關問答 */}
          {detail.relatedQA?.length > 0 && (
            <div style={cs.sideCard}>
              <p style={cs.sideTitle}>相關問答</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {detail.relatedQA.map(qa => (
                  <button key={qa.id} style={cs.sideQARow} onClick={() => navigate('/qa')}>
                    <span style={cs.sideQAQ}>{qa.q}</span>
                    <span style={cs.sideQACount}>{qa.answers} 則回答</span>
                  </button>
                ))}
                <button style={cs.extendAskSideBtn} onClick={() => setShowExtendAsk(true)}>
                  <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                    <path d="M5.5 1v9M1 5.5h9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  針對這篇貼文提問
                </button>
              </div>
            </div>
          )}

          {/* 相關貼文 */}
          {relatedPosts.length > 0 && (
            <div style={cs.sideCard}>
              <p style={cs.sideTitle}>相關貼文</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {relatedPosts.map(rp => (
                  <button key={rp.id} style={cs.sideRelatedPost} onClick={() => navigate(`/community/post/${rp.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <div style={{ ...cs.sideRelatedAvatar, backgroundColor: rp.authorColor }}>{rp.initial}</div>
                      <span style={cs.sideRelatedAuthor}>{rp.author}</span>
                    </div>
                    <p style={cs.sideRelatedTitle}>{rp.title}</p>
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <span style={cs.sideRelatedStat}>♡ {rp.likes}</span>
                      <span style={cs.sideRelatedStat}>💬 {rp.comments}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

        </aside>
      </div>
    </div>
  );
}

/* ─── 延伸提問 Modal ─────────────────────────────────────── */
function ExtendAskModal({ postTitle, onConfirm, onClose }) {
  return (
    <div style={eam.overlay} onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={eam.modal}>
        <p style={eam.eyebrow}>延伸提問</p>
        <h3 style={eam.title}>針對這篇貼文提問</h3>
        <p style={eam.desc}>
          閱讀完「{postTitle}」後，有沒有想繼續深入了解的問題？
          點擊下方按鈕，進入問答系統並自動帶入主題。
        </p>
        <div style={eam.actions}>
          <button style={eam.cancelBtn} onClick={onClose}>取消</button>
          <button style={eam.confirmBtn} onClick={onConfirm}>前往提問 →</button>
        </div>
      </div>
    </div>
  );
}
const eam = {
  overlay: {
    position: 'fixed', inset: 0, zIndex: 500,
    backgroundColor: 'rgba(28,25,23,0.5)',
    backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px',
  },
  modal: {
    backgroundColor: T.bgSurface, borderRadius: '16px',
    padding: '32px', maxWidth: '440px', width: '100%',
    boxShadow: '0 24px 64px rgba(28,25,23,0.18)',
  },
  eyebrow: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.16em', color: T.accent, margin: '0 0 6px',
  },
  title: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '24px', fontWeight: 400, color: T.textPrimary, margin: '0 0 12px',
  },
  desc: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: T.textSecondary, lineHeight: 1.7, margin: '0 0 24px',
  },
  actions: { display: 'flex', justifyContent: 'flex-end', gap: '10px' },
  cancelBtn: {
    height: '40px', padding: '0 18px',
    background: 'none', border: `1px solid ${T.border}`, borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', color: T.textSecondary, cursor: 'pointer',
  },
  confirmBtn: {
    height: '40px', padding: '0 22px',
    backgroundColor: T.accent, border: 'none', borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', fontWeight: 500, color: '#fff', cursor: 'pointer',
  },
};

/* ─── Styles ─────────────────────────────────────────────── */
const cs = {
  page: {
    paddingTop: '64px',
    backgroundColor: T.bgBase,
    minHeight: '100vh',
  },

  /* Top bar */
  topBar: {
    backgroundColor: T.bgSurface,
    borderBottom: `1px solid ${T.border}`,
    padding: '0 40px',
  },
  topBarInner: {
    maxWidth: '1100px', margin: '0 auto',
    height: '52px',
    display: 'flex', alignItems: 'center', gap: '16px',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '5px',
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', color: T.textSecondary,
    padding: '6px 10px', borderRadius: '8px',
    transition: 'background-color 120ms',
    flexShrink: 0,
  },
  breadcrumb: { display: 'flex', alignItems: 'center', gap: '6px' },
  breadcrumbItem: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textTertiary, cursor: 'pointer',
  },
  breadcrumbSep: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '12px', color: T.textTertiary,
  },
  breadcrumbCurrent: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textSecondary,
  },

  /* Body */
  body: {
    maxWidth: '1100px', margin: '0 auto',
    padding: '40px 40px 80px',
    display: 'flex', gap: '40px', alignItems: 'flex-start',
  },
  article: {
    flex: 1, minWidth: 0,
    display: 'flex', flexDirection: 'column', gap: '32px',
  },
  sidebar: {
    width: '280px', flexShrink: 0,
    display: 'flex', flexDirection: 'column', gap: '16px',
    position: 'sticky', top: '80px',
  },

  /* Article header */
  articleHeader: {
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  authorRow: { display: 'flex', alignItems: 'center', gap: '12px' },
  avatar: {
    width: '42px', height: '42px', borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond",serif', fontSize: '18px', color: '#fff',
  },
  authorInfo: { display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 },
  authorName: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '14px',
    fontWeight: 600, color: T.textPrimary,
  },
  authorMeta: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textTertiary,
  },
  hotBadge: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.08em', color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.12)', border: `1px solid rgba(196,137,122,0.2)`,
    borderRadius: '999px', padding: '2px 8px',
  },
  followBtn: {
    height: '32px', padding: '0 16px',
    backgroundColor: 'transparent', border: `1px solid ${T.border}`,
    borderRadius: '999px', cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', fontWeight: 500, color: T.textSecondary,
    transition: 'border-color 120ms, color 120ms',
    flexShrink: 0,
  },
  tagRow: { display: 'flex', gap: '6px', flexWrap: 'wrap' },
  tag: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '11px',
    color: T.textTertiary, backgroundColor: T.bgSubtle,
    border: `1px solid ${T.border}`, borderRadius: '999px', padding: '3px 10px',
  },
  skinTag: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '11px',
    color: T.accent, backgroundColor: 'rgba(196,137,122,0.08)',
    border: `1px solid rgba(196,137,122,0.2)`, borderRadius: '999px', padding: '3px 10px',
  },
  title: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '36px', fontWeight: 400, color: T.textPrimary,
    margin: 0, lineHeight: 1.3, letterSpacing: '0.01em',
  },
  metaRow: { display: 'flex', gap: '16px' },
  metaItem: {
    display: 'flex', alignItems: 'center', gap: '5px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textTertiary,
  },

  /* Article content */
  contentArea: {
    backgroundColor: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderRadius: '12px',
    padding: '32px 36px',
    display: 'flex', flexDirection: 'column', gap: '18px',
  },
  contentHeading: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '22px', fontWeight: 400, color: T.textPrimary,
    margin: '8px 0 0', paddingTop: '8px',
    borderTop: `1px solid ${T.border}`,
    letterSpacing: '0.02em',
  },
  contentP: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '15px', color: T.textSecondary, lineHeight: 1.85,
    margin: 0,
  },
  inlineIngredient: {
    display: 'inline',
    background: 'none', border: 'none', padding: '1px 3px',
    fontFamily: 'inherit', fontSize: 'inherit', cursor: 'pointer',
    color: '#4A8A60', fontWeight: 600,
    borderBottom: '1px dashed rgba(123,174,138,0.6)',
    transition: 'color 120ms',
  },

  /* Ingredient bar */
  ingredientBar: {
    backgroundColor: T.bgSurface,
    border: `1px solid ${T.border}`,
    borderRadius: '12px', padding: '20px 24px',
  },
  ingredientBarTitle: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent,
    margin: '0 0 14px',
  },
  ingredientList: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px' },
  ingredientCard: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    padding: '12px 14px', borderRadius: '10px', border: '1px solid',
    cursor: 'pointer', background: 'none', textAlign: 'left',
    transition: 'opacity 150ms',
  },
  ingredientCardTop: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' },
  ingredientCardName: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '15px', fontWeight: 600,
  },
  ingredientSafetyBadge: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    padding: '2px 7px', borderRadius: '999px', border: '1px solid',
    whiteSpace: 'nowrap',
  },
  ingredientCardDesc: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textSecondary, margin: 0, lineHeight: 1.5,
  },
  ingredientCardLink: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', fontWeight: 500,
  },

  /* Product bar */
  productBar: {
    backgroundColor: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: '12px', padding: '20px 24px',
  },
  productBarTitle: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent,
    margin: '0 0 12px',
  },
  productList: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  productChip: {
    display: 'flex', flexDirection: 'column', gap: '2px',
    padding: '8px 14px', borderRadius: '10px',
    border: `1px solid ${T.border}`, backgroundColor: T.bgSubtle,
    cursor: 'pointer', textAlign: 'left',
    transition: 'border-color 120ms',
  },
  productBrand: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.06em', color: T.textTertiary, textTransform: 'uppercase',
  },
  productName: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textPrimary,
  },

  /* Reaction bar */
  reactionBar: {
    backgroundColor: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: '12px', padding: '20px 24px',
  },
  reactionLabel: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    fontWeight: 500, color: T.textSecondary, margin: '0 0 14px',
    textAlign: 'center',
  },
  reactionRow: { display: 'flex', justifyContent: 'center', gap: '8px', flexWrap: 'wrap' },
  reactionBtn: {
    display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
    minWidth: '64px', padding: '10px 12px', borderRadius: '10px',
    border: `1px solid ${T.border}`, backgroundColor: T.bgSubtle,
    cursor: 'pointer', transition: 'all 150ms',
  },
  reactionBtnActive: {
    backgroundColor: 'rgba(196,137,122,0.1)', borderColor: 'rgba(196,137,122,0.4)',
  },
  reactionEmoji: { fontSize: '20px', lineHeight: 1 },
  reactionCount: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '13px', fontWeight: 600,
    color: T.textPrimary, lineHeight: 1,
  },
  reactionName: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '10px',
    color: T.textTertiary,
  },

  /* Action bar */
  actionBar: {
    display: 'flex', gap: '10px', flexWrap: 'wrap',
  },
  actionBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    height: '40px', padding: '0 18px',
    backgroundColor: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: '10px', cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', color: T.textSecondary,
    transition: 'border-color 150ms',
  },
  actionBtnActive: {
    borderColor: T.accentLight, color: T.accent,
    backgroundColor: 'rgba(196,137,122,0.06)',
  },
  extendAskBtn: {
    display: 'flex', alignItems: 'center', gap: '7px',
    height: '40px', padding: '0 20px',
    backgroundColor: T.accent, border: 'none',
    borderRadius: '10px', cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', fontWeight: 500, color: '#fff',
    marginLeft: 'auto',
    transition: 'background-color 150ms',
  },

  /* Comments */
  commentsSection: {
    backgroundColor: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: '12px', padding: '28px 32px',
    display: 'flex', flexDirection: 'column', gap: '24px',
  },
  commentsTitle: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '22px', fontWeight: 400, color: T.textPrimary, margin: 0,
  },
  commentInputWrap: {
    display: 'flex', gap: '12px', alignItems: 'flex-start',
  },
  commentInputAvatar: {
    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
    backgroundColor: T.accent,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond",serif', fontSize: '16px', color: '#fff',
  },
  commentInput: {
    width: '100%', padding: '10px 14px', resize: 'vertical',
    border: `1px solid ${T.border}`, borderRadius: '10px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '14px', color: T.textPrimary, lineHeight: 1.65,
    outline: 'none', transition: 'border-color 150ms, box-shadow 150ms',
    boxSizing: 'border-box', backgroundColor: T.bgBase,
  },
  commentInputFocus: {
    borderColor: T.accent, boxShadow: '0 0 0 3px rgba(196,137,122,0.12)',
  },
  commentCancelBtn: {
    height: '34px', padding: '0 14px',
    background: 'none', border: `1px solid ${T.border}`, borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', color: T.textTertiary, cursor: 'pointer',
  },
  commentSubmitBtn: {
    height: '34px', padding: '0 18px',
    backgroundColor: T.accent, border: 'none', borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', fontWeight: 500, color: '#fff', cursor: 'pointer',
  },
  commentSubmitDisabled: { backgroundColor: T.accentLight, cursor: 'not-allowed' },

  commentList: { display: 'flex', flexDirection: 'column', gap: '20px' },
  commentItem: { display: 'flex', flexDirection: 'column', gap: '10px' },
  commentRow: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  commentAvatar: {
    width: '34px', height: '34px', borderRadius: '50%', flexShrink: 0,
    backgroundColor: T.textTertiary,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond",serif', fontSize: '15px', color: '#fff',
  },
  commentMeta: { display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' },
  commentAuthor: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    fontWeight: 600, color: T.textPrimary,
  },
  commentTime: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },
  commentText: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '14px',
    color: T.textSecondary, margin: 0, lineHeight: 1.7,
  },
  commentActions: { display: 'flex', gap: '12px', marginTop: '6px' },
  commentActionBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', color: T.textTertiary, padding: 0,
    transition: 'color 120ms',
  },

  repliesWrap: {
    marginLeft: '46px',
    paddingLeft: '14px',
    borderLeft: `2px solid ${T.border}`,
    display: 'flex', flexDirection: 'column', gap: '14px',
  },
  replyRow: { display: 'flex', gap: '10px', alignItems: 'flex-start' },
  replyAvatar: { width: '28px', height: '28px', fontSize: '12px' },
  replyInputWrap: {
    marginLeft: '46px', display: 'flex', gap: '10px', alignItems: 'flex-start',
  },
  replyInput: {
    width: '100%', padding: '8px 12px', resize: 'none',
    border: `1px solid ${T.border}`, borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', color: T.textPrimary, lineHeight: 1.6,
    outline: 'none', boxSizing: 'border-box', backgroundColor: T.bgBase,
  },

  /* Sidebar cards */
  sideCard: {
    backgroundColor: T.bgSurface, border: `1px solid ${T.border}`,
    borderRadius: '12px', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '12px',
  },
  sideTitle: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.14em', textTransform: 'uppercase', color: T.accent, margin: 0,
  },
  sideAvatar: {
    width: '44px', height: '44px', borderRadius: '50%',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond",serif', fontSize: '20px', color: '#fff', flexShrink: 0,
  },
  sideAuthorName: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '14px',
    fontWeight: 600, color: T.textPrimary, margin: 0,
  },
  sideAuthorDept: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textTertiary, margin: 0,
  },
  sideFollowBtn: {
    height: '36px', borderRadius: '999px',
    border: `1px solid ${T.border}`, backgroundColor: T.bgSubtle,
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px', fontWeight: 500, color: T.textSecondary, cursor: 'pointer',
    transition: 'border-color 150ms',
  },
  sideAuthorStats: { display: 'flex', gap: '0', borderTop: `1px solid ${T.border}`, paddingTop: '12px' },
  sideAuthorStat: {
    flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
  },
  sideAuthorStatNum: {
    fontFamily: '"Cormorant Garamond",serif', fontSize: '22px', fontWeight: 400, color: T.textPrimary, lineHeight: 1,
  },
  sideAuthorStatLabel: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '11px', color: T.textTertiary,
  },

  /* Sidebar ingredient rows */
  sideIngRow: {
    display: 'flex', alignItems: 'center', gap: '8px',
    background: 'none', border: 'none', width: '100%', cursor: 'pointer',
    padding: '6px 8px', borderRadius: '8px', transition: 'background-color 120ms',
    textAlign: 'left',
  },
  sideIngDot: { width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0 },
  sideIngName: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: T.textSecondary, flex: 1,
  },
  sideIngBadge: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 600,
  },
  sideIngMoreBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', color: T.accent, fontWeight: 500,
    textAlign: 'left', padding: '4px 8px',
    transition: 'opacity 120ms',
  },

  /* Sidebar QA rows */
  sideQARow: {
    display: 'flex', flexDirection: 'column', gap: '4px',
    background: 'none', border: 'none', width: '100%', cursor: 'pointer',
    padding: '8px 10px', borderRadius: '8px', textAlign: 'left',
    backgroundColor: T.bgSubtle, transition: 'background-color 120ms',
  },
  sideQAQ: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '12px',
    color: T.textSecondary, lineHeight: 1.5,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  sideQACount: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },
  extendAskSideBtn: {
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
    height: '36px', borderRadius: '8px',
    border: `1px solid ${T.accent}`, backgroundColor: 'rgba(196,137,122,0.06)',
    cursor: 'pointer',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px', fontWeight: 500, color: T.accent,
    transition: 'background-color 150ms',
  },

  /* Related posts */
  sideRelatedPost: {
    display: 'flex', flexDirection: 'column', gap: '6px',
    background: 'none', border: `1px solid ${T.border}`, borderRadius: '10px',
    padding: '10px 12px', cursor: 'pointer', textAlign: 'left',
    transition: 'border-color 150ms',
  },
  sideRelatedAvatar: {
    width: '22px', height: '22px', borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond",serif', fontSize: '10px', color: '#fff',
  },
  sideRelatedAuthor: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '11px',
    color: T.textTertiary,
  },
  sideRelatedTitle: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px',
    color: T.textPrimary, margin: 0, lineHeight: 1.45,
    display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
  },
  sideRelatedStat: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', color: T.textTertiary,
  },
};
