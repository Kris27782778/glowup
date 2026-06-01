import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useSettings } from './hooks/useSettings';
import API_BASE from './config';

const LANG = {
  'zh-TW': {
    back: '返回',
    title: '設定',
    appearance: '外觀',
    themeLabel: '色彩模式',
    themes: { light: '日間', dark: '夜間' },
    language: '語言',
    langLabel: '介面語言',
    langs: { 'zh-TW': '繁體中文', en: 'English' },
    security: '帳號安全',
    changePw: '更改密碼',
    currentPw: '目前密碼',
    newPw: '新密碼',
    confirmPw: '確認新密碼',
    savePw: '儲存新密碼',
    account: '帳號',
    logout: '登出',
    version: '版本',
  },
  en: {
    back: 'Back',
    title: 'Settings',
    appearance: 'Appearance',
    themeLabel: 'Color Mode',
    themes: { light: 'Light', dark: 'Dark' },
    language: 'Language',
    langLabel: 'Interface Language',
    langs: { 'zh-TW': 'Traditional Chinese', en: 'English' },
    security: 'Account Security',
    changePw: 'Change Password',
    currentPw: 'Current Password',
    newPw: 'New Password',
    confirmPw: 'Confirm New Password',
    savePw: 'Save New Password',
    account: 'Account',
    logout: 'Sign Out',
    version: 'Version',
  },
};

function Settings() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const t = LANG[settings.language] || LANG['zh-TW'];

  const [googleBound,      setGoogleBound]      = useState(null);
  const [googleSuccess,    setGoogleSuccess]    = useState(false);
  const [googleNoToken,    setGoogleNoToken]    = useState(false);
  const [googleError,      setGoogleError]      = useState('');
  const [googleEmail,      setGoogleEmail]      = useState(null);
  const [showUnbindModal,  setShowUnbindModal]  = useState(false);

  const [showPwForm, setShowPwForm] = useState(false);
  const [currentPw,  setCurrentPw]  = useState('');
  const [newPw,      setNewPw]      = useState('');
  const [confirmPw,  setConfirmPw]  = useState('');
  const [pwLoading,  setPwLoading]  = useState(false);
  const [pwError,    setPwError]    = useState('');
  const [pwSuccess,  setPwSuccess]  = useState(false);

  // Email verification state (for users who skipped during registration)
  const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
  const needsVerify = user && !user.last_verified_at;
  const [verifySent,    setVerifySent]    = useState(false);
  const [verifyOtp,     setVerifyOtp]     = useState('');
  const [verifyCooldown, setVerifyCooldown] = useState(0);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError,   setVerifyError]   = useState('');
  const [verifyDone,    setVerifyDone]    = useState(false);

  const handleSendVerifyOtp = async () => {
    if (verifyCooldown > 0 || verifyLoading) return;
    setVerifyLoading(true); setVerifyError('');
    try {
      const res  = await fetch(`${API_BASE}/api/auth/send-verification`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setVerifySent(true);
        setVerifyCooldown(60);
        const timer = setInterval(() => {
          setVerifyCooldown(prev => { if (prev <= 1) { clearInterval(timer); return 0; } return prev - 1; });
        }, 1000);
      } else {
        setVerifyError(data.error || '傳送失敗，請稍後再試');
      }
    } catch { setVerifyError('無法連接伺服器'); }
    finally { setVerifyLoading(false); }
  };

  const handleConfirmVerifyOtp = async () => {
    if (!verifyOtp || verifyLoading) return;
    setVerifyLoading(true); setVerifyError('');
    try {
      const res  = await fetch(`${API_BASE}/api/auth/reverify`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: user.student_id, email: user.email, otp: verifyOtp }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = { ...user, last_verified_at: data.user.last_verified_at };
        localStorage.setItem('user', JSON.stringify(updated));
        setVerifyDone(true);
      } else {
        setVerifyError(data.error || '驗證失敗');
      }
    } catch { setVerifyError('無法連接伺服器'); }
    finally { setVerifyLoading(false); }
  };

  // Google OAuth 狀態查詢與綁定成功偵測
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('google') === 'success') {
      setGoogleSuccess(true);
      setGoogleBound(true);
      window.history.replaceState({}, '', '/settings');
      return;
    }
    if (params.get('error') === 'session_lost') {
      setGoogleError('Session 已過期，請重新點擊綁定按鈕');
      window.history.replaceState({}, '', '/settings');
    }
    const token = localStorage.getItem('glowToken');
    if (!token) { setGoogleNoToken(true); setGoogleBound(false); return; }
    fetch(`${API_BASE}/api/auth/google/status`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { setGoogleBound(!!data.bound); if (data.email) setGoogleEmail(data.email); })
      .catch(() => setGoogleBound(false));
  }, []);

  const handleUnbindClick = () => setShowUnbindModal(true);

  const confirmUnbind = async () => {
    const token = localStorage.getItem('glowToken');
    try {
      const res = await fetch(`${API_BASE}/api/auth/google/unbind`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setGoogleBound(false);
        setGoogleSuccess(false);
        setGoogleError('');
      } else {
        const data = await res.json();
        setGoogleError(data.error || '取消綁定失敗，請稍後再試');
      }
    } catch {
      setGoogleError('無法連接伺服器，請稍後再試');
    }
  };

  const handleBindGoogle = async () => {
    const token = localStorage.getItem('glowToken');
    if (!token) { setGoogleError('請重新登入後再綁定 Google 帳號'); return; }
    try {
      const res = await fetch(`${API_BASE}/api/auth/google/bind-init`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        window.location.href = `${API_BASE}/api/auth/google/bind?state=${data.state}`;
      } else {
        setGoogleError(data.error || '綁定初始化失敗，請重新登入後再試');
      }
    } catch {
      setGoogleError('無法連接伺服器，請稍後再試');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const handleChangePw = async () => {
    if (!currentPw || !newPw || !confirmPw) { setPwError('請填寫所有欄位'); return; }
    if (newPw.length < 6) { setPwError('新密碼至少需要 6 個字元'); return; }
    if (newPw !== confirmPw) { setPwError('兩次密碼輸入不一致'); return; }
    const user = (() => { try { return JSON.parse(localStorage.getItem('user')); } catch { return null; } })();
    if (!user?.user_id) { setPwError('請先登入'); return; }
    setPwLoading(true); setPwError(''); setPwSuccess(false);
    try {
      const res  = await fetch(`${API_BASE}/api/auth/password`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.user_id, current_password: currentPw, new_password: newPw }),
      });
      const data = await res.json();
      if (res.ok) {
        setPwSuccess(true);
        setCurrentPw(''); setNewPw(''); setConfirmPw('');
        setTimeout(() => { setPwSuccess(false); setShowPwForm(false); }, 2000);
      } else {
        setPwError(data.error || '更新失敗');
      }
    } catch { setPwError('無法連接伺服器'); }
    finally { setPwLoading(false); }
  };

  return (
    <div style={s.page} className="settings-page">
      <div style={s.container} className="settings-inner">

        {/* Header */}
        <div style={s.header}>
          <button style={s.backBtn} onClick={() => navigate(-1)}>
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M11 14L6 9L11 4" stroke="currentColor" strokeWidth="1.5"
                strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            {t.back}
          </button>
          <h1 style={s.title}>{t.title}</h1>
        </div>

        {/* ── 外觀 ── */}
        <Section label={t.appearance}>
          <RowLabel label={t.themeLabel} />
          <div style={s.segmentGroup}>
            {['light', 'dark'].map(val => (
              <button
                key={val}
                style={{
                  ...s.segmentBtn,
                  ...(settings.theme === val ? s.segmentBtnActive : {}),
                }}
                onClick={() => update('theme', val)}
              >
                <ThemeIcon mode={val} active={settings.theme === val} />
                {t.themes[val]}
              </button>
            ))}
          </div>
        </Section>

        {/* ── 語言 ── */}
        <Section label={t.language}>
          <RowLabel label={t.langLabel} />
          <div style={s.segmentGroup}>
            {['zh-TW', 'en'].map(val => (
              <button
                key={val}
                style={{
                  ...s.segmentBtn,
                  ...(settings.language === val ? s.segmentBtnActive : {}),
                }}
                onClick={() => update('language', val)}
              >
                {t.langs[val]}
              </button>
            ))}
          </div>
        </Section>

        {/* ── 信箱驗證（跳過驗證的使用者） ── */}
        {(needsVerify || verifyDone) && (
          <Section label="信箱驗證">
            <div style={s.verifyCard}>
              {verifyDone ? (
                <p style={{ ...s.verifyHint, color: '#5A9E6A' }}>信箱驗證已完成，感謝你！</p>
              ) : (
                <>
                  <p style={s.verifyHint}>
                    你的帳號尚未完成信箱驗證。請驗證 <strong>{user.email}</strong> 以確保帳號安全。
                  </p>
                  {!verifySent ? (
                    <button
                      style={{ ...s.verifyBtn, ...(verifyLoading ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                      onClick={handleSendVerifyOtp}
                      disabled={verifyLoading}
                    >
                      {verifyLoading ? '傳送中…' : '傳送驗證碼'}
                    </button>
                  ) : (
                    <div style={s.otpRow}>
                      <input
                        type="text"
                        inputMode="numeric"
                        maxLength={6}
                        placeholder="輸入 6 位驗證碼"
                        value={verifyOtp}
                        onChange={e => { setVerifyOtp(e.target.value.replace(/\D/g, '')); setVerifyError(''); }}
                        style={s.otpInput}
                      />
                      <button
                        style={{ ...s.verifyBtn, ...(verifyLoading ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                        onClick={handleConfirmVerifyOtp}
                        disabled={verifyLoading}
                      >
                        {verifyLoading ? '驗證中…' : '確認'}
                      </button>
                    </div>
                  )}
                  {verifySent && (
                    <p style={s.resendHint}>
                      {verifyCooldown > 0
                        ? `${verifyCooldown} 秒後可重新傳送`
                        : <button style={s.resendLink} onClick={handleSendVerifyOtp}>重新傳送驗證碼</button>
                      }
                    </p>
                  )}
                  {verifyError && <p style={s.verifyErr}>{verifyError}</p>}
                </>
              )}
            </div>
          </Section>
        )}

        {/* ── Google 帳號綁定 ── */}
        <Section label="Google 帳號">
          <div style={s.verifyCard}>
            {googleBound === null && (
              <p style={s.verifyHint}>載入中…</p>
            )}
            {googleBound === true && (
              <div>
                {googleSuccess && (
                  <p style={{ ...s.verifyHint, color: '#5A9E6A', marginBottom: '8px' }}>綁定成功！</p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <span style={{ color: '#4CAF50', fontSize: '14px', fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>✓ 已綁定</span>
                  <span style={{ fontSize: '14px', color: '#8C6A5A', fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>{googleEmail}</span>
                </div>
                <button onClick={handleUnbindClick} style={{ fontSize: '12px', color: '#B0906A', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline', fontFamily: '"DM Sans","Noto Sans TC",sans-serif', padding: 0 }}>
                  取消綁定
                </button>
              </div>
            )}
            {googleBound === false && (
              googleNoToken
                ? <p style={s.verifyHint}>請重新登入後使用此功能</p>
                : (
                  <button style={s.verifyBtn} onClick={handleBindGoogle}>
                    綁定 Google 帳號
                  </button>
                )
            )}
            {googleError && <p style={s.verifyErr}>{googleError}</p>}
          </div>
        </Section>

        {/* ── 帳號安全 ── */}
        <Section label={t.security}>
          <button
            style={{ ...s.rowToggle, ...(showPwForm ? s.rowToggleActive : {}) }}
            onClick={() => { setShowPwForm(v => !v); setPwError(''); setPwSuccess(false); }}
          >
            <span>{t.changePw}</span>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: showPwForm ? 'rotate(180deg)' : 'none', transition: 'transform 200ms' }}>
              <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {showPwForm && (
            <div style={s.pwForm}>
              {[
                { label: t.currentPw, val: currentPw, set: setCurrentPw, key: 'cur' },
                { label: t.newPw,     val: newPw,      set: setNewPw,     key: 'new' },
                { label: t.confirmPw, val: confirmPw,  set: setConfirmPw, key: 'con' },
              ].map(({ label, val, set, key }) => (
                <div key={key} style={s.pwField}>
                  <label style={s.pwLabel}>{label}</label>
                  <input
                    type="password"
                    value={val}
                    onChange={e => { set(e.target.value); setPwError(''); setPwSuccess(false); }}
                    style={s.pwInput}
                    autoComplete={key === 'cur' ? 'current-password' : 'new-password'}
                  />
                </div>
              ))}

              {pwError   && <p style={s.pwMsg}>{pwError}</p>}
              {pwSuccess  && <p style={{ ...s.pwMsg, color: '#5A9E6A' }}>密碼已更新</p>}

              <button
                style={{ ...s.pwSaveBtn, ...(pwLoading ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
                onClick={handleChangePw}
                disabled={pwLoading}
              >
                {pwLoading ? '更新中…' : t.savePw}
              </button>
            </div>
          )}
        </Section>

        {/* ── 帳號 ── */}
        <Section label={t.account}>
          <button style={s.dangerBtn} onClick={handleLogout}>
            {t.logout}
          </button>
        </Section>

        {/* Footer */}
        <p style={s.footer}>GLŌW · {t.version} 1.0.0</p>

      </div>

      {/* ── 取消綁定確認 Modal（portal 掛到 body，不受祖先 transform 影響）── */}
      {showUnbindModal && createPortal(
        <div style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.35)', zIndex: 9999,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }} onClick={() => setShowUnbindModal(false)}>
          <div style={{
            background: '#FAF7F5', borderRadius: '16px',
            padding: '32px', width: '320px', textAlign: 'center',
            boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          }} onClick={e => e.stopPropagation()}>
            <div style={{ fontSize: '18px', fontWeight: '600', marginBottom: '8px', color: '#3D2B1F', fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>
              取消綁定 Google 帳號
            </div>
            <div style={{ fontSize: '14px', color: '#8C6A5A', marginBottom: '24px', lineHeight: '1.6', fontFamily: '"DM Sans","Noto Sans TC",sans-serif' }}>
              取消後將無法使用 Google 帳號登入，確定要繼續嗎？
            </div>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
              <button onClick={() => setShowUnbindModal(false)} style={{
                padding: '10px 24px', borderRadius: '8px', border: '1px solid #D4B5A0',
                background: 'transparent', color: '#8C6A5A', cursor: 'pointer', fontSize: '14px',
                fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
              }}>
                取消
              </button>
              <button onClick={() => { setShowUnbindModal(false); confirmUnbind(); }} style={{
                padding: '10px 24px', borderRadius: '8px', border: 'none',
                background: '#C4897A', color: '#fff', cursor: 'pointer', fontSize: '14px', fontWeight: '600',
                fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
              }}>
                確定取消綁定
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

function Section({ label, children }) {
  return (
    <div style={s.section}>
      <p style={s.sectionLabel}>{label}</p>
      <div style={s.sectionCard}>
        {children}
      </div>
    </div>
  );
}

function RowLabel({ label }) {
  return <p style={s.rowLabel}>{label}</p>;
}

function ThemeIcon({ mode, active }) {
  const color = active ? '#FFFFFF' : 'var(--text-tertiary)';
  if (mode === 'light') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <circle cx="7" cy="7" r="2.5" stroke={color} strokeWidth="1.3"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06"
        stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
  if (mode === 'dark') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <path d="M12 8.5A5.5 5.5 0 015.5 2a5.5 5.5 0 100 10A5.5 5.5 0 0012 8.5z"
        stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
      <rect x="1" y="2" width="12" height="8" rx="1.5" stroke={color} strokeWidth="1.3"/>
      <path d="M5 12h4M7 10v2" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  );
}

const s = {
  page: {
    paddingTop: '64px',
    minHeight: '100vh',
    backgroundColor: 'var(--bg-base)',
  },
  container: {
    maxWidth: '560px',
    margin: '0 auto',
    padding: '40px 24px 80px',
    display: 'flex',
    flexDirection: 'column',
    gap: '32px',
  },
  header: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  backBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    background: 'none',
    border: 'none',
    padding: '0',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    width: 'fit-content',
  },
  title: {
    fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
    fontSize: '36px',
    fontWeight: 400,
    color: 'var(--text-primary)',
    margin: 0,
    letterSpacing: '0.02em',
  },

  /* Section */
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  sectionLabel: {
    fontFamily: '"DM Sans",sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.14em',
    textTransform: 'uppercase',
    color: 'var(--accent)',
    margin: 0,
  },
  sectionCard: {
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  rowLabel: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '14px',
    color: 'var(--text-primary)',
    margin: 0,
  },

  /* Segment control */
  segmentGroup: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
  },
  segmentBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    height: '36px',
    padding: '0 16px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px',
    fontWeight: 400,
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'all 150ms',
  },
  segmentBtnActive: {
    backgroundColor: 'var(--accent)',
    borderColor: 'var(--accent)',
    color: '#FFFFFF',
    fontWeight: 500,
  },

  /* 改密碼 toggle */
  rowToggle: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    height: '40px',
    backgroundColor: 'transparent',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '0 14px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    transition: 'border-color 150ms',
  },
  rowToggleActive: {
    borderColor: 'var(--accent)',
    color: 'var(--accent)',
  },
  pwForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    paddingTop: '4px',
    borderTop: '1px solid var(--border)',
    marginTop: '4px',
  },
  pwField: { display: 'flex', flexDirection: 'column', gap: '6px' },
  pwLabel: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    color: 'var(--text-secondary)',
  },
  pwInput: {
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '14px',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 150ms',
    width: '100%',
    boxSizing: 'border-box',
  },
  pwMsg: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px',
    color: '#C4614A',
    margin: 0,
  },
  pwSaveBtn: {
    height: '38px',
    backgroundColor: 'var(--bg-inverse)',
    color: 'var(--text-inverse)',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 150ms',
  },

  /* Email verification */
  verifyCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  verifyHint: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px',
    color: 'var(--text-secondary)',
    margin: 0,
    lineHeight: 1.6,
  },
  verifyBtn: {
    height: '38px',
    padding: '0 18px',
    backgroundColor: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    cursor: 'pointer',
    alignSelf: 'flex-start',
  },
  otpRow: {
    display: 'flex',
    gap: '10px',
    alignItems: 'center',
  },
  otpInput: {
    flex: 1,
    height: '40px',
    padding: '0 12px',
    borderRadius: '8px',
    border: '1px solid var(--border)',
    backgroundColor: 'var(--bg-subtle)',
    fontFamily: '"DM Sans",monospace,sans-serif',
    fontSize: '18px',
    letterSpacing: '0.2em',
    color: 'var(--text-primary)',
    outline: 'none',
    boxSizing: 'border-box',
    minWidth: 0,
  },
  resendHint: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px',
    color: 'var(--text-tertiary)',
    margin: 0,
  },
  resendLink: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px',
    color: 'var(--accent)',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
  verifyErr: {
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '12px',
    color: '#C4614A',
    margin: 0,
  },

  unbindBtn: {
    height: '28px',
    padding: '0 12px',
    backgroundColor: 'transparent',
    color: 'var(--text-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: '6px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '11px',
    cursor: 'pointer',
    flexShrink: 0,
  },

  /* Danger */
  dangerBtn: {
    height: '40px',
    backgroundColor: 'transparent',
    color: 'var(--text-tertiary)',
    border: '1px solid var(--border)',
    borderRadius: '8px',
    fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
    fontSize: '13px',
    cursor: 'pointer',
    width: '100%',
  },

  footer: {
    fontFamily: '"DM Sans",sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    letterSpacing: '0.08em',
    textAlign: 'center',
    margin: 0,
  },
};

export default Settings;
