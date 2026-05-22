import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLang } from './hooks/useLang';
import API_BASE from './config';


const ASKABLE_TAGS = ['成分討論', '油性肌', '乾肌', '敏感肌', '混合性肌', '中性', '保濕', '防曬推薦', '抗老', '屏障修護', '去角質', '抗痘'];

const TIPS = [
  { icon: '✦', text: '描述你的膚質與目前使用的產品' },
  { icon: '✦', text: '說明已嘗試的方法與結果' },
  { icon: '✦', text: '具體的成分名稱比商品名更容易獲得解答' },
  { icon: '✦', text: '附上皮膚反應的症狀與持續時間' },
];


/* ─── 主元件 ─── */
export default function AskQuestion() {
  const navigate = useNavigate();
  useLang();

  const currentUser = (() => {
    try { return JSON.parse(localStorage.getItem('user')); } catch { return null; }
  })();

  const [title,       setTitle]       = useState('');
  const [detail,      setDetail]      = useState('');
  const [selTags,     setSelTags]     = useState([]);
  const [anonymous,   setAnonymous]   = useState(false);
  const [errors,      setErrors]      = useState({});
  const [similar,     setSimilar]     = useState([]);
  const [aiLoading,   setAiLoading]   = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const debounceRef = useRef(null);

  /* 輸入變動 → debounce → 後端相似度模型搜尋真實問題資料庫 */
  useEffect(() => {
    clearTimeout(debounceRef.current);
    const cleanTitle = title.trim();
    const cleanDetail = detail.trim();
    if (cleanTitle.length < 4 && cleanDetail.length < 12) { setSimilar([]); setAiLoading(false); return; }

    const controller = new AbortController();
    setAiLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`${API_BASE}/api/questions/similar`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          signal: controller.signal,
          body: JSON.stringify({
            title: cleanTitle,
            detail: cleanDetail,
            tags: selTags,
            limit: 5,
          }),
        });
        const data = await res.json();
        const list = (data?.data ?? []).map(q => ({
          id:      q.question_id,
          title:   q.title,
          excerpt: q.excerpt || q.detail || '',
          tags:    q.tags || [],
          solved:  q.solved,
          views:   q.views || 0,
          answers: q.answer_count ?? 0,
          score:   q.score || 0,
          matchedTerms: q.matched_terms || [],
        }));
        setSimilar(list);
      } catch (err) {
        if (err.name === 'AbortError') return;
        setSimilar([]);
      } finally {
        if (!controller.signal.aborted) setAiLoading(false);
      }
    }, 700);
    return () => {
      controller.abort();
      clearTimeout(debounceRef.current);
    };
  }, [title, detail, selTags]);

  const toggleTag = (tag) => {
    setSelTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : prev.length < 3 ? [...prev, tag] : prev
    );
  };

  const validate = () => {
    const e = {};
    if (!title.trim() || title.trim().length < 6) e.title  = '問題標題至少需要 6 個字';
    if (!detail.trim() || detail.trim().length < 20) e.detail = '詳細說明至少需要 20 個字';
    if (selTags.length === 0) e.tags = '請至少選擇一個標籤';
    return e;
  };

  const handleSubmit = async () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setSubmitted(true);
    try {
      const res = await fetch(`${API_BASE}/api/questions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUser?.user_id || null,
          title: title.trim(),
          detail: detail.trim(),
          tags: selTags,
          is_anonymous: anonymous,
        }),
      });
      const data = await res.json();
      const qid = data.question?.question_id || Date.now();

      const newQuestion = {
        id: qid,
        is_anonymous: anonymous,
        initial: anonymous ? '匿' : (currentUser?.nickname?.[0]?.toUpperCase() || '我'),
        authorColor: '#C4897A',
        author: anonymous ? '匿名用戶' : (currentUser?.nickname || '匿名'),
        dept: anonymous ? '' : (currentUser?.department_grade || ''),
        time: '剛剛',
        tags: selTags,
        title: title.trim(),
        excerpt: detail.trim(),
        views: 0,
        solved: false,
        hot: false,
        aiAnswer: '',
        expert: null,
        community: [],
        _mine: true,
      };
      setTimeout(() => navigate('/qa', { state: { newQuestion } }), 2000);
    } catch (err) {
      console.error('提問失敗', err);
      setSubmitted(false);
      setErrors({ title: '提交失敗，請確認後端伺服器是否啟動' });
    }
  };

  return (
    <div style={s.page} className="askq-page">

      {/* ── Hero ── */}
      <div style={s.hero} className="askq-hero">
        <div style={s.heroDeco1} />
        <div style={s.heroDeco2} />
        <div style={s.heroInner}>
          <button style={s.backBtn} onClick={() => navigate('/qa')}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M9 2L3 7l6 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            返回問答
          </button>
          <p style={s.heroEyebrow}>ASK A QUESTION</p>
          <h1 style={s.heroTitle}>提出問題</h1>
          <p style={s.heroSub}>清楚描述你的疑問，有助於獲得更精準的解答</p>
        </div>
      </div>

      {/* ── 成功畫面 ── */}
      {submitted ? (
        <div style={s.successPage}>
          <div style={s.successCard}>
            <div style={s.successCircle}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="15" stroke="#5A9E7A" strokeWidth="1.5"/>
                <path d="M9 16l5 5 9-9" stroke="#5A9E7A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <h2 style={s.successTitle}>問題已提出！</h2>
            <p style={s.successSub}>GLŌW AI 正在分析你的問題，稍後將通知相關專家協助回答</p>
            <p style={s.successRedirect}>即將返回問答頁面…</p>
          </div>
        </div>
      ) : (
        /* ── 主體 ── */
        <div style={s.body} className="askq-body">

          {/* ── 左側表單 ── */}
          <main style={s.formArea} className="askq-form">

            {/* 問題標題 */}
            <section style={{ ...s.section, borderRadius: '12px 12px 0 0' }}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>問題標題</h2>
                <span style={s.required}>必填</span>
              </div>
              <p style={s.sectionHint}>一句話概括你的疑問，讓其他人一眼看懂問題</p>
              <div style={s.inputWrap}>
                <input
                  style={{ ...s.input, ...(errors.title ? s.inputError : title.length > 0 ? s.inputOk : {}) }}
                  value={title}
                  onChange={e => { setTitle(e.target.value.slice(0, 80)); setErrors(p => ({ ...p, title: '' })); }}
                  placeholder="例如：乳酸和玻尿酸可以同一晚使用嗎？"
                />
                <span style={s.charBadge}>{title.length}/80</span>
              </div>
              {errors.title && <p style={s.errorMsg}>{errors.title}</p>}

              {/* AI 相似偵測狀態 */}
              {title.trim().length >= 4 && (
                <div style={s.aiStatus}>
                  {aiLoading ? (
                    <>
                      <span style={s.aiDot} />
                      <span style={s.aiStatusText}>GLŌW AI 正在搜尋相似問題…</span>
                    </>
                  ) : similar.length > 0 ? (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5.5" stroke="#6B8CBA" strokeWidth="1"/>
                        <path d="M3.5 6l2 2 3-3" stroke="#6B8CBA" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ ...s.aiStatusText, color: '#6B8CBA' }}>
                        找到 {similar.length} 個相似問題，請確認右側是否已有解答
                      </span>
                    </>
                  ) : (
                    <>
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <circle cx="6" cy="6" r="5.5" stroke="#5A9E7A" strokeWidth="1"/>
                        <path d="M3.5 6l2 2 3-3" stroke="#5A9E7A" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <span style={{ ...s.aiStatusText, color: '#5A9E7A' }}>未找到重複問題，可以繼續發問</span>
                    </>
                  )}
                </div>
              )}
            </section>

            {/* 詳細說明 */}
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>詳細說明</h2>
                <span style={s.required}>必填</span>
              </div>
              <p style={s.sectionHint}>說明你的膚質、目前的保養步驟、已嘗試的方法，以及想解決的問題</p>
              <div style={s.inputWrap}>
                <textarea
                  style={{ ...s.textarea, ...(errors.detail ? s.inputError : {}) }}
                  value={detail}
                  onChange={e => { setDetail(e.target.value.slice(0, 600)); setErrors(p => ({ ...p, detail: '' })); }}
                  placeholder={`建議包含：\n• 你的膚質（油性/乾性/混合/敏感）\n• 目前正在使用的產品或成分\n• 嘗試過的方法與結果\n• 具體的皮膚症狀（如：泛紅、出油、乾燥…）`}
                  rows={8}
                />
                <span style={{ ...s.charBadge, bottom: '12px' }}>{detail.length}/600</span>
              </div>
              {errors.detail && <p style={s.errorMsg}>{errors.detail}</p>}
            </section>

            {/* 標籤選擇 */}
            <section style={s.section}>
              <div style={s.sectionHeader}>
                <h2 style={s.sectionTitle}>標籤分類</h2>
                <span style={s.required}>必填，最多 3 個</span>
              </div>
              <p style={s.sectionHint}>選擇相關標籤，有助於對應的專家看到你的問題</p>
              <div style={s.tagGrid}>
                {ASKABLE_TAGS.map(tag => {
                  const active   = selTags.includes(tag);
                  const disabled = !active && selTags.length >= 3;
                  return (
                    <button
                      key={tag}
                      style={{ ...s.tagChip, ...(active ? s.tagChipActive : {}), ...(disabled ? s.tagChipDisabled : {}) }}
                      onClick={() => { if (!disabled) { toggleTag(tag); setErrors(p => ({ ...p, tags: '' })); } }}
                    >
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M2 5l2.5 2.5L8 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                      {tag}
                    </button>
                  );
                })}
              </div>
              {errors.tags && <p style={s.errorMsg}>{errors.tags}</p>}
            </section>

            {/* 匿名選項 */}
            <section style={s.section}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={s.sectionHeader}>
                  {/* 遮罩圖示 */}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
                    <path d="M8 2C5.5 2 3 3.5 2 6c-.4 1-.4 3 0 4 1 2.5 3.5 4 6 4s5-1.5 6-4c.4-1 .4-3 0-4C13 3.5 10.5 2 8 2z"
                      stroke="var(--text-tertiary)" strokeWidth="1.2"/>
                    <circle cx="5.5" cy="7.5" r="1.2" fill="var(--text-tertiary)"/>
                    <circle cx="10.5" cy="7.5" r="1.2" fill="var(--text-tertiary)"/>
                    <path d="M5.5 10.5c.7.8 1.3 1 2.5 1s1.8-.2 2.5-1" stroke="var(--text-tertiary)" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                  <h2 style={s.sectionTitle}>匿名發問</h2>
                </div>
                {/* Toggle 開關 */}
                <button
                  onClick={() => setAnonymous(p => !p)}
                  style={{
                    width: '44px', height: '24px', borderRadius: '12px', border: 'none', cursor: 'pointer',
                    backgroundColor: anonymous ? 'var(--accent)' : 'rgba(255,255,255,0.12)',
                    position: 'relative', transition: 'background 250ms ease', flexShrink: 0,
                  }}
                  aria-label="匿名切換"
                >
                  <span style={{
                    position: 'absolute', top: '3px',
                    left: anonymous ? '23px' : '3px',
                    width: '18px', height: '18px', borderRadius: '50%',
                    backgroundColor: '#fff',
                    transition: 'left 250ms ease',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.35)',
                  }} />
                </button>
              </div>
              <p style={s.sectionHint}>
                {anonymous
                  ? '其他用戶將看不到你的名字，問題將以「匿名用戶」顯示'
                  : '開啟後隱藏你的暱稱與系級，適合敏感或私人的保養問題'}
              </p>
            </section>

            {/* 提交 */}
            <div style={s.formFooter}>
              <button style={s.cancelBtn} onClick={() => navigate('/qa')}>取消</button>
              <button style={s.submitBtn} onClick={handleSubmit}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M1 7h11M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                提出問題
              </button>
            </div>

          </main>

          {/* ── 右側 Sidebar ── */}
          <aside style={s.sidebar} className="askq-sidebar">

            {/* 相似問題面板 */}
            <div style={s.sideCard}>
              <div style={s.sideCardHeader}>
                <div style={s.aiBadge}>
                  <svg width="11" height="11" viewBox="0 0 14 14" fill="none">
                    <path d="M7 1l1.5 3.5L12 6l-3.5 1.5L7 11l-1.5-3.5L2 6l3.5-1.5L7 1z" fill="currentColor"/>
                  </svg>
                  GLŌW AI
                </div>
                <p style={s.sideCardTitle}>相似問題偵測</p>
              </div>

              {title.trim().length < 4 ? (
                <p style={s.sidePlaceholder}>輸入問題標題後，AI 將自動搜尋是否有相似的已解答問題</p>
              ) : aiLoading ? (
                <div style={s.loadingRow}>
                  <div style={s.loadingBar} />
                  <div style={{ ...s.loadingBar, width: '70%', animationDelay: '150ms' }} />
                  <div style={{ ...s.loadingBar, width: '50%', animationDelay: '300ms' }} />
                </div>
              ) : similar.length === 0 ? (
                <div style={s.noSimilar}>
                  <p style={s.noSimilarText}>沒有找到重複問題</p>
                  <p style={s.noSimilarSub}>你的問題是新的，歡迎繼續提問！</p>
                </div>
              ) : (
                <div style={s.similarList}>
                  <p style={s.similarNote}>這些問題可能已有解答，請確認後再發問：</p>
                  {similar.map(q => (
                    <Link
                      key={q.id}
                      to="/qa"
                      state={{ expandId: q.id }}
                      style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                    <div style={s.similarCard}>
                      <div style={s.similarCardTop}>
                        <span style={{ ...s.similarStatus, ...(q.solved ? s.similarSolved : s.similarUnsolved) }}>
                          {q.solved ? '已解決' : '待解決'}
                        </span>
                        <span style={s.similarScore}>{Math.round(q.score * 100)}% 相似</span>
                      </div>
                      <p style={s.similarTitle}>{q.title}</p>
                      <div style={s.similarMeta}>
                        {q.tags.map(tag => (
                          <span key={tag} style={s.similarTag}>{tag}</span>
                        ))}
                        <span style={s.similarAnswers}>{q.answers} 則回答</span>
                      </div>
                      {q.matchedTerms.length > 0 && (
                        <p style={s.similarMatch}>命中：{q.matchedTerms.join('、')}</p>
                      )}
                    </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* 寫作提示 */}
            <div style={s.sideCard}>
              <p style={s.sideCardTitle}>寫作提示</p>
              <div style={s.tipList}>
                {TIPS.map((tip, i) => (
                  <div key={i} style={s.tipRow}>
                    <span style={s.tipIcon}>✦</span>
                    <p style={s.tipText}>{tip.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 回答機制說明 */}
            <div style={s.sideCard}>
              <p style={s.sideCardTitle}>回答層次</p>
              <div style={s.tierList}>
                {[
                  { color: '#6B8CBA', label: 'GLŌW AI', desc: '成分科學分析' },
                  { color: '#5A9E7A', label: '社群回答', desc: '真實使用經驗' },
                ].map(tier => (
                  <div key={tier.label} style={s.tierRow}>
                    <div style={{ ...s.tierDot, backgroundColor: tier.color }} />
                    <div>
                      <p style={s.tierLabel}>{tier.label}</p>
                      <p style={s.tierDesc}>{tier.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </aside>
        </div>
      )}
    </div>
  );
}

/* ─── Styles ─── */
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
    padding: '40px 40px 36px',
    position: 'relative',
    overflow: 'hidden',
  },
  heroDeco1: {
    position: 'absolute', width: '400px', height: '400px', borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.08)', top: '-180px', right: '-80px', pointerEvents: 'none',
  },
  heroDeco2: {
    position: 'absolute', width: '240px', height: '240px', borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.06)', bottom: '-100px', left: '12%', pointerEvents: 'none',
  },
  heroInner: {
    maxWidth: '1100px',
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    position: 'relative',
    zIndex: 1,
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: 'rgba(247,244,242,0.45)',
    cursor: 'pointer',
    padding: '0 0 4px',
    letterSpacing: '0.02em',
    marginBottom: '4px',
  },
  heroEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 500, letterSpacing: '0.18em',
    color: 'var(--accent)', margin: 0,
  },
  heroTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '40px', fontWeight: 300, letterSpacing: '0.04em',
    color: '#F7F4F2', margin: 0,
  },
  heroSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'rgba(247,244,242,0.45)',
    margin: 0, lineHeight: 1.6,
  },

  /* Body */
  body: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '40px 40px 80px',
    display: 'flex',
    gap: '32px',
    alignItems: 'flex-start',
  },

  /* Form */
  formArea: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  section: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderBottom: 'none',
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  sectionTitle: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px', fontWeight: 600,
    color: 'var(--text-primary)', margin: 0,
  },
  required: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', fontWeight: 500,
    color: 'var(--accent)',
    backgroundColor: 'rgba(196,137,122,0.1)',
    border: '1px solid rgba(196,137,122,0.2)',
    borderRadius: '999px',
    padding: '1px 8px',
  },
  sectionHint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'var(--text-tertiary)',
    margin: 0, lineHeight: 1.5,
  },
  inputWrap: {
    position: 'relative',
  },
  input: {
    width: '100%',
    height: '52px',
    padding: '0 48px 0 16px',
    borderRadius: '10px',
    border: '1.5px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '15px', color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 150ms',
    boxSizing: 'border-box',
  },
  inputOk: {
    borderColor: 'rgba(90,158,122,0.4)',
  },
  inputError: {
    borderColor: '#C0504A',
  },
  textarea: {
    width: '100%',
    padding: '14px 16px 40px',
    borderRadius: '10px',
    border: '1.5px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', color: 'var(--text-primary)',
    outline: 'none',
    resize: 'vertical',
    lineHeight: 1.75,
    transition: 'border-color 150ms',
    boxSizing: 'border-box',
    minHeight: '180px',
  },
  charBadge: {
    position: 'absolute',
    bottom: '12px', right: '14px',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
    pointerEvents: 'none',
  },
  errorMsg: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: '#C0504A', margin: 0,
  },
  aiStatus: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    marginTop: '-4px',
  },
  aiDot: {
    width: '6px', height: '6px', borderRadius: '50%',
    backgroundColor: '#6B8CBA',
    display: 'inline-block',
    animation: 'pulse 1s infinite',
  },
  aiStatusText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'var(--text-tertiary)',
  },
  tagGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  tagChip: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    height: '34px',
    padding: '0 14px',
    borderRadius: '999px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-base)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  tagChipActive: {
    backgroundColor: 'rgba(196,137,122,0.1)',
    borderColor: 'rgba(196,137,122,0.35)',
    color: 'var(--accent)',
    fontWeight: 500,
  },
  tagChipDisabled: {
    opacity: 0.3,
    cursor: 'not-allowed',
  },
  formFooter: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderTop: '1px solid var(--border)',
    borderRadius: '0 0 12px 12px',
    padding: '20px 32px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
  },
  cancelBtn: {
    height: '48px',
    padding: '0 24px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '10px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', color: 'var(--text-secondary)',
    cursor: 'pointer',
  },
  submitBtn: {
    height: '48px',
    padding: '0 28px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    backgroundColor: 'var(--bg-inverse)',
    border: 'none',
    borderRadius: '10px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px', fontWeight: 500,
    color: 'var(--text-inverse)',
    cursor: 'pointer',
    letterSpacing: '0.02em',
  },

  /* Sidebar */
  sidebar: {
    width: '300px',
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    position: 'sticky',
    top: '84px',
  },
  sideCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  sideCardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  aiBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '5px',
    alignSelf: 'flex-start',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em',
    color: '#6B8CBA',
    backgroundColor: 'rgba(107,140,186,0.1)',
    border: '1px solid rgba(107,140,186,0.25)',
    borderRadius: '999px',
    padding: '3px 10px',
  },
  sideCardTitle: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', fontWeight: 600,
    color: 'var(--text-primary)', margin: 0,
    letterSpacing: '0.02em',
  },
  sidePlaceholder: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'var(--text-tertiary)',
    lineHeight: 1.6, margin: 0,
  },

  /* Loading skeletons */
  loadingRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  loadingBar: {
    height: '10px',
    width: '85%',
    borderRadius: '999px',
    backgroundColor: 'var(--bg-subtle)',
    animation: 'shimmer 1.2s infinite',
  },

  /* No similar */
  noSimilar: {
    textAlign: 'center',
    padding: '8px 0',
  },
  noSimilarText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', fontWeight: 500,
    color: '#5A9E7A', margin: '0 0 4px',
  },
  noSimilarSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)', margin: 0,
  },

  /* Similar questions */
  similarNote: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)',
    margin: 0, lineHeight: 1.5,
  },
  similarList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  similarCard: {
    backgroundColor: 'var(--bg-base)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '12px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    cursor: 'pointer',
  },
  similarCardTop: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  similarStatus: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '10px', fontWeight: 500,
    borderRadius: '999px', padding: '1px 8px',
  },
  similarSolved: {
    color: '#5A9E7A',
    backgroundColor: 'rgba(90,158,122,0.1)',
    border: '1px solid rgba(90,158,122,0.2)',
  },
  similarUnsolved: {
    color: '#B8902A',
    backgroundColor: 'rgba(196,163,90,0.1)',
    border: '1px solid rgba(196,163,90,0.2)',
  },
  similarViews: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', color: 'var(--text-tertiary)',
  },
  similarScore: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 600,
    color: '#6B8CBA',
  },
  similarTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '14px', fontWeight: 400,
    color: 'var(--text-primary)', margin: 0, lineHeight: 1.4,
  },
  similarMeta: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    flexWrap: 'wrap',
  },
  similarTag: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '10px', color: 'var(--text-tertiary)',
    backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)',
    borderRadius: '999px', padding: '1px 7px',
  },
  similarAnswers: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px', color: 'var(--accent)',
    marginLeft: 'auto',
  },
  similarMatch: {
    margin: '2px 0 0',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '10px',
    color: 'var(--text-tertiary)',
    lineHeight: 1.45,
  },

  /* Tips */
  tipList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  tipRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '8px',
  },
  tipIcon: {
    fontSize: '8px',
    color: 'var(--accent)',
    marginTop: '4px',
    flexShrink: 0,
  },
  tipText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: 'var(--text-secondary)',
    lineHeight: 1.55, margin: 0,
  },

  /* Tier list */
  tierList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  tierRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  tierDot: {
    width: '28px', height: '28px', borderRadius: '50%',
    flexShrink: 0,
  },
  tierLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', fontWeight: 500,
    color: 'var(--text-primary)', margin: 0,
  },
  tierDesc: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)', margin: 0,
  },

  /* Success */
  successPage: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 'calc(100vh - 64px - 120px)',
    padding: '40px',
  },
  successCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '20px',
    padding: '56px 48px',
    maxWidth: '440px',
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '14px',
    textAlign: 'center',
    boxShadow: '0 8px 32px rgba(28,25,23,0.08)',
  },
  successCircle: {
    marginBottom: '8px',
  },
  successTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '28px', fontWeight: 400,
    color: 'var(--text-primary)', margin: 0,
  },
  successSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-secondary)',
    lineHeight: 1.65, margin: 0,
    maxWidth: '320px',
  },
  successRedirect: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '12px', color: 'var(--text-tertiary)',
    margin: '8px 0 0',
  },
};
