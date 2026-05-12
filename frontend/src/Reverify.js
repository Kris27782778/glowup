import { useState, useRef, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import API_BASE from './config';

const T = {
  bgBase:    '#F7F4F2',
  bgSurface: '#FFFFFF',
  accent:    '#C4897A',
  text:      '#1C1917',
  textSub:   '#78716C',
  border:    '#E7E0DB',
};

export default function Reverify() {
  const navigate  = useNavigate();
  const location  = useLocation();
  const { student_id, email } = location.state || {};

  const [step,       setStep]       = useState('send');   // send | otp | done
  const [otpDigits,  setOtpDigits]  = useState(Array(6).fill(''));
  const [loading,    setLoading]    = useState(false);
  const [error,      setError]      = useState('');
  const [cooldown,   setCooldown]   = useState(0);
  const otpRefs = useRef([]);
  const timerRef = useRef(null);

  // 若直接訪問此頁而沒有 state，導回登入
  useEffect(() => {
    if (!student_id || !email) navigate('/login');
  }, [student_id, email, navigate]);

  if (!student_id || !email) return null;

  const maskedEmail = email.replace(/(.{2})(.*)(@.*)/, (_, a, b, c) => a + '*'.repeat(b.length) + c);

  const startCooldown = () => {
    setCooldown(60);
    timerRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) { clearInterval(timerRef.current); return 0; }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSend = async () => {
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/send-verification`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email }),
      });
      const data = await res.json();
      if (res.ok) {
        setStep('otp');
        startCooldown();
      } else {
        setError(data.error || '發送失敗，請稍後再試');
      }
    } catch {
      setError('無法連接伺服器');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (val, idx) => {
    const digits = [...otpDigits];
    digits[idx] = val.replace(/\D/, '').slice(-1);
    setOtpDigits(digits);
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKey = (e, idx) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    setOtpDigits(Array(6).fill('').map((_, i) => pasted[i] || ''));
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = async () => {
    const otp = otpDigits.join('');
    if (otp.length < 6) { setError('請輸入完整的 6 位驗證碼'); return; }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/auth/reverify`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ student_id, email, otp }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/', { state: { showSplash: true } });
      } else {
        setError(data.error || '驗證失敗');
        setOtpDigits(Array(6).fill(''));
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError('無法連接伺服器');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: T.bgBase, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
      <div style={{ backgroundColor: T.bgSurface, borderRadius: '20px', padding: '48px 40px', width: '100%', maxWidth: '420px', boxShadow: '0 8px 40px rgba(28,25,23,0.08)', display: 'flex', flexDirection: 'column', gap: '24px', fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>

        {/* Header */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <p style={{ margin: 0, fontSize: '10px', fontWeight: 500, letterSpacing: '0.14em', color: T.accent }}>ANNUAL VERIFICATION</p>
          <h1 style={{ margin: 0, fontFamily: '"Cormorant Garamond","Noto Serif TC",serif', fontSize: '28px', fontWeight: 400, color: T.text }}>年度身份驗證</h1>
          <p style={{ margin: 0, fontSize: '14px', color: T.textSub, lineHeight: 1.6 }}>
            {step === 'send'
              ? '為確保帳號安全，每學年需重新驗證輔大信箱一次。'
              : `驗證碼已寄至 ${maskedEmail}，請輸入 6 位數字。`}
          </p>
        </div>

        {step === 'send' && (
          <>
            <div style={{ backgroundColor: '#FBF7F5', border: `1px solid ${T.border}`, borderRadius: '12px', padding: '16px', fontSize: '13px', color: T.textSub, lineHeight: 1.6 }}>
              驗證信將寄送至：<br />
              <strong style={{ color: T.text }}>{maskedEmail}</strong>
            </div>
            {error && <p style={{ margin: 0, fontSize: '13px', color: '#B97070' }}>{error}</p>}
            <button
              onClick={handleSend}
              disabled={loading}
              style={{ padding: '14px', backgroundColor: T.accent, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '發送中…' : '發送驗證碼'}
            </button>
          </>
        )}

        {step === 'otp' && (
          <>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }} onPaste={handleOtpPaste}>
              {otpDigits.map((d, i) => (
                <input
                  key={i}
                  ref={el => (otpRefs.current[i] = el)}
                  value={d}
                  onChange={e => handleOtpChange(e.target.value, i)}
                  onKeyDown={e => handleOtpKey(e, i)}
                  maxLength={1}
                  inputMode="numeric"
                  style={{
                    width: '46px', height: '54px', textAlign: 'center',
                    fontSize: '20px', fontWeight: 600, color: T.text,
                    border: `1.5px solid ${d ? T.accent : T.border}`,
                    borderRadius: '10px', outline: 'none', backgroundColor: T.bgSurface,
                  }}
                />
              ))}
            </div>
            {error && <p style={{ margin: 0, fontSize: '13px', color: '#B97070', textAlign: 'center' }}>{error}</p>}
            <button
              onClick={handleVerify}
              disabled={loading || otpDigits.some(d => !d)}
              style={{ padding: '14px', backgroundColor: T.accent, color: '#fff', border: 'none', borderRadius: '12px', fontSize: '15px', cursor: 'pointer', opacity: (loading || otpDigits.some(d => !d)) ? 0.5 : 1 }}
            >
              {loading ? '驗證中…' : '確認驗證'}
            </button>
            <button
              onClick={cooldown ? undefined : handleSend}
              disabled={!!cooldown}
              style={{ background: 'none', border: 'none', fontSize: '13px', color: cooldown ? T.textSub : T.accent, cursor: cooldown ? 'default' : 'pointer' }}
            >
              {cooldown ? `重新發送（${cooldown}s）` : '重新發送驗證碼'}
            </button>
          </>
        )}

        <button onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', fontSize: '13px', color: T.textSub, cursor: 'pointer' }}>
          ← 回到登入
        </button>
      </div>
    </div>
  );
}
