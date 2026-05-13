import { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API_BASE from './config';
import { useLang } from './hooks/useLang';

function timeAgo(dateStr) {
  const diff = (Date.now() - new Date(dateStr)) / 1000;
  if (diff < 60)   return '剛剛';
  if (diff < 3600) return `${Math.floor(diff / 60)} 分鐘前`;
  if (diff < 86400)return `${Math.floor(diff / 3600)} 小時前`;
  return `${Math.floor(diff / 86400)} 天前`;
}

function avatarColor(str = '') {
  const colors = ['#C4897A','#9E8A7A','#7A8A9E','#8A9E7A','#A08060','#9A7AA0','#7AABA0'];
  let h = 0; for (const c of str) h = (h * 31 + c.charCodeAt(0)) % colors.length;
  return colors[h];
}

export default function PostDetail() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const { t }      = useLang();

  const [post,       setPost]       = useState(null);
  const [comments,   setComments]   = useState([]);
  const [newComment, setNewComment] = useState('');
  const [helpful,    setHelpful]    = useState(false);
  const [helpCount,  setHelpCount]  = useState(0);
  const [bookmarked, setBookmarked] = useState(false);
  const [loading,    setLoading]    = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deleting,   setDeleting]   = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();
  const isOwner = user?.user_id && post && String(post.user_id) === String(user.user_id);

  const fetchPost = useCallback(async () => {
    const [postRes, commentsRes, helpRes, bkmRes] = await Promise.all([
      fetch(`${API_BASE}/api/posts/${id}`),
      fetch(`${API_BASE}/api/posts/${id}/comments`),
      user?.user_id ? fetch(`${API_BASE}/api/posts/${id}/helpful-status?user_id=${user.user_id}`) : Promise.resolve(null),
      user?.user_id ? fetch(`${API_BASE}/api/posts/${id}/bookmark-status?user_id=${user.user_id}`) : Promise.resolve(null),
    ]);
    const postData = await postRes.json();
    if (!postRes.ok) { navigate('/community'); return; }
    setPost(postData);
    setHelpCount(postData.helpful_count || 0);
    const comData = await commentsRes.json();
    setComments(Array.isArray(comData) ? comData : []);
    if (helpRes) {
      const h = await helpRes.json(); setHelpful(h.helpful);
    }
    if (bkmRes) {
      const b = await bkmRes.json(); setBookmarked(b.bookmarked);
    }
    setLoading(false);
    // 進入貼文頁時，更新 lastSeenCommunity，清除 Navbar 紅點
    localStorage.setItem('lastSeenCommunity', new Date().toISOString());
  }, [id, navigate, user?.user_id]);

  useEffect(() => { fetchPost(); }, [fetchPost]);

  const handleHelpful = async () => {
    if (!user?.user_id) { navigate('/login'); return; }
    const res  = await fetch(`${API_BASE}/api/posts/${id}/helpful`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id }),
    });
    const data = await res.json();
    if (res.ok) { setHelpful(data.helpful); setHelpCount(data.helpful_count); }
  };

  const handleBookmark = async () => {
    if (!user?.user_id) { navigate('/login'); return; }
    const res  = await fetch(`${API_BASE}/api/posts/${id}/bookmark`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id }),
    });
    const data = await res.json();
    if (res.ok) setBookmarked(data.bookmarked);
  };

  const handleComment = async () => {
    if (!user?.user_id) { navigate('/login'); return; }
    if (!newComment.trim()) return;
    setSubmitting(true);
    const res = await fetch(`${API_BASE}/api/posts/${id}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id, content: newComment }),
    });
    if (res.ok) {
      const data = await res.json();
      setComments(prev => [...prev, data.comment]);
      setNewComment('');
      setPost(p => p ? { ...p, comment_count: (p.comment_count || 0) + 1 } : p);
    }
    setSubmitting(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('確定要刪除這篇貼文嗎？')) return;
    setDeleting(true);
    const res = await fetch(`${API_BASE}/api/posts/${id}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: user.user_id }),
    });
    if (res.ok) navigate('/community');
    else setDeleting(false);
  };

  if (loading) return <div style={s.page}><div style={s.loading}>載入中…</div></div>;
  if (!post)   return null;

  const authorInitial = (post.users?.nickname || '?')[0];
  const authorColor   = avatarColor(post.users?.nickname || '');

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* 麵包屑 */}
        <button style={s.back} onClick={() => navigate('/community')}>
          ← {t('返回社群') || '返回社群'}
        </button>

        <div style={s.layout}>
          {/* ── 主內容 ── */}
          <article style={s.article}>

            {/* 標籤列 */}
            <div style={s.tagRow}>
              <span style={s.tag}>{post.skin_type}</span>
              <span style={s.tag}>{post.domain}</span>
              {post.sub_category && <span style={s.tag}>{post.sub_category}</span>}
              {(post.effect_tags || []).map(e => (
                <span key={e} style={s.tag}>{e}</span>
              ))}
            </div>

            {/* 標題 */}
            <h1 style={s.title}>{post.title}</h1>

            {/* 作者資訊 */}
            <div style={s.authorRow}>
              <div style={{ ...s.avatar, backgroundColor: authorColor }}>
                {authorInitial}
              </div>
              <div>
                <span style={s.authorName}>{post.users?.nickname || '匿名'}</span>
                <span style={s.authorMeta}> · {post.users?.department_grade || ''} · {timeAgo(post.created_at)}</span>
              </div>
              {isOwner && (
                <button
                  style={s.deleteBtn}
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  {deleting ? '刪除中…' : '刪除貼文'}
                </button>
              )}
            </div>

            {/* 分隔線 */}
            <hr style={s.divider} />

            {/* 正文 */}
            <div style={s.content}>
              {post.content.split('\n').map((line, i) => (
                <p key={i} style={{ margin: '0 0 12px' }}>{line}</p>
              ))}
            </div>

            {/* 互動按鈕列 */}
            <div style={s.actionBar}>
              <button
                style={{ ...s.actionBtn, ...(helpful ? s.actionBtnActive : {}) }}
                onClick={handleHelpful}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill={helpful ? 'currentColor' : 'none'}>
                  <path d="M3 9.5C3 7 5.5 2 8 2s5 5 5 7.5a5 5 0 01-10 0z" stroke="currentColor" strokeWidth="1.3"/>
                </svg>
                有幫助 · {helpCount}
              </button>

              <button
                style={{ ...s.actionBtn, ...(bookmarked ? s.actionBtnBookmark : {}) }}
                onClick={handleBookmark}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill={bookmarked ? 'currentColor' : 'none'}>
                  <path d="M3 2h10v12l-5-3.5L3 14V2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
                </svg>
                {bookmarked ? '已收藏' : '收藏'}
              </button>

              <span style={s.viewCount}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <ellipse cx="7" cy="7" rx="6" ry="4" stroke="var(--text-tertiary)" strokeWidth="1.2"/>
                  <circle cx="7" cy="7" r="2" fill="var(--text-tertiary)"/>
                </svg>
                {post.views} 瀏覽
              </span>
            </div>

            {/* ── 留言區 ── */}
            <div style={s.commentSection}>
              <h2 style={s.sectionTitle}>
                留言討論
                <span style={s.commentCount}>{comments.length}</span>
              </h2>

              {comments.length === 0 ? (
                <p style={s.emptyComment}>還沒有留言，成為第一個回應的人</p>
              ) : (
                <div style={s.commentList}>
                  {comments.map(c => (
                    <div key={c.comment_id} style={s.commentCard}>
                      <div style={{ ...s.commentAvatar, backgroundColor: avatarColor(c.users?.nickname || '') }}>
                        {(c.users?.nickname || '?')[0]}
                      </div>
                      <div style={s.commentBody}>
                        <div style={s.commentMeta}>
                          <span style={s.commentAuthor}>{c.users?.nickname || '匿名'}</span>
                          <span style={s.commentDept}>{c.users?.department_grade || ''}</span>
                          <span style={s.commentTime}>{timeAgo(c.created_at)}</span>
                        </div>
                        <p style={s.commentText}>{c.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* 輸入新留言 */}
              {user?.user_id ? (
                <div style={s.commentInput}>
                  <div style={{ ...s.commentAvatar, backgroundColor: avatarColor(user.nickname || '') }}>
                    {(user.nickname || '?')[0]}
                  </div>
                  <div style={s.commentInputRight}>
                    <textarea
                      style={s.commentTextarea}
                      placeholder="留下你的想法…"
                      rows={3}
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      onKeyDown={e => { if (e.key === 'Enter' && e.ctrlKey) handleComment(); }}
                    />
                    <button
                      style={{ ...s.sendBtn, ...(submitting ? s.sendBtnDisabled : {}) }}
                      onClick={handleComment}
                      disabled={submitting}
                    >
                      {submitting ? '送出中…' : '送出留言'}
                    </button>
                  </div>
                </div>
              ) : (
                <div style={s.loginPrompt}>
                  <button style={s.loginLink} onClick={() => navigate('/login')}>登入</button>
                  &nbsp;後才能留言
                </div>
              )}
            </div>
          </article>

          {/* ── Sidebar ── */}
          <aside style={s.sidebar}>
            <div style={s.sideCard}>
              <p style={s.sideTitle}>貼文資訊</p>
              <InfoRow label="作者" value={post.users?.nickname || '匿名'} />
              <InfoRow label="膚質" value={post.skin_type} />
              <InfoRow label="領域" value={post.domain} />
              {post.sub_category && <InfoRow label="品項" value={post.sub_category} />}
              <InfoRow label="有幫助" value={`${helpCount} 人`} />
              <InfoRow label="留言" value={`${post.comment_count} 則`} />
              <InfoRow label="瀏覽" value={`${post.views} 次`} />
            </div>

            {(post.effect_tags || []).length > 0 && (
              <div style={s.sideCard}>
                <p style={s.sideTitle}>功效標籤</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {post.effect_tags.map(e => (
                    <span key={e} style={s.tag}>{e}</span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--border)' }}>
      <span style={{ fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '12px', color: 'var(--text-tertiary)' }}>{label}</span>
      <span style={{ fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '12px', color: 'var(--text-secondary)', fontWeight: 500 }}>{value}</span>
    </div>
  );
}

const s = {
  page: { paddingTop: '64px', backgroundColor: 'var(--bg-base)', minHeight: '100vh' },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '32px 40px 80px' },
  loading: { textAlign: 'center', padding: '80px 0', color: 'var(--text-tertiary)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px' },
  back: { background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '13px',
    color: 'var(--text-tertiary)', marginBottom: '24px', padding: 0 },

  layout: { display: 'flex', gap: '32px', alignItems: 'flex-start' },
  article: { flex: 1, minWidth: 0 },

  tagRow: { display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' },
  tag: { fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '11px',
    color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)', borderRadius: '999px', padding: '2px 10px' },

  title: { fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '32px', fontWeight: 400, color: 'var(--text-primary)', margin: '0 0 20px', lineHeight: 1.3 },

  authorRow: { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' },
  avatar: { width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center',
    justifyContent: 'center', fontFamily: '"Cormorant Garamond", serif', fontSize: '16px', color: '#fff', flexShrink: 0 },
  authorName: { fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' },
  authorMeta: { fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '12px', color: 'var(--text-tertiary)' },
  deleteBtn: { marginLeft: 'auto', padding: '4px 12px', border: '1px solid #E07060', borderRadius: '8px',
    backgroundColor: 'transparent', color: '#E07060', fontSize: '12px', cursor: 'pointer',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif' },

  divider: { border: 'none', borderTop: '1px solid var(--border)', margin: '0 0 24px' },

  content: { fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '15px',
    color: 'var(--text-secondary)', lineHeight: 1.8, marginBottom: '32px' },

  actionBar: { display: 'flex', alignItems: 'center', gap: '12px',
    padding: '16px 0', borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', marginBottom: '40px' },
  actionBtn: { display: 'flex', alignItems: 'center', gap: '6px', padding: '8px 16px',
    border: '1px solid var(--border)', borderRadius: '999px', backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '13px',
    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 150ms' },
  actionBtnActive: { backgroundColor: 'rgba(196,137,122,0.12)', borderColor: 'var(--accent)', color: 'var(--accent)' },
  actionBtnBookmark: { backgroundColor: 'rgba(100,100,180,0.10)', borderColor: '#8080CC', color: '#6060BB' },
  viewCount: { display: 'flex', alignItems: 'center', gap: '5px', marginLeft: 'auto',
    fontFamily: '"DM Sans", sans-serif', fontSize: '12px', color: 'var(--text-tertiary)' },

  commentSection: {},
  sectionTitle: { fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '16px',
    fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 20px',
    display: 'flex', alignItems: 'center', gap: '8px' },
  commentCount: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '22px', height: '22px', borderRadius: '999px', backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: 'var(--text-tertiary)' },
  emptyComment: { padding: '32px 0', textAlign: 'center',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px', color: 'var(--text-tertiary)' },
  commentList: { display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '24px' },
  commentCard: { display: 'flex', gap: '12px', alignItems: 'flex-start' },
  commentAvatar: { width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif', fontSize: '14px', color: '#fff' },
  commentBody: { flex: 1, backgroundColor: 'var(--bg-subtle)', borderRadius: '12px', padding: '12px 14px' },
  commentMeta: { display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' },
  commentAuthor: { fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' },
  commentDept: { fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '11px', color: 'var(--text-tertiary)' },
  commentTime: { fontFamily: '"DM Sans", sans-serif', fontSize: '11px', color: 'var(--text-tertiary)', marginLeft: 'auto' },
  commentText: { fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px',
    color: 'var(--text-secondary)', margin: 0, lineHeight: 1.65 },

  commentInput: { display: 'flex', gap: '12px', alignItems: 'flex-start', marginTop: '24px' },
  commentInputRight: { flex: 1, display: 'flex', flexDirection: 'column', gap: '8px' },
  commentTextarea: { width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    border: '1px solid var(--border)', borderRadius: '12px', backgroundColor: 'var(--bg-surface)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px',
    color: 'var(--text-primary)', outline: 'none', resize: 'none', lineHeight: 1.7 },
  sendBtn: { alignSelf: 'flex-end', padding: '8px 20px', border: 'none', borderRadius: '8px',
    backgroundColor: 'var(--accent)', color: '#fff', cursor: 'pointer',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '13px', fontWeight: 500 },
  sendBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },

  loginPrompt: { padding: '20px 0', fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', color: 'var(--text-tertiary)', textAlign: 'center' },
  loginLink: { background: 'none', border: 'none', color: 'var(--accent)', cursor: 'pointer',
    fontSize: '14px', fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', padding: 0 },

  sidebar: { width: '220px', flexShrink: 0, position: 'sticky', top: '80px', display: 'flex', flexDirection: 'column', gap: '16px' },
  sideCard: { backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '2px' },
  sideTitle: { fontFamily: '"DM Sans", sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.14em', color: 'var(--accent)', margin: '0 0 10px', textTransform: 'uppercase' },
};