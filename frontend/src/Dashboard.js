import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from './config';
import { useReveal } from './hooks/useReveal';
import SkinQuiz from './components/SkinQuiz';
import { useLang } from './hooks/useLang';

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
  safe:          '#7BAE8A',
};

const SKIN_LABELS = {
  oily:       { label: '油性肌',       desc: '皮脂分泌旺盛，控油保濕為主' },
  dry:        { label: '乾性肌',       desc: '皮脂不足，加強保濕屏障' },
  combo:      { label: '混合性肌',     desc: 'T 區偏油，整體清爽保濕' },
  combo_dry:  { label: '混合性肌・偏乾', desc: 'T 區微出油，兩頰需加強補水' },
  combo_oily: { label: '混合性肌・偏油', desc: 'T 區大量出油，輕薄質地為主' },
  normal:     { label: '中性肌',       desc: '水油平衡，維持現有保養節奏' },
  sensitive:  { label: '敏感性肌',     desc: '屏障較弱，選擇成分單純配方' },
};

const TAB_KEYS   = ['帖子', '問答', '收藏', '成分筆記'];
const EMPTY_KEYS = [
  { title: '還沒有貼文',       sub: '分享你的保養心得，讓社群看見你的經驗' },
  { title: '還沒有問答記錄',   sub: '向社群提出你的保養疑問' },
  { title: '收藏夾是空的',     sub: '收藏喜歡的貼文、成分與產品' },
  { title: '成分筆記尚未建立', sub: '標記你用過的成分，記錄使用心得' },
];

