import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const tokens = {
  bgBase: '#F7F4F2',
  bgSurface: '#FFFFFF',
  bgSubtle: '#F0EBE7',
  accent: '#C4897A',
  accentLight: '#E8C4BA',
  accentDark: '#9E6457',
  textPrimary: '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary: '#A89990',
  border: '#E5DDD9',
  borderStrong: '#C4B5AF',
};

function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [focusField, setFocusField] = useState(null);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!studentId || !password) {
      setError('請填寫學號與密碼');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, password }),
      });
      const data = await response.json();
      if (response.ok) {
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleLogin();
  };

  return (
    <div style={styles.page}>
      {/* 左側裝飾區 */}
      <div style={styles.decorPanel}>
        <p style={styles.decorLogo}>GLŌW</p>
        <p style={styles.decorTagline}>輔大美妝交流平台</p>
        <div style={styles.decorCircle1} />
        <div style={styles.decorCircle2} />
      </div>

      {/* 右側表單區 */}
      <div style={styles.formPanel}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <p style={styles.eyebrow}>WELCOME BACK</p>
            <h1 style={styles.title}>登入</h1>
            <p style={styles.subtitle}>使用輔大校務帳號登入</p>
          </div>

          {/* Fields */}
          <div style={styles.fieldGroup}>
            <div style={styles.field}>
              <label style={styles.label}>學號</label>
              <input
                style={{
                  ...styles.input,
                  ...(focusField === 'id' ? styles.inputFocus : {}),
                }}
                type="text"
                placeholder="請輸入學號"
                value={studentId}
                onChange={e => { setStudentId(e.target.value); setError(''); }}
                onFocus={() => setFocusField('id')}
                onBlur={() => setFocusField(null)}
                onKeyDown={handleKeyDown}
                autoComplete="username"
              />
            </div>

            <div style={styles.field}>
              <label style={styles.label}>密碼</label>
              <input
                style={{
                  ...styles.input,
                  ...(focusField === 'pw' ? styles.inputFocus : {}),
                }}
                type="password"
                placeholder="請輸入密碼"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                onFocus={() => setFocusField('pw')}
                onBlur={() => setFocusField(null)}
                onKeyDown={handleKeyDown}
                autoComplete="current-password"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {/* Submit */}
          <button
            style={{ ...styles.btn, ...(loading ? styles.btnDisabled : {}) }}
            onClick={handleLogin}
            disabled={loading}
          >
            {loading ? '登入中…' : '登入'}
          </button>

          {/* Divider */}
          <div style={styles.divider}>
            <div style={styles.dividerLine} />
            <span style={styles.dividerText}>還沒有帳號？</span>
            <div style={styles.dividerLine} />
          </div>

          {/* Register link */}
          <Link to="/register" style={styles.registerLink}>
            立即註冊
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
    backgroundColor: tokens.bgBase,
  },
  /* 左側裝飾 */
  decorPanel: {
    flex: '0 0 30%',
    backgroundColor: tokens.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  decorLogo: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '64px',
    fontWeight: 300,
    letterSpacing: '0.18em',
    color: '#F7F4F2',
    margin: 0,
    position: 'relative',
    zIndex: 1,
  },
  decorTagline: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    letterSpacing: '0.2em',
    color: tokens.textTertiary,
    margin: '16px 0 0 0',
    position: 'relative',
    zIndex: 1,
  },
  decorCircle1: {
    position: 'absolute',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.2)`,
    top: '-80px',
    right: '-120px',
  },
  decorCircle2: {
    position: 'absolute',
    width: '260px',
    height: '260px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.15)`,
    bottom: '-60px',
    left: '-60px',
  },
  /* 右側表單 */
  formPanel: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px 32px',
  },
  card: {
    width: '100%',
    maxWidth: '400px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  cardHeader: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  eyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    color: tokens.accent,
    margin: 0,
  },
  title: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '40px',
    fontWeight: 400,
    color: tokens.textPrimary,
    margin: 0,
    lineHeight: 1.2,
  },
  subtitle: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: tokens.textSecondary,
    margin: 0,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
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
    color: tokens.textSecondary,
  },
  input: {
    height: '44px',
    padding: '0 14px',
    borderRadius: '8px',
    border: `1px solid ${tokens.border}`,
    fontSize: '14px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: tokens.textPrimary,
    backgroundColor: tokens.bgSurface,
    outline: 'none',
    transition: 'border-color 150ms, box-shadow 150ms',
    boxSizing: 'border-box',
    width: '100%',
  },
  inputFocus: {
    borderColor: tokens.accent,
    boxShadow: `0 0 0 3px rgba(196,137,122,0.15)`,
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
  btn: {
    height: '44px',
    backgroundColor: tokens.accent,
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'background-color 150ms, transform 150ms',
    letterSpacing: '0.04em',
  },
  btnDisabled: {
    backgroundColor: tokens.accentLight,
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
    backgroundColor: tokens.border,
  },
  dividerText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: tokens.textTertiary,
    whiteSpace: 'nowrap',
  },
  registerLink: {
    display: 'block',
    textAlign: 'center',
    height: '44px',
    lineHeight: '44px',
    border: `1px solid ${tokens.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: tokens.textPrimary,
    textDecoration: 'none',
    transition: 'background-color 150ms',
  },
};

export default Login;
