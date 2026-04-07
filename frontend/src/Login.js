import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const T = {
  bgBase:        '#F7F4F2',
  bgSurface:     '#FFFFFF',
  bgSubtle:      '#F0EBE7',
  bgInverse:     '#1C1917',
  accent:        '#C4897A',
  accentLight:   '#E8C4BA',
  accentDark:    '#9E6457',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  textInverse:   '#F7F4F2',
  border:        '#E5DDD9',
};

const FEATURES = [
  { icon: '⚗️', text: '成分透明，每一瓶都清楚' },
  { icon: '💬', text: '輔大同學的真實保養心得' },
  { icon: '🔍', text: '依膚質推薦適合你的產品' },
];

function Login() {
  const [studentId,   setStudentId]   = useState('');
  const [password,    setPassword]    = useState('');
  const [error,       setError]       = useState('');
  const [loading,     setLoading]     = useState(false);
  const [focusField,  setFocusField]  = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!studentId || !password) { setError('請填寫學號與密碼'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || '登入失敗，請確認帳號密碼');
      }
    } catch {
      setError('無法連接伺服器，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...styles.input,
    ...(focusField === field ? styles.inputFocus : {}),
  });

  return (
    <div style={styles.page}>

      {/* ── 左側：品牌主視覺 ── */}
      <div style={styles.brand}>
        {/* 背景裝飾 */}
        <div style={styles.brandBg} />
        <div style={styles.circle1} />
        <div style={styles.circle2} />
        <div style={styles.circle3} />

        <div style={styles.brandInner}>
          {/* Logo */}
          <div style={styles.logoBlock}>
            <p style={styles.logoEyebrow}>FU JEN CATHOLIC UNIVERSITY</p>
            <h1 style={styles.logoText}>GLŌW</h1>
            <div style={styles.logoDivider} />
            <p style={styles.logoTagline}>
              了解你擦在<br />臉上的一切
            </p>
          </div>

          {/* 特色列表 */}
          <div style={styles.featureList}>
            {FEATURES.map((f, i) => (
              <div key={i} style={styles.featureItem}>
                <span style={styles.featureIcon}>{f.icon}</span>
                <span style={styles.featureText}>{f.text}</span>
              </div>
            ))}
          </div>

          {/* 底部標語 */}
          <p style={styles.brandFooter}>清晰就是美 · CLARITY IS BEAUTY</p>
        </div>
      </div>

      {/* ── 右側：登入表單 ── */}
      <div style={styles.form}>
        <div style={styles.formCard}>

          {/* 標題 */}
          <div style={styles.formHeader}>
            <p style={styles.eyebrow}>WELCOME BACK</p>
            <h2 style={styles.formTitle}>登入</h2>
            <p style={styles.formSub}>使用輔大校務帳號登入</p>
          </div>

          {/* 輸入欄 */}
          <div style={styles.fields}>
            <div style={styles.field}>
              <label style={styles.label}>學號</label>
              <input
                style={inputStyle('id')}
                type="text"
                placeholder="請輸入學號"
                value={studentId}
                onChange={e => { setStudentId(e.target.value); setError(''); }}
                onFocus={() => setFocusField('id')}
                onBlur={() => setFocusField(null)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="username"
              />
            </div>
            <div style={styles.field}>
              <label style={styles.label}>密碼</label>
              <input
                style={inputStyle('pw')}
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onFocus={() => setFocusField('pw')}
                onBlur={() => setFocusField(null)}
                onKeyDown={e => e.key === 'Enter' && handleLogin()}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* 錯誤 */}
          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {/* 登入按鈕 */}
          <button
            style={{ ...styles.loginBtn, ...(loading ? styles.loginBtnDisabled : {}) }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '登入中…' : '登入'}
          </button>

          {/* 分隔 */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>初次來訪？</span>
            <div style={styles.dividerLine} />
          </div>

          {/* 註冊 */}
          <Link to="/register" style={styles.registerBtn}>
            建立帳號
          </Link>

          {/* 回首頁 */}
          <Link to="/" style={styles.homeLink}>
            ← 回首頁
          </Link>
        </div>
      </div>

    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: '100vh',
    backgroundColor: T.bgInverse,
  },

  /* ── 品牌左側 ── */
  brand: {
    flex: '0 0 55%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
  },
  brandBg: {
    position: 'absolute',
    inset: 0,
    background: `linear-gradient(145deg, #2A1F1B 0%, ${T.bgInverse} 50%, #0F0D0C 100%)`,
  },
  circle1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.12)',
    top: '-120px',
    right: '-160px',
    pointerEvents: 'none',
  },
  circle2: {
    position: 'absolute',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.08)',
    bottom: '-80px',
    left: '-80px',
    pointerEvents: 'none',
  },
  circle3: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: 'rgba(196,137,122,0.04)',
    top: '40%',
    left: '10%',
    pointerEvents: 'none',
  },
  brandInner: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '72px 64px',
    width: '100%',
  },

  /* Logo 區 */
  logoBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
  },
  logoEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 400,
    letterSpacing: '0.22em',
    color: 'rgba(247,244,242,0.3)',
    margin: '0 0 20px 0',
    textTransform: 'uppercase',
  },
  logoText: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '96px',
    fontWeight: 300,
    letterSpacing: '0.1em',
    color: T.textInverse,
    margin: 0,
    lineHeight: 0.9,
  },
  logoDivider: {
    width: '48px',
    height: '1px',
    backgroundColor: T.accent,
    margin: '28px 0',
  },
  logoTagline: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '32px',
    fontWeight: 300,
    fontStyle: 'italic',
    color: 'rgba(247,244,242,0.7)',
    lineHeight: 1.4,
    margin: 0,
  },

  /* 特色 */
  featureList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  featureItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  featureIcon: {
    fontSize: '18px',
    width: '36px',
    height: '36px',
    borderRadius: '10px',
    backgroundColor: 'rgba(196,137,122,0.12)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'rgba(247,244,242,0.6)',
    lineHeight: 1.5,
  },

  /* 底部標語 */
  brandFooter: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '13px',
    fontWeight: 300,
    letterSpacing: '0.18em',
    color: 'rgba(247,244,242,0.2)',
    margin: 0,
  },

  /* ── 表單右側 ── */
  form: {
    flex: 1,
    backgroundColor: T.bgBase,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 40px',
  },
  formCard: {
    width: '100%',
    maxWidth: '380px',
    display: 'flex',
    flexDirection: 'column',
    gap: '22px',
  },
  formHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '4px',
  },
  eyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.16em',
    color: T.accent,
    margin: 0,
  },
  formTitle: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '40px',
    fontWeight: 400,
    color: T.textPrimary,
    margin: 0,
    lineHeight: 1.15,
  },
  formSub: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.textSecondary,
    margin: 0,
  },

  /* 輸入欄 */
  fields: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  label: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: T.textSecondary,
  },
  input: {
    height: '44px',
    padding: '0 14px',
    borderRadius: '8px',
    border: `1px solid ${T.border}`,
    fontSize: '14px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: T.textPrimary,
    backgroundColor: T.bgSurface,
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
    boxSizing: 'border-box',
    width: '100%',
  },
  inputFocus: {
    borderColor: T.accent,
    boxShadow: '0 0 0 3px rgba(196,137,122,0.15)',
  },
  errorBox: {
    backgroundColor: 'rgba(196,97,74,0.08)',
    border: '1px solid rgba(196,97,74,0.2)',
    borderRadius: '8px',
    padding: '10px 14px',
  },
  errorText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: '#C4614A',
  },
  loginBtn: {
    height: '44px',
    backgroundColor: T.bgInverse,
    color: T.textInverse,
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    letterSpacing: '0.06em',
    transition: 'opacity 150ms',
  },
  loginBtnDisabled: {
    opacity: 0.5,
    cursor: 'not-allowed',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    backgroundColor: T.border,
  },
  dividerText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: T.textTertiary,
    whiteSpace: 'nowrap',
  },
  registerBtn: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '44px',
    border: `1px solid ${T.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: T.textPrimary,
    backgroundColor: 'transparent',
    transition: 'background-color 150ms',
    fontWeight: 400,
  },
  homeLink: {
    textAlign: 'center',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.textTertiary,
    transition: 'color 150ms',
  },
};

export default Login;