function Dashboard() {
  const [user, setUser]           = useState(null);
  const [tab,  setTab]            = useState(0);
  const [showQuiz, setShowQuiz]   = useState(false);
  const [showEdit, setShowEdit]   = useState(false);
  const [wishlist,     setWishlist]     = useState([]);
  const [myQuestions,  setMyQuestions]  = useState([]);
  const navigate = useNavigate();
  const { t } = useLang();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) { navigate('/login'); return; }
    const parsed = JSON.parse(stored);
    setUser(parsed);
    fetch(`${API_BASE}/api/wishlist/${parsed.user_id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setWishlist(data); })
      .catch(() => {});
    fetch(`http://localhost:5001/api/questions?user_id=${parsed.user_id}`)
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setMyQuestions(data); })
      .catch(() => {});
  }, [navigate]);

  useReveal();

  const handleQuizComplete = async (skinKey) => {
    const updated = { ...user, skin_type: skinKey };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setShowQuiz(false);
    try {
      await fetch(API_BASE + '/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, skin_type: skinKey }),
      });
    } catch { /* 靜默失敗，localStorage 已先更新 */ }
  };

  const handleProfileSave = async (patch) => {
    const updated = { ...user, ...patch };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
    setShowEdit(false);
    try {
      await fetch(API_BASE + '/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, ...patch }),
      });
    } catch { /* 靜默失敗 */ }
  };

  const handleRemoveFavorite = async (wishlistId, productId) => {
    setWishlist(prev => prev.filter(w => w.wishlist_id !== wishlistId));
    try {
      await fetch(`${API_BASE}/api/wishlist`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, product_id: productId }),
      });
    } catch {
      fetch(`${API_BASE}/api/wishlist/${user.user_id}`)
        .then(r => r.json())
        .then(data => { if (Array.isArray(data)) setWishlist(data); })
        .catch(() => {});
    }
  };

  if (!user) return null;

  const initial  = user.nickname?.[0]?.toUpperCase() || '?';
  const skinInfo = SKIN_LABELS[user.skin_type] || null;
  const skinLabel = skinInfo?.label || user.skin_type || null;

  return (
    <div style={styles.page}>

      {/* ══ 編輯個人資料 Modal ══ */}
      {showEdit && (
        <EditProfileModal
          user={user}
          onSave={handleProfileSave}
          onClose={() => setShowEdit(false)}
          t={t}
        />
      )}

      {/* ══ 膚質測驗 Modal ══ */}
      {showQuiz && (
        <div style={styles.modalOverlay} onClick={() => setShowQuiz(false)}>
          <div style={styles.modalBox} onClick={e => e.stopPropagation()}>
            <button style={styles.modalClose} onClick={() => setShowQuiz(false)}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>
            <SkinQuiz
              onComplete={handleQuizComplete}
              onSkip={() => setShowQuiz(false)}
            />
          </div>
        </div>
      )}

      {/* ══ Cover Hero ══ */}
      <div style={styles.cover}>
        <div style={styles.coverOverlay} />
        {/* 裝飾圓 */}
        <div style={styles.coverDeco1} />
        <div style={styles.coverDeco2} />
      </div>

      {/* ══ 主體：左欄 + 右欄 ══ */}
      <div style={styles.body}>

        {/* ── 左欄：個人資訊 ── */}
        <aside style={styles.sidebar}>

          {/* 頭像 */}
          <div style={styles.avatarWrap} className="g-scale-in gd-1">
            <div style={styles.avatar}>{initial}</div>
          </div>

          {/* 名稱區 */}
          <div style={styles.nameBlock} className="g-fade-up gd-2">
            <h1 style={styles.nickname}>{user.nickname}</h1>
            {skinLabel && (
              <span style={styles.skinBadge}>{skinLabel}</span>
            )}
          </div>

          {/* 基本資訊 */}
          <div style={styles.infoBlock} className="g-fade-up gd-3">
            {user.bio && (
              <p style={styles.bioText}>{user.bio}</p>
            )}
            {user.department_grade && (
              <div style={styles.infoRow}>
                <span style={styles.infoText}>{user.department_grade}</span>
              </div>
            )}
            {user.email && (
              <div style={styles.infoRow}>
                <span style={styles.infoText}>{user.email}</span>
              </div>
            )}
          </div>

          {/* 膚質卡 */}
          {skinInfo ? (
            <div style={styles.skinCard} className="g-reveal delay-1">
              <p style={styles.skinCardEyebrow}>{t('我的膚質')}</p>
              <p style={styles.skinCardTitle}>{t(skinInfo.label)}</p>
              <p style={styles.skinCardDesc}>{t(skinInfo.desc)}</p>
              <button style={styles.skinRetakeBtn} onClick={() => setShowQuiz(true)}>
                {t('重新測驗')}
              </button>
            </div>
          ) : (
            <div style={styles.skinCardEmpty} className="g-reveal delay-1">
              <p style={styles.skinCardEyebrow}>{t('膚質尚未設定')}</p>
              <p style={styles.skinCardEmptyDesc}>{t('完成膚質測驗，獲得個人化推薦')}</p>
              <button style={styles.skinTakeBtn} onClick={() => setShowQuiz(true)}>
                {t('開始測驗')}
              </button>
            </div>
          )}

          {/* 數據列 */}
          <div style={styles.statsCard} className="g-reveal delay-2">
            {[
              { num: '0', label: '貼文' },
              { num: '0', label: '追蹤者' },
              { num: '0', label: '追蹤中' },
            ].map((s, i, arr) => (

              <div key={s.label} style={styles.statItem}>
                <span style={styles.statNum}>{s.num}</span>
                <span style={styles.statLabel}>{t(s.label)}</span>
                {i < arr.length - 1 && <div style={styles.statDivider} />}
              </div>
            ))}
          </div>

          {/* 操作按鈕 */}
          <div style={styles.actions}>
            <button style={styles.editBtn} onClick={() => setShowEdit(true)}>{t('編輯個人資料')}</button>
            <button
              style={styles.settingsBtn}
              onClick={() => navigate('/settings')}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                <circle cx="7" cy="7" r="2" stroke="currentColor" strokeWidth="1.2"/>
                <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06"
                  stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
              {t('設定')}
            </button>
            <button
              style={styles.logoutBtn}
              onClick={() => { localStorage.removeItem('user'); navigate('/'); }}
            >
              {t('登出')}
            </button>
          </div>

        </aside>

        {/* ── 右欄：Tab 內容 ── */}
        <main style={styles.main}>

          {/* Tab 列 */}
          <div style={styles.tabBar}>
            {TAB_KEYS.map((key, i) => (
              <button
                key={key}
                style={{ ...styles.tabBtn, ...(tab === i ? styles.tabBtnActive : {}) }}
                onClick={() => setTab(i)}
              >
                {t(key)}
                {tab === i && <span style={styles.tabLine} />}
              </button>
            ))}
          </div>

          {/* 內容區：key 讓 tab 切換時重新掛載觸發動畫 */}
          <div style={styles.tabContent}>
            <div key={tab} className="g-tab-content">
              {tab === 1 ? (
                myQuestions.length === 0 ? (
                  <EmptyState
                    title={t(EMPTY_KEYS[1].title)}
                    sub={t(EMPTY_KEYS[1].sub)}
                  />
                ) : (
                  <div style={wishlistStyle.grid}>
                    {myQuestions.map(q => (
                      <div key={q.question_id} style={wishlistStyle.card}>
                        <div style={wishlistStyle.cardHeader}>
                          <span style={wishlistStyle.brand}>{new Date(q.created_at).toLocaleDateString('zh-TW')}</span>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <button
                              style={wishlistStyle.deleteBtn}
                              title="刪除問題"
                              onClick={async () => {
                                if (!window.confirm('確定要刪除這個問題嗎？')) return;
                                try {
                                  const res = await fetch(`http://localhost:5001/api/questions/${q.question_id}`, {
                                    method: 'DELETE',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ user_id: user.user_id }),
                                  });
                                  const data = await res.json();
                                  if (res.ok) {
                                    setMyQuestions(prev => prev.filter(x => x.question_id !== q.question_id));
                                  } else {
                                    alert(data.error || '刪除失敗');
                                  }
                                } catch {
                                  alert('刪除失敗，請確認後端是否啟動');
                                }
                              }}
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                        <p style={wishlistStyle.name}>{q.title}</p>
                        <div style={wishlistStyle.tags}>
                          {(q.tags || []).map(tag => (
                            <span key={tag} style={wishlistStyle.tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )
              ) : tab === 2 ? (
                wishlist.length === 0 ? (
                  <EmptyState
                    title={t(EMPTY_KEYS[2].title)}
                    sub={t(EMPTY_KEYS[2].sub)}
                  />
                ) : (
                  <div style={wishlistStyle.grid}>
                    {wishlist.map(w => {
                      const p = w.products;
                      if (!p) return null;
                      return (
                        <div key={w.wishlist_id} style={wishlistStyle.card}>
                          <div style={wishlistStyle.cardHeader}>
                            <span style={wishlistStyle.brand}>{p.brand}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <span style={wishlistStyle.badge}>{p.sub_category}</span>
                              <button
                                onClick={() => handleRemoveFavorite(w.wishlist_id, p.product_id)}
                                title="取消收藏"
                                style={wishlistStyle.heartBtn}
                              >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill={T.accent} stroke={T.accent} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                                </svg>
                              </button>
                            </div>
                          </div>
                          <p style={wishlistStyle.name}>{p.name}</p>
                          {p.product_ingredients?.length > 0 && (
                            <div style={wishlistStyle.tags}>
                              {p.product_ingredients.slice(0, 4).map(pi => (
                                <span key={pi.ingredient_id} style={wishlistStyle.tag}>
                                  {pi.ingredients?.name}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <EmptyState
                  title={t(EMPTY_KEYS[tab].title)}
                  sub={t(EMPTY_KEYS[tab].sub)}
                />
              )}
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

// ── 編輯個人資料 Modal ──────────────────────────────────────
function EditProfileModal({ user, onSave, onClose, t }) {
  const [nickname, setNickname] = useState(user.nickname || '');
  const [bio,      setBio]      = useState(user.bio      || '');
  const [error,    setError]    = useState('');

  const initial = nickname?.[0]?.toUpperCase() || '?';

  const handleSave = () => {
    if (!nickname.trim()) { setError(t('暱稱不能為空')); return; }
    onSave({ nickname: nickname.trim(), bio: bio.trim() });
  };

  return (
    <div style={ep.overlay} onClick={onClose}>
      <div style={ep.box} onClick={e => e.stopPropagation()}>

        {/* 關閉 */}
        <button style={ep.close} onClick={onClose}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Header */}
        <div style={ep.header}>
          <p style={ep.eyebrow}>EDIT PROFILE</p>
          <h2 style={ep.title}>{t('編輯個人資料')}</h2>
        </div>

        {/* 頭像預覽 */}
        <div style={ep.avatarRow}>
          <div style={ep.avatar}>{initial}</div>
          <div style={ep.avatarInfo}>
            <p style={ep.avatarLabel}>{t('個人頭像')}</p>
            <p style={ep.avatarHint}>{t('以暱稱首字母顯示')}</p>
          </div>
        </div>

        {/* 表單 */}
        <div style={ep.form}>

          {/* 暱稱 */}
          <div style={ep.field}>
            <label style={ep.label}>{t('暱稱')}</label>
            <input
              style={{ ...ep.input, ...(error ? ep.inputError : {}) }}
              value={nickname}
              onChange={e => { setNickname(e.target.value); setError(''); }}
              maxLength={20}
              placeholder={t('輸入你的暱稱')}
            />
            {error && <p style={ep.errorMsg}>{error}</p>}
          </div>

          {/* 個人簡介 */}
          <div style={ep.field}>
            <label style={ep.label}>{t('個人簡介')}</label>
            <textarea
              style={ep.textarea}
              value={bio}
              onChange={e => setBio(e.target.value)}
              maxLength={120}
              rows={3}
              placeholder={t('簡短介紹自己（選填）')}
            />
            <p style={ep.charCount}>{bio.length} / 120</p>
          </div>

          {/* 唯讀欄位 */}
          {(user.department_grade || user.email) && (
            <div style={ep.readonlyGroup}>
              {[
                user.department_grade && { label: '系級',    value: user.department_grade },
                user.email            && { label: '電子郵件', value: user.email },
              ].filter(Boolean).map((row, i, arr) => (
                <div
                  key={row.label}
                  style={{
                    ...ep.readonlyField,
                    ...(i < arr.length - 1 ? { borderBottom: '1px solid var(--border)' } : {}),
                  }}
                >
                  <span style={ep.readonlyLabel}>{t(row.label)}</span>
                  <span style={ep.readonlyValue}>{row.value}</span>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* 操作 */}
        <div style={ep.actions}>
          <button style={ep.cancelBtn} onClick={onClose}>{t('取消')}</button>
          <button style={ep.saveBtn} onClick={handleSave}>{t('儲存變更')}</button>
        </div>

      </div>
    </div>
  );
}

const ep = {
  overlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(28,25,23,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  box: {
    position: 'relative',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '480px',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(28,25,23,0.2)',
    display: 'flex',
    flexDirection: 'column',
    gap: '28px',
  },
  close: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  eyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    color: 'var(--accent)',
    margin: 0,
  },
  title: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '28px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
  },
  /* 頭像 */
  avatarRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  avatar: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '28px',
    fontWeight: 400,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  avatarInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  avatarLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--text-primary)',
    margin: 0,
  },
  avatarHint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  /* 表單 */
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: 'var(--text-secondary)',
  },
  input: {
    height: '44px',
    padding: '0 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 150ms',
  },
  inputError: {
    borderColor: '#C0504A',
  },
  textarea: {
    padding: '12px 14px',
    borderRadius: '10px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.6,
    transition: 'border-color 150ms',
  },
  charCount: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    margin: 0,
    textAlign: 'right',
  },
  errorMsg: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: '#C0504A',
    margin: 0,
  },
  /* 唯讀欄位 */
  readonlyGroup: {
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  readonlyField: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    gap: '16px',
  },
  readonlyLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-tertiary)',
    flexShrink: 0,
  },
  readonlyValue: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    textAlign: 'right',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  /* 操作 */
  actions: {
    display: 'flex',
    gap: '10px',
  },
  cancelBtn: {
    flex: 1,
    height: '44px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  saveBtn: {
    flex: 2,
    height: '44px',
    backgroundColor: 'var(--bg-inverse)',
    border: 'none',
    borderRadius: '10px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-inverse)',
    cursor: 'pointer',
  },
};

function EmptyState({ title, sub }) {
  return (
    <div style={emptyStyle.wrap}>
      <p style={emptyStyle.title}>{title}</p>
      <p style={emptyStyle.sub}>{sub}</p>
    </div>
  );
}

const emptyStyle = {
  wrap: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '360px',
    gap: '10px',
    padding: '40px',
  },
  iconWrap: {
    fontSize: '40px',
    lineHeight: 1,
    marginBottom: '8px',
    opacity: 0.5,
  },
  title: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
  },
  sub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'var(--text-tertiary)',
    margin: 0,
    textAlign: 'center',
    maxWidth: '320px',
    lineHeight: 1.6,
  },
};

const wishlistStyle = {
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
    gap: '16px',
    padding: '24px',
  },
  card: {
    backgroundColor: 'var(--bg-subtle)',
    borderRadius: '12px',
    border: '1px solid var(--border)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brand: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.08em',
    color: 'var(--text-tertiary)',
    textTransform: 'uppercase',
  },
  badge: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    color: 'var(--accent)',
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: '1px solid rgba(196,137,122,0.2)',
    borderRadius: '999px',
    padding: '2px 10px',
  },
  name: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '17px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.4,
  },
  tags: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '5px',
    marginTop: '4px',
    paddingTop: '10px',
    borderTop: '1px solid var(--border)',
  },
  tag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '999px',
    padding: '3px 10px',
  },
  heartBtn: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    opacity: 0.85,
  },
  deleteBtn: {
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    border: '1px solid rgba(192,80,74,0.3)',
    backgroundColor: 'rgba(192,80,74,0.06)',
    color: '#C0504A',
    fontSize: '11px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
    flexShrink: 0,
  },
};

const styles = {
  /* ── Modal ── */
  modalOverlay: {
    position: 'fixed',
    inset: 0,
    zIndex: 1000,
    backgroundColor: 'rgba(28,25,23,0.6)',
    backdropFilter: 'blur(4px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px',
  },
  modalBox: {
    position: 'relative',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '20px',
    padding: '40px',
    width: '100%',
    maxWidth: '520px',
    maxHeight: '88vh',
    overflowY: 'auto',
    boxShadow: '0 24px 64px rgba(28,25,23,0.2)',
  },
  modalClose: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 0,
  },

  page: {
    paddingTop: '64px',
    backgroundColor: 'var(--bg-base)',
    minHeight: '100vh',
  },

  /* Cover */
  cover: {
    height: '240px',
    background: `linear-gradient(135deg, #2C2118 0%, #1C1917 50%, #0F0C0A 100%)`,
    position: 'relative',
    overflow: 'hidden',
  },
  coverOverlay: {
    position: 'absolute',
    inset: 0,
    background: 'linear-gradient(to bottom, transparent 30%, rgba(28,25,23,0.6))',
  },
  coverDeco1: {
    position: 'absolute',
    width: '500px',
    height: '500px',
    borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.1)',
    top: '-200px',
    right: '-100px',
    pointerEvents: 'none',
  },
  coverDeco2: {
    position: 'absolute',
    width: '280px',
    height: '280px',
    borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.08)',
    bottom: '-100px',
    left: '20%',
    pointerEvents: 'none',
  },

  /* 主體雙欄 */
  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 40px 64px',
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
  },

  /* 左欄 */
  sidebar: {
    width: '280px',
    flexShrink: 0,
    marginTop: '-72px',
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  avatarWrap: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  avatar: {
    width: '96px',
    height: '96px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
    border: '4px solid var(--bg-surface)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '40px',
    fontWeight: 400,
    color: '#FFFFFF',
    boxShadow: '0 4px 16px rgba(28,25,23,0.12)',
  },
  nameBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    paddingTop: '4px',
  },
  nickname: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '28px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
    lineHeight: 1.2,
  },
  skinBadge: {
    alignSelf: 'flex-start',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--accent)',
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: '1px solid rgba(196,137,122,0.2)',
    padding: '3px 12px',
    borderRadius: '999px',
  },
  infoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  infoIcon: {
    fontSize: '14px',
    flexShrink: 0,
  },
  infoText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.4,
  },
  bioText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    margin: 0,
  },

  /* 膚質卡 */
  skinCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skinCardEmpty: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px dashed var(--border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  skinCardEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    color: 'var(--accent)',
    margin: 0,
    textTransform: 'uppercase',
  },
  skinCardTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '20px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
  },
  skinCardDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--text-secondary)',
    lineHeight: 1.6,
    margin: 0,
  },
  skinCardEmptyDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    lineHeight: 1.6,
    margin: 0,
  },
  skinRetakeBtn: {
    marginTop: '4px',
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'var(--accent)',
    cursor: 'pointer',
    textAlign: 'left',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
  skinTakeBtn: {
    marginTop: '4px',
    height: '34px',
    backgroundColor: 'var(--accent)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '6px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    cursor: 'pointer',
  },

  /* 數據 */
  statsCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    display: 'flex',
    overflow: 'hidden',
  },
  statItem: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 8px',
    position: 'relative',
    gap: '4px',
  },
  statNum: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '28px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    lineHeight: 1,
  },
  statLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.04em',
  },
  statDivider: {
    position: 'absolute',
    right: 0,
    top: '20%',
    height: '60%',
    width: '1px',
    backgroundColor: 'var(--border)',
  },

  /* 操作 */
  actions: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  editBtn: {
    height: '40px',
    backgroundColor: 'var(--bg-inverse)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.04em',
  },
  settingsBtn: {
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    backgroundColor: 'transparent',
    color: 'var(--text-secondary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    cursor: 'pointer',
  },
  logoutBtn: {
    height: '40px',
    backgroundColor: 'transparent',
    color: 'var(--text-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    cursor: 'pointer',
  },

  /* 右欄 */
  main: {
    flex: 1,
    marginTop: '24px',
    minWidth: 0,
  },
  tabBar: {
    display: 'flex',
    borderBottom: '1px solid var(--border)',
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '12px 12px 0 0',
    overflow: 'hidden',
    padding: '0 8px',
  },
  tabBtn: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '14px 20px',
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: 'var(--text-tertiary)',
    cursor: 'pointer',
    transition: 'color 150ms',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    color: 'var(--text-primary)',
    fontWeight: 500,
  },
  tabIcon: {
    fontSize: '14px',
  },
  tabLine: {
    position: 'absolute',
    bottom: '-1px',
    left: '12px',
    right: '12px',
    height: '2px',
    backgroundColor: 'var(--accent)',
    borderRadius: '999px',
  },
  tabContent: {
    backgroundColor: 'var(--bg-surface)',
    borderRadius: '0 0 12px 12px',
    border: '1px solid var(--border)',
    borderTop: 'none',
    minHeight: '400px',
  },
};

export default Dashboard;
