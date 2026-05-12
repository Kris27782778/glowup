import { useState, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API_BASE from './config';

const T = {
  bgBase:        '#F7F4F2',
  bgSurface:     '#FFFFFF',
  bgInverse:     '#1C1917',
  accent:        '#C4897A',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  textInverse:   '#F7F4F2',
  border:        '#E5DDD9',
};

const STEP_LABELS = ['輸入帳號', '驗證信箱', '設定新密碼'];

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step,        setStep]        = useState(0);
  const [emailPrefix, setEmailPrefix] = useState('');
  const [otpDigits,   setOtpDigits]   = useState(Array(6).fill(''));
  const [newPw,       setNewPw]       = useState('');
  const [confirmPw,   setConfirmPw]   = useState('');
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState('');
  const [cooldown,    setCooldown]    = useState(0);
  const otpRefs  = useRef([]);
  const timerRef = useRef(null);

  const fullEmail = `${emailPrefix.trim()}@cloud.fju.edu.tw`;

  const startCooldown = () => {
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSendOtp = async () => {
    if (!emailPrefix.trim()) { setError('請輸入帳號'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/api/auth/send-verification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail }),
      });
      const data = await res.json();
      if (res.ok) { setStep(1); startCooldown(); }
      else setError(data.error || '發送失敗，請稍後再試');
    } catch { setError('無法連接伺服器'); }
    finally   { setLoading(false); }
  };

  const handleOtpChange = (val, idx) => {
    const digits = [...otpDigits];
    digits[idx] = val.replace(/\D/, '').slice(-1);
    setOtpDigits(digits);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0)
      otpRefs.current[idx - 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    setOtpDigits(Array(6).fill('').map((_, i) => pasted[i] || ''));
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerifyOtp = async () => {
    const otp = otpDigits.join('');
    if (otp.length < 6) { setError('請輸入完整的 6 位驗證碼'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/api/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, otp }),
      });
      const data = await res.json();
      if (res.ok) setStep(2);
      else setError(data.error || '驗證碼錯誤');
    } catch { setError('無法連接伺服器'); }
    finally   { setLoading(false); }
  };

  const handleReset = async () => {
    if (newPw.length < 6)      { setError('密碼至少需要 6 個字元'); return; }
    if (newPw !== confirmPw)   { setError('兩次密碼輸入不一致'); return; }
    setLoading(true); setError('');
    try {
      const res  = await fetch(`${API_BASE}/api/auth/reset-password`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: fullEmail, new_password: newPw }),
      });
      const data = await res.json();
      if (res.ok) navigate('/login', { state: { resetSuccess: true } });
      else setError(data.error || '重設失敗，請重新嘗試');
    } catch { setError('無法連接伺服器'); }
    finally   { setLoading(false); }
  };

  const STEP_SUBS = [
    '請輸入你的輔大帳號，驗證碼將寄送至學校信箱。',
    `驗證碼已寄至 ${fullEmail}，請輸入 6 位數字。`,
    '請設定你的新密碼（至少 6 個字元）。',
  ];

  const handleAction = step === 0 ? handleSendOtp : step === 1 ? handleVerifyOtp : handleReset;
  const actionLabel  = loading ? '處理中…'
    : step === 0 ? '發送驗證碼'
    : step === 1 ? '驗證並繼續'
    : '確認重設密碼';

  return (
    <div style={st.page} className="auth-layout">

      {/* ── 左側品牌區 ── */}
      <div style={st.brand} className="auth-left">
        <div style={st.brandBg} />
        <div style={st.circle1} />
        <div style={st.circle2} />
        <div style={st.brandInner}>

          <div style={st.logoBlock}>
            <p style={st.logoEyebrow}>FU JEN CATHOLIC UNIVERSITY</p>
            <h1 style={st.logoText}>GLŌW</h1>
            <div style={st.logoDivider} />
            <p style={st.logoTagline}>找回你的帳號<br />重新開始</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={st.stepEyebrow}>重設密碼</p>
            {STEP_LABELS.map((label, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{
                  width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '13px', fontFamily: '"DM Sans",sans-serif',
                  ...(i < step
                    ? { backgroundColor: 'rgba(196,137,122,0.2)', border: '1px solid #C4897A', color: '#C4897A' }
                    : i === step
                    ? { backgroundColor: '#C4897A', border: '1px solid #C4897A', color: '#fff', fontWeight: 500 }
                    : { border: '1px solid rgba(196,137,122,0.3)', color: 'rgba(247,244,242,0.3)' }),
                }}>{i < step ? '✓' : i + 1}</div>
                <span style={{
                  fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '14px',
                  color: i === step ? '#F7F4F2' : 'rgba(247,244,242,0.4)',
                  fontWeight: i === step ? 500 : 400,
                }}>{label}</span>
              </div>
            ))}
          </div>

          <p style={st.brandFooter}>清晰就是美 · CLARITY IS BEAUTY</p>
        </div>
      </div>

      {/* ── 右側表單區 ── */}
      <div style={st.form} className="auth-right">
        <div style={st.card} className="g-scale-in gd-1">

          {/* Header */}
          <div style={st.cardHeader}>
            <p style={st.eyebrow}>STEP {step + 1} / 3</p>
            <h2 style={st.title}>{STEP_LABELS[step]}</h2>
            <p style={st.sub}>{STEP_SUBS[step]}</p>
          </div>

          {/* Step 0: 帳號 */}
          {step === 0 && (
            <div style={st.fields}>
              <div style={st.field}>
                <label style={st.label}>帳號</label>
                <div style={st.emailWrapper}>
                  <input
                    style={st.emailInput}
                    type="text"
                    placeholder="帳號（@ 前方）"
                    value={emailPrefix}
                    onChange={e => { setEmailPrefix(e.target.value); setError(''); }}
                    onKeyDown={e => e.key === 'Enter' && handleSendOtp()}
                    autoComplete="username"
                  />
                  <span style={st.emailSuffix}>@cloud.fju.edu.tw</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1: OTP */}
          {step === 1 && (
            <div>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', padding: '8px 0' }} onPaste={handleOtpPaste}>
                {otpDigits.map((d, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    value={d}
                    onChange={e => handleOtpChange(e.target.value, i)}
                    onKeyDown={e => handleOtpKey(e, i)}
                    onFocus={e => e.target.select()}
                    maxLength={1}
                    inputMode="numeric"
                    style={{
                      width: '52px', height: '60px', textAlign: 'center',
                      fontSize: '24px', fontWeight: 500, color: T.textPrimary,
                      border: `1.5px solid ${d ? T.accent : T.border}`,
                      borderRadius: '10px', outline: 'none', backgroundColor: T.bgSurface,
                      transition: 'border-color 150ms',
                      boxShadow: d ? '0 0 0 3px rgba(196,137,122,0.12)' : 'none',
                    }}
                  />
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '14px' }}>
                <span style={{ fontSize: '13px', color: T.textTertiary, fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>沒收到？</span>
                {cooldown > 0 ? (
                  <span style={{ fontSize: '13px', color: T.textTertiary, fontFamily: '"DM Sans",sans-serif' }}>{cooldown}s 後可重新發送</span>
                ) : (
                  <button onClick={handleSendOtp} disabled={loading} style={{ background: 'none', border: 'none', fontSize: '13px', fontWeight: 500, color: T.accent, cursor: 'pointer', padding: 0, fontFamily: '"DM Sans","Noto Sans TC",sans-serif', textDecoration: 'underline', textUnderlineOffset: '3px' }}>
                    重新發送
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 2: 新密碼 */}
          {step === 2 && (
            <div style={st.fields}>
              <div style={st.field}>
                <label style={st.label}>新密碼</label>
                <input
                  style={st.input}
                  type="password"
                  placeholder="至少 6 個字元"
                  value={newPw}
                  onChange={e => { setNewPw(e.target.value); setError(''); }}
                  autoComplete="new-password"
                />
              </div>
              <div style={st.field}>
                <label style={st.label}>確認新密碼</label>
                <input
                  style={st.input}
                  type="password"
                  placeholder="再次輸入密碼"
                  value={confirmPw}
                  onChange={e => { setConfirmPw(e.target.value); setError(''); }}
                  onKeyDown={e => e.key === 'Enter' && handleReset()}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* 錯誤訊息 */}
          {error && (
            <div style={{ backgroundColor: 'rgba(196,97,74,0.08)', border: '1px solid rgba(196,97,74,0.2)', borderRadius: '8px', padding: '10px 14px' }}>
              <span style={{ fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px', color: '#C4614A' }}>{error}</span>
            </div>
          )}

          {/* 主要按鈕 */}
          <button
            style={{ ...st.btn, ...(loading ? st.btnDisabled : {}) }}
            onClick={handleAction}
            disabled={loading}
          >
            {actionLabel}
          </button>

          <Link to="/login" style={{ textAlign: 'center', fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px', color: T.textTertiary, textDecoration: 'none' }}>
            ← 回到登入
          </Link>

        </div>
      </div>
    </div>
  );
}

const st = {
  page: {
    display: 'flex',
    minHeight: 'calc(100vh - 64px)',
    marginTop: '64px',
    backgroundColor: T.bgInverse,
  },
  brand: {
    flex: '0 0 50%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
  },
  brandBg: {
    position: 'absolute', inset: 0,
    background: 'linear-gradient(145deg, #2A1F1B 0%, #1C1917 50%, #0F0D0C 100%)',
  },
  circle1: {
    position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.12)', top: '-120px', right: '-160px', pointerEvents: 'none',
  },
  circle2: {
    position: 'absolute', width: '380px', height: '380px', borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.08)', bottom: '-80px', left: '-80px', pointerEvents: 'none',
  },
  brandInner: {
    position: 'relative', zIndex: 1,
    display: 'flex', flexDirection: 'column', justifyContent: 'space-between',
    padding: '72px 64px', width: '100%',
  },
  logoBlock: { display: 'flex', flexDirection: 'column' },
  logoEyebrow: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 400,
    letterSpacing: '0.22em', color: 'rgba(247,244,242,0.3)',
    margin: '0 0 20px', textTransform: 'uppercase',
  },
  logoText: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif', fontSize: '96px',
    fontWeight: 300, letterSpacing: '0.1em', color: T.textInverse, margin: 0, lineHeight: 0.9,
  },
  logoDivider: { width: '48px', height: '1px', backgroundColor: T.accent, margin: '28px 0' },
  logoTagline: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif', fontSize: '32px',
    fontWeight: 300, fontStyle: 'italic', color: 'rgba(247,244,242,0.7)', lineHeight: 1.4, margin: 0,
  },
  stepEyebrow: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '10px', fontWeight: 500,
    letterSpacing: '0.18em', color: 'rgba(247,244,242,0.3)', margin: '0 0 4px', textTransform: 'uppercase',
  },
  brandFooter: {
    fontFamily: '"Cormorant Garamond",serif', fontSize: '13px', fontWeight: 300,
    letterSpacing: '0.18em', color: 'rgba(247,244,242,0.2)', margin: 0,
  },
  form: {
    flex: 1, backgroundColor: 'var(--bg-base)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 40px',
  },
  card: {
    width: '100%', maxWidth: '400px',
    display: 'flex', flexDirection: 'column', gap: '24px',
  },
  cardHeader: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '4px' },
  eyebrow: {
    fontFamily: '"DM Sans",sans-serif', fontSize: '11px', fontWeight: 500,
    letterSpacing: '0.16em', color: 'var(--accent)', margin: 0,
  },
  title: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif', fontSize: '40px',
    fontWeight: 400, color: 'var(--text-primary)', margin: 0, lineHeight: 1.15,
  },
  sub: { fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '14px', color: 'var(--text-secondary)', margin: 0 },
  fields: { display: 'flex', flexDirection: 'column', gap: '14px' },
  field: { display: 'flex', flexDirection: 'column', gap: '6px' },
  label: { fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontSize: '13px', fontWeight: 500, color: 'var(--text-secondary)' },
  input: {
    height: '44px', padding: '0 14px', borderRadius: '8px',
    border: '1px solid var(--border)', fontSize: '14px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-surface)', outline: 'none',
    transition: 'border-color 150ms', boxSizing: 'border-box', width: '100%',
  },
  emailWrapper: {
    display: 'flex', alignItems: 'center', height: '44px', borderRadius: '8px',
    border: '1px solid var(--border)', backgroundColor: 'var(--bg-surface)', overflow: 'hidden',
  },
  emailInput: {
    flex: 1, height: '100%', padding: '0 12px', border: 'none', outline: 'none',
    fontSize: '14px', fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    color: 'var(--text-primary)', backgroundColor: 'transparent', minWidth: 0,
  },
  emailSuffix: {
    padding: '0 12px 0 0', fontSize: '14px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    color: 'var(--text-tertiary)', whiteSpace: 'nowrap', userSelect: 'none',
  },
  btn: {
    height: '44px', backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)',
    border: 'none', borderRadius: '8px', fontSize: '15px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif', fontWeight: 500,
    cursor: 'pointer', letterSpacing: '0.06em', transition: 'opacity 150ms',
  },
  btnDisabled: { opacity: 0.5, cursor: 'not-allowed' },
};
