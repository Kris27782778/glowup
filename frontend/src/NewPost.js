import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API_BASE from './config';
import { useLang } from './hooks/useLang';

const SKIN_TYPES  = ['油性肌', '乾性肌', '敏感肌', '混合性肌', '中性肌'];
const DOMAINS     = ['保養品', '化妝品'];
const SUB_CARE    = ['化妝水', '乳液', '面霜', '精華液', '眼霜'];
const SUB_MAKEUP  = ['粉底液', '遮瑕', '氣墊', '防曬'];
const EFFECTS     = ['保濕', '控油', '抗痘', '舒緩修復', '去角質', '抗老', '美白'];

export default function NewPost() {
  const navigate = useNavigate();
  const { t }    = useLang();

  const [title,       setTitle]       = useState('');
  const [content,     setContent]     = useState('');
  const [skinType,    setSkinType]    = useState('');
  const [domain,      setDomain]      = useState('');
  const [subCat,      setSubCat]      = useState('');
  const [effects,     setEffects]     = useState([]);
  const [ingredients, setIngredients] = useState([]);
  const [ingInput,    setIngInput]    = useState('');
  const [errors,      setErrors]      = useState({});
  const [submitting,  setSubmitting]  = useState(false);

  const user = (() => {
    try { return JSON.parse(localStorage.getItem('user') || '{}'); } catch { return {}; }
  })();

  const subOptions = domain === '保養品' ? SUB_CARE : domain === '化妝品' ? SUB_MAKEUP : [];

  const toggleEffect = (e) =>
    setEffects(prev => prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e]);

  const addIngredient = () => {
    const val = ingInput.trim();
    if (!val || ingredients.includes(val)) return;
    setIngredients(prev => [...prev, val]);
    setIngInput('');
  };

  const validate = () => {
    const err = {};
    if (!title || title.length < 6)      err.title   = '標題至少需要 6 個字';
    if (!content || content.length < 30) err.content = '內文至少需要 30 個字';
    if (!skinType) err.skinType = '此欄位為必填';
    if (!domain)   err.domain   = '此欄位為必填';
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const res = await fetch(`${API_BASE}/api/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id:      user.user_id,
          title,
          content,
          skin_type:    skinType,
          domain,
          sub_category: subCat || null,
          effect_tags:  effects,
          ingredients,
        }),
      });
      const data = await res.json();
      if (!res.ok) { setErrors({ submit: data.error || '發表失敗' }); return; }
      navigate('/community');
    } catch {
      setErrors({ submit: '網路錯誤，請稍後再試' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

        {/* Header */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate('/community')}>
            ← {t('返回社群') || '返回社群'}
          </button>
          <h1 style={s.pageTitle}>{t('發表心得') || '發表心得'}</h1>
          <p style={s.pageSub}>{t('分享你的保養心得，讓社群看見你的經驗') || '分享你的保養心得，讓社群看見你的經驗'}</p>
        </div>

        <div style={s.body}>
          {/* 左：表單 */}
          <main style={s.form}>

            {/* 標題 */}
            <div style={s.field}>
              <label style={s.label}>
                {t('文章標題') || '文章標題'}
                <span style={s.required}>必填</span>
                <span style={s.counter}>{title.length}/80</span>
              </label>
              <input
                style={{ ...s.input, ...(errors.title ? s.inputError : {}) }}
                placeholder="例：用了一個月角鯊烷的心得"
                maxLength={80}
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              {errors.title && <p style={s.errorMsg}>{errors.title}</p>}
            </div>

            {/* 內文 */}
            <div style={s.field}>
              <label style={s.label}>
                {t('詳細內容') || '詳細內容'}
                <span style={s.required}>必填</span>
                <span style={s.counter}>{content.length}/2000</span>
              </label>
              <textarea
                style={{ ...s.textarea, ...(errors.content ? s.inputError : {}) }}
                placeholder="分享你的使用心得、膚況、使用步驟等…（至少 30 字）"
                maxLength={2000}
                rows={10}
                value={content}
                onChange={e => setContent(e.target.value)}
              />
              {errors.content && <p style={s.errorMsg}>{errors.content}</p>}
            </div>

            {/* 強制標籤：膚質 */}
            <div style={s.field}>
              <label style={s.label}>
                {t('適合膚質') || '適合膚質'}
                <span style={s.required}>必填</span>
              </label>
              <div style={s.chipGroup}>
                {SKIN_TYPES.map(sk => (
                  <button
                    key={sk}
                    style={{ ...s.chip, ...(skinType === sk ? s.chipActive : {}) }}
                    onClick={() => setSkinType(sk)}
                  >
                    {t(sk) || sk}
                  </button>
                ))}
              </div>
              {errors.skinType && <p style={s.errorMsg}>{errors.skinType}</p>}
            </div>

            {/* 強制標籤：領域 */}
            <div style={s.field}>
              <label style={s.label}>
                {t('產品領域') || '產品領域'}
                <span style={s.required}>必填</span>
              </label>
              <div style={s.chipGroup}>
                {DOMAINS.map(d => (
                  <button
                    key={d}
                    style={{ ...s.chip, ...(domain === d ? s.chipActive : {}) }}
                    onClick={() => { setDomain(d); setSubCat(''); }}
                  >
                    {t(d) || d}
                  </button>
                ))}
              </div>
              {errors.domain && <p style={s.errorMsg}>{errors.domain}</p>}
            </div>

            {/* 選填：品項 */}
            {subOptions.length > 0 && (
              <div style={s.field}>
                <label style={s.label}>
                  {t('品項') || '品項'}
                  <span style={s.optional}>選填</span>
                </label>
                <div style={s.chipGroup}>
                  {subOptions.map(s_ => (
                    <button
                      key={s_}
                      style={{ ...s.chip, ...(subCat === s_ ? s.chipActive : {}) }}
                      onClick={() => setSubCat(prev => prev === s_ ? '' : s_)}
                    >
                      {t(s_) || s_}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 選填：功效 (保養品才顯示) */}
            {domain === '保養品' && (
              <div style={s.field}>
                <label style={s.label}>
                  {t('功效') || '功效'}
                  <span style={s.optional}>選填</span>
                </label>
                <div style={s.chipGroup}>
                  {EFFECTS.map(e => (
                    <button
                      key={e}
                      style={{ ...s.chip, ...(effects.includes(e) ? s.chipActive : {}) }}
                      onClick={() => toggleEffect(e)}
                    >
                      {t(e) || e}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 選填：文中提及成分 */}
            <div style={s.field}>
              <label style={s.label}>
                文中提及成分
                <span style={s.optional}>選填</span>
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  style={{ ...s.input, flex: 1 }}
                  placeholder="輸入成分名稱，例：角鯊烷"
                  value={ingInput}
                  onChange={e => setIngInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addIngredient(); } }}
                />
                <button style={s.addIngBtn} onClick={addIngredient} type="button">
                  新增
                </button>
              </div>
              {ingredients.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
                  {ingredients.map(ing => (
                    <span key={ing} style={s.ingPill}>
                      <span style={s.ingDot} />
                      {ing}
                      <button
                        style={s.ingRemove}
                        onClick={() => setIngredients(prev => prev.filter(x => x !== ing))}
                      >✕</button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* 送出 */}
            {errors.submit && <p style={s.errorMsg}>{errors.submit}</p>}
            <div style={s.actions}>
              <button style={s.cancelBtn} onClick={() => navigate('/community')}>
                {t('取消') || '取消'}
              </button>
              <button
                style={{ ...s.submitBtn, ...(submitting ? s.submitBtnDisabled : {}) }}
                onClick={handleSubmit}
                disabled={submitting}
              >
                {submitting ? '發表中…' : (t('發表') || '發表')}
              </button>
            </div>

          </main>

          {/* 右：預覽 */}
          <aside style={s.preview}>
            <p style={s.previewLabel}>發文規則</p>
            <div style={s.ruleCard}>
              <RuleRow text="標題至少 6 個字" ok={title.length >= 6} />
              <RuleRow text="內文至少 30 個字" ok={content.length >= 30} />
              <RuleRow text="選擇膚質標籤" ok={!!skinType} />
              <RuleRow text="選擇產品領域" ok={!!domain} />
            </div>

            {(title || skinType || domain) && (
              <div style={s.previewCard}>
                <p style={s.previewLabel}>預覽</p>
                {skinType && <span style={s.previewTag}>{skinType}</span>}
                {domain   && <span style={s.previewTag}>{domain}</span>}
                {subCat   && <span style={s.previewTag}>{subCat}</span>}
                {effects.map(e => <span key={e} style={s.previewTag}>{e}</span>)}
                <p style={s.previewTitle}>{title || '（標題預覽）'}</p>
                <p style={s.previewAuthor}>
                  {user.nickname || '使用者'} · {user.department_grade || ''} · 剛剛
                </p>
                {ingredients.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {ingredients.map(ing => (
                      <span key={ing} style={s.ingPill}>
                        <span style={s.ingDot} />{ing}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

function RuleRow({ text, ok }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
      <span style={{ fontSize: '14px', color: ok ? '#7BAE8A' : '#C4897A' }}>
        {ok ? '✓' : '○'}
      </span>
      <span style={{
        fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
        fontSize: '12px',
        color: ok ? 'var(--text-primary)' : 'var(--text-tertiary)',
      }}>
        {text}
      </span>
    </div>
  );
}

const s = {
  page: { paddingTop: '64px', backgroundColor: 'var(--bg-base)', minHeight: '100vh' },
  container: { maxWidth: '1000px', margin: '0 auto', padding: '40px 40px 80px' },

  header: { marginBottom: '32px' },
  backBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '13px',
    color: 'var(--text-tertiary)', marginBottom: '16px', padding: 0,
  },
  pageTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '36px', fontWeight: 300, color: 'var(--text-primary)', margin: '0 0 8px',
  },
  pageSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px', color: 'var(--text-tertiary)', margin: 0,
  },

  body: { display: 'flex', gap: '32px', alignItems: 'flex-start' },
  form: { flex: 1, display: 'flex', flexDirection: 'column', gap: '24px' },

  field: { display: 'flex', flexDirection: 'column', gap: '8px' },
  label: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', fontWeight: 600, letterSpacing: '0.08em',
    color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px',
  },
  required: {
    fontSize: '10px', fontWeight: 500, letterSpacing: '0.06em',
    color: '#fff', backgroundColor: 'var(--accent)',
    borderRadius: '4px', padding: '1px 6px',
  },
  optional: {
    fontSize: '10px', color: 'var(--text-tertiary)',
    border: '1px solid var(--border)', borderRadius: '4px', padding: '1px 6px',
  },
  counter: { marginLeft: 'auto', fontSize: '11px', color: 'var(--text-tertiary)', fontWeight: 400 },

  input: {
    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    border: '1px solid var(--border)', borderRadius: '10px',
    backgroundColor: 'var(--bg-surface)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px',
    color: 'var(--text-primary)', outline: 'none',
  },
  textarea: {
    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    border: '1px solid var(--border)', borderRadius: '10px',
    backgroundColor: 'var(--bg-surface)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px',
    color: 'var(--text-primary)', outline: 'none', resize: 'vertical', lineHeight: 1.7,
  },
  inputError: { borderColor: '#E07060' },
  errorMsg: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '12px',
    color: '#E07060', margin: 0,
  },

  chipGroup: { display: 'flex', flexWrap: 'wrap', gap: '8px' },
  chip: {
    height: '32px', padding: '0 14px', borderRadius: '999px',
    border: '1px solid var(--border)', backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '13px',
    color: 'var(--text-secondary)', cursor: 'pointer', transition: 'all 150ms',
  },
  chipActive: { backgroundColor: 'var(--accent)', borderColor: 'var(--accent)', color: '#fff' },

  actions: { display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '8px' },
  cancelBtn: {
    height: '44px', padding: '0 24px', border: '1px solid var(--border)',
    borderRadius: '10px', backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px',
    color: 'var(--text-secondary)', cursor: 'pointer',
  },
  submitBtn: {
    height: '44px', padding: '0 32px', border: 'none',
    borderRadius: '10px', backgroundColor: 'var(--accent)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '14px',
    fontWeight: 500, color: '#fff', cursor: 'pointer',
  },
  submitBtnDisabled: { opacity: 0.6, cursor: 'not-allowed' },

  preview: {
    width: '240px', flexShrink: 0, position: 'sticky', top: '80px',
    display: 'flex', flexDirection: 'column', gap: '16px',
  },
  previewLabel: {
    fontFamily: '"DM Sans", sans-serif', fontSize: '10px', fontWeight: 600,
    letterSpacing: '0.14em', color: 'var(--accent)', margin: '0 0 12px', textTransform: 'uppercase',
  },
  ruleCard: {
    backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '16px',
  },
  previewCard: {
    backgroundColor: 'var(--bg-surface)', border: '1px solid var(--border)',
    borderRadius: '12px', padding: '16px',
    display: 'flex', flexDirection: 'column', gap: '6px',
  },
  previewTag: {
    display: 'inline-block', marginRight: '6px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '11px',
    color: 'var(--text-tertiary)', backgroundColor: 'var(--bg-subtle)',
    border: '1px solid var(--border)', borderRadius: '999px', padding: '2px 8px',
  },
  previewTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '18px', fontWeight: 400, color: 'var(--text-primary)', margin: '4px 0 0',
  },
  previewAuthor: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px', color: 'var(--text-tertiary)', margin: 0,
  },

  addIngBtn: {
    height: '44px', padding: '0 16px', border: '1px solid var(--border)',
    borderRadius: '10px', backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif', fontSize: '13px',
    color: 'var(--text-secondary)', cursor: 'pointer', whiteSpace: 'nowrap',
  },
  ingPill: {
    display: 'inline-flex', alignItems: 'center', gap: '5px',
    height: '26px', padding: '0 10px',
    backgroundColor: 'rgba(123,174,138,0.1)',
    border: '1px solid rgba(123,174,138,0.28)',
    borderRadius: '999px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px', color: '#4A8A60',
  },
  ingDot: {
    width: '5px', height: '5px', borderRadius: '50%',
    backgroundColor: '#7BAE8A', flexShrink: 0,
  },
  ingRemove: {
    background: 'none', border: 'none', cursor: 'pointer',
    fontSize: '10px', color: '#4A8A60', padding: '0 0 0 2px', lineHeight: 1,
  },
};