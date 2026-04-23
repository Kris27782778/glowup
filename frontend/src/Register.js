import API_BASE from "./config";
import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { COLLEGES, getDepts, getDivisions, getGrades } from './data/departments';
import CustomSelect from './components/Select';
import SkinQuiz from './components/SkinQuiz';
import { useLang } from './hooks/useLang';

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
};

const SKIN_TYPES = ['油肌', '乾肌', '敏感肌', '中性肌', '混合肌'];
const STEP_KEYS = ['基本資料', '帳號設定', '電子郵件驗證', '膚質設定'];

function getPasswordStrength(pw) {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  return score; // 0–5
}

const PW_LEVEL_KEYS = [
  { label: '請輸入密碼', color: tokens.border },
  { label: '非常弱', color: '#E05252' },
  { label: '弱', color: '#E09352' },
  { label: '普通', color: '#E0C652' },
  { label: '強', color: '#7ABF6A' },
  { label: '非常強', color: '#4CAF50' },
];

function Register() {
  const navigate = useNavigate();
  const { t } = useLang();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusField, setFocusField] = useState(null);
  const [success, setSuccess] = useState(false);
  const [registeredInfo, setRegisteredInfo] = useState(null);

  // 電子郵件驗證
  const [otpDigits, setOtpDigits] = useState(Array(6).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);
  const cooldownRef = useRef(null);

  // 進入驗證步驟時啟動倒計時
  useEffect(() => {
    if (step === 2) startCooldown();
    return () => clearInterval(cooldownRef.current);
  }, [step]); // eslint-disable-line react-hooks/exhaustive-deps

  const [form, setForm] = useState({
    student_id: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    email: '',
    skin_type: '',
  });

  // 4 層系級選單
  const [college, setCollege] = useState('');
  const [dept, setDept] = useState('');
  const [division, setDivision] = useState('');
  const [grade, setGrade] = useState('');

  const depts     = getDepts(college);
  const divisions = getDivisions(college, dept);
  const grades    = getGrades(division, dept);

  const handleCollegeChange = (val) => {
    setCollege(val); setDept(''); setDivision(''); setGrade(''); setError('');
  };
  const handleDeptChange = (val) => {
    setDept(val); setDivision(''); setGrade(''); setError('');
  };
  const handleDivisionChange = (val) => {
    setDivision(val); setGrade(''); setError('');
  };

  // 組合 department_grade 字串
  const departmentGrade = [dept, division, grade].filter(Boolean).join(' · ');

  const set = (key) => (e) => {
    setForm(f => ({ ...f, [key]: e.target.value }));
    setError('');
  };

  // ── OTP helpers ──
  const startCooldown = () => {
    clearInterval(cooldownRef.current);
    setResendCooldown(60);
    cooldownRef.current = setInterval(() => {
      setResendCooldown(s => {
        if (s <= 1) { clearInterval(cooldownRef.current); return 0; }
        return s - 1;
      });
    }, 1000);
  };

  const handleOtpChange = (e, idx) => {
    const val = e.target.value.replace(/\D/g, '').slice(-1);
    setOtpDigits(d => {
      const next = [...d];
      next[idx] = val;
      return next;
    });
    setError('');
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  };

  const handleOtpKeyDown = (e, idx) => {
    if (e.key === 'Backspace' && !otpDigits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  };

  const handleOtpPaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    setOtpDigits(Array(6).fill('').map((_, i) => pasted[i] || ''));
    setError('');
    otpRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const fullEmail = `${form.email}@cloud.fju.edu.tw`;

  const sendVerification = async () => {
    const res = await fetch('http://localhost:5001/api/auth/send-verification', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: fullEmail }),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { throw new Error('驗證碼寄送失敗，伺服器回應異常'); }
    if (!res.ok) throw new Error(data.error || '驗證碼寄送失敗');
  };

  const handleResend = async () => {
    setError('');
    setOtpDigits(Array(6).fill(''));
    try {
      await sendVerification();
      startCooldown();
      otpRefs.current[0]?.focus();
    } catch (e) {
      setError(e.message);
    }
  };

  const validateStep = () => {
    if (step === 0) {
      if (!form.nickname.trim()) return '請輸入暱稱';
      if (!college) return '請選擇學院';
      if (!dept) return '請選擇科系';
      if (!division) return '請選擇部別';
      if (!grade) return '請選擇年級';
      if (!form.email.trim()) return '請輸入帳號（@ 前方）';
      if (/[@\s]/.test(form.email)) return '只需輸入 @ 前方的帳號即可';
    }
    if (step === 1) {
      if (form.password.length < 6) return '密碼至少需要 6 個字元';
      if (form.password !== form.passwordConfirm) return '兩次密碼輸入不一致';
    }
    if (step === 2) {
      if (otpDigits.some(d => d === '')) return '請輸入完整的 6 位驗證碼';
    }
    return null;
  };

  const handleNext = async () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');

    // 步驟 1 → 2：寄送驗證碼
    if (step === 1) {
      setLoading(true);
      try {
        await sendVerification();
        setStep(2);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 步驟 2 → 3：驗證 OTP
    if (step === 2) {
      setLoading(true);
      try {
        const otp = otpDigits.join('');
        const res = await fetch('http://localhost:5001/api/auth/verify-otp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: fullEmail, otp }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error || '驗證失敗'); return; }
        setStep(3);
      } catch {
        setError('無法連接伺服器，請稍後再試');
      } finally {
        setLoading(false);
      }
      return;
    }

    setStep(s => s + 1);
  };

  const handleSubmit = async (skinTypeKey) => {
    setLoading(true);
    setError('');
    try {
      const { passwordConfirm, ...rest } = form;
      const payload = {
        ...rest,
        student_id: form.email,
        email: `${form.email}@cloud.fju.edu.tw`,
        department_grade: departmentGrade,
        skin_type: skinTypeKey || '',
      };
      const response = await fetch('http://localhost:5001/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (response.ok) {
        // 自動登入
        const loginRes = await fetch('http://localhost:5001/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ student_id: form.email, password: form.password }),
        });
        const loginData = await loginRes.json();
        if (loginRes.ok) {
          localStorage.setItem('user', JSON.stringify(loginData.user));
          navigate('/', { state: { showSplash: true } });
        } else {
          // 登入失敗時退回登入頁（極少發生）
          navigate('/login');
        }
      } else {
        setError(data.error || '註冊失敗，請稍後再試');
        setStep(1); // 退回帳號頁顯示錯誤
      }
    } catch {
      setError('無法連接伺服器，請稍後再試');
      setStep(1);
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = (field) => ({
    ...styles.input,
    ...(focusField === field ? styles.inputFocus : {}),
  });

  /* ── 成功畫面 ── */
  if (success && registeredInfo) {
    return (
      <div style={styles.page}>
        <div style={styles.decorPanel}>
          <div style={styles.decorCircle1} />
          <div style={styles.decorCircle2} />
          <div style={styles.decorCircle3} />
          <div style={styles.decorInner}>
            <div style={styles.decorLogoBlock}>
              <p style={styles.decorEyebrow}>FU JEN CATHOLIC UNIVERSITY</p>
              <p style={styles.decorLogo}>GLŌW</p>
              <div style={styles.decorDivider} />
              <p style={styles.decorTagline}>
                {t('了解你擦在')}<br />{t('臉上的一切')}
              </p>
            </div>
            <p style={styles.decorFooter}>清晰就是美 · CLARITY IS BEAUTY</p>
          </div>
        </div>
        <div style={styles.formPanel}>
          <div style={styles.card}>
            <div style={successStyles.iconWrap}>
              <div style={successStyles.iconCircle}>✓</div>
            </div>
            <div style={styles.cardHeader}>
              <p style={styles.eyebrow}>REGISTRATION COMPLETE</p>
              <h1 style={styles.title}>{t('註冊成功！')}</h1>
              <p style={styles.subtitle}>{t('歡迎加入 GLŌW，以下是你的帳號資訊')}</p>
            </div>
            <div style={successStyles.infoCard}>
              {[
                { label: '暱稱', value: registeredInfo.nickname },
                { label: '學號', value: registeredInfo.studentId },
                { label: '電子郵件', value: registeredInfo.email },
                { label: '系級', value: registeredInfo.departmentGrade },
                { label: '膚質', value: registeredInfo.skinType },
              ].map(({ label, value }, idx, arr) => (
                <div key={label} style={{
                  ...successStyles.infoRow,
                  ...(idx === arr.length - 1 ? { borderBottom: 'none' } : {}),
                }}>
                  <span style={successStyles.infoLabel}>{t(label)}</span>
                  <span style={successStyles.infoValue}>{value}</span>
                </div>
              ))}
            </div>
            <button style={styles.btn} onClick={() => navigate('/')}>
              {t('進入 GLŌW')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      {/* 左側裝飾區 */}
      <div style={styles.decorPanel}>
        {/* 背景裝飾圓 */}
        <div style={styles.decorCircle1} />
        <div style={styles.decorCircle2} />
        <div style={styles.decorCircle3} />

        <div style={styles.decorInner}>
          {/* Logo 區 */}
          <div style={styles.decorLogoBlock}>
            <p style={styles.decorEyebrow}>FU JEN CATHOLIC UNIVERSITY</p>
            <p style={styles.decorLogo}>GLŌW</p>
            <div style={styles.decorDivider} />
            <p style={styles.decorTagline}>
              了解你擦在<br />臉上的一切
            </p>
          </div>

          {/* 步驟進度 */}
          <div style={styles.stepList}>
            <p style={styles.stepEyebrow}>{t('建立帳號')}</p>
            {STEP_KEYS.map((s, i) => (
              <div key={s} style={styles.stepItem}>
                <div style={{
                  ...styles.stepDot,
                  ...(i === step ? styles.stepDotActive : {}),
                  ...(i < step ? styles.stepDotDone : {}),
                }}>
                  {i < step ? '✓' : i + 1}
                </div>
                <span style={{
                  ...styles.stepLabel,
                  ...(i === step ? styles.stepLabelActive : {}),
                }}>{t(s)}</span>
              </div>
            ))}
          </div>

          {/* 底部標語 */}
          <p style={styles.decorFooter}>清晰就是美 · CLARITY IS BEAUTY</p>
        </div>
      </div>

      {/* 右側表單區 */}
      <div style={styles.formPanel}>
        <div style={styles.card} className="g-scale-in gd-1">
          {/* Header */}
          <div style={styles.cardHeader}>
            <p style={styles.eyebrow}>STEP {step + 1} / {STEP_KEYS.length}</p>
            <h1 style={styles.title}>{t(STEP_KEYS[step])}</h1>
            <p style={styles.subtitle}>
              {step === 0 && t('告訴我們一些關於你的資訊')}
              {step === 1 && t('為你的學號設定登入密碼')}
              {step === 2 && `驗證碼已寄送至 ${form.email}@cloud.fju.edu.tw`}
              {step === 3 && t('回答 5 題，找出你的膚質類型')}
            </p>
          </div>

          {/* Step 0：基本資料 */}
          {step === 0 && (
            <div style={styles.fieldGroup}>
              <div style={styles.field}>
                <label style={styles.label}>{t('暱稱')}</label>
                <input
                  style={inputStyle('nickname')}
                  type="text"
                  placeholder={t('顯示在平台上的名字')}
                  value={form.nickname}
                  onChange={set('nickname')}
                  onFocus={() => setFocusField('nickname')}
                  onBlur={() => setFocusField(null)}
                />
              </div>

              {/* 4 層系級選單 */}
              <div style={styles.field}>
                <label style={styles.label}>{t('學院')}</label>
                <CustomSelect
                  value={college}
                  onChange={handleCollegeChange}
                  options={COLLEGES}
                  placeholder={t('請選擇學院')}
                />
              </div>

              <div style={styles.field}>
                <label style={{ ...styles.label, ...(!college ? styles.labelDisabled : {}) }}>{t('科系')}</label>
                <CustomSelect
                  value={dept}
                  onChange={handleDeptChange}
                  options={depts}
                  placeholder={t('請選擇科系')}
                  disabled={!college}
                />
              </div>

              <div style={styles.twoCol}>
                <div style={styles.field}>
                  <label style={{ ...styles.label, ...(!dept ? styles.labelDisabled : {}) }}>{t('部別')}</label>
                  <CustomSelect
                    value={division}
                    onChange={handleDivisionChange}
                    options={divisions}
                    placeholder={t('部別')}
                    disabled={!dept}
                  />
                </div>

                <div style={styles.field}>
                  <label style={{ ...styles.label, ...(!division ? styles.labelDisabled : {}) }}>{t('年級')}</label>
                  <CustomSelect
                    value={grade}
                    onChange={(val) => { setGrade(val); setError(''); }}
                    options={grades}
                    placeholder={t('年級')}
                    disabled={!division}
                  />
                </div>
              </div>

              {/* 預覽 */}
              {departmentGrade && (
                <div style={styles.previewBox}>
                  <span style={styles.previewLabel}>{t('系級')}</span>
                  <span style={styles.previewValue}>{departmentGrade}</span>
                </div>
              )}

              <div style={styles.field}>
                <label style={styles.label}>Email</label>
                <div style={{
                  ...styles.emailWrapper,
                  ...(focusField === 'email' ? styles.emailWrapperFocus : {}),
                }}>
                  <input
                    style={styles.emailInput}
                    type="text"
                    placeholder={t('帳號（@ 前方）')}
                    value={form.email}
                    onChange={set('email')}
                    onFocus={() => setFocusField('email')}
                    onBlur={() => setFocusField(null)}
                    autoComplete="email"
                  />
                  <span style={styles.emailSuffix}>@cloud.fju.edu.tw</span>
                </div>
              </div>
            </div>
          )}

          {/* Step 1：帳號設定 */}
          {step === 1 && (
            <div style={styles.fieldGroup}>
              <div style={styles.previewBox}>
                <span style={styles.previewLabel}>{t('學號')}</span>
                <span style={styles.previewValue}>{form.email}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>{t('密碼')}</label>
                <input
                  style={inputStyle('pw')}
                  type="password"
                  placeholder="至少 6 個字元"
                  value={form.password}
                  onChange={set('password')}
                  onFocus={() => setFocusField('pw')}
                  onBlur={() => setFocusField(null)}
                  autoComplete="new-password"
                />
                {/* 密碼強度進度條 */}
                {(() => {
                  const score = getPasswordStrength(form.password);
                  const level = PW_LEVEL_KEYS[score];
                  return (
                    <div style={pwStyles.wrap}>
                      <div style={pwStyles.barTrack}>
                        {[1,2,3,4,5].map(i => (
                          <div
                            key={i}
                            style={{
                              ...pwStyles.barSegment,
                              backgroundColor: i <= score ? level.color : tokens.border,
                              transition: 'background-color 250ms',
                            }}
                          />
                        ))}
                      </div>
                      <span style={{ ...pwStyles.levelText, color: score === 0 ? tokens.textTertiary : level.color }}>
                        {t(level.label)}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>{t('確認密碼')}</label>
                <input
                  style={inputStyle('pw2')}
                  type="password"
                  placeholder={t('輸入相同密碼')}
                  value={form.passwordConfirm}
                  onChange={set('passwordConfirm')}
                  onFocus={() => setFocusField('pw2')}
                  onBlur={() => setFocusField(null)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* Step 2：電子郵件驗證 */}
          {step === 2 && (
            <div style={styles.fieldGroup}>
              {/* 說明卡 */}
              <div style={verifyStyles.infoBox}>
                <div style={verifyStyles.infoText}>
                  <p style={verifyStyles.infoTitle}>{t('請查收驗證信件') || '請查收驗證信件'}</p>
                  <p style={verifyStyles.infoEmail}>{form.email}@cloud.fju.edu.tw</p>
                </div>
              </div>

              {/* OTP 輸入格 */}
              <div style={verifyStyles.otpWrap} onPaste={handleOtpPaste}>
                {otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => { otpRefs.current[i] = el; }}
                    style={{
                      ...verifyStyles.otpInput,
                      ...(digit ? verifyStyles.otpInputFilled : {}),
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(e, i)}
                    onKeyDown={e => handleOtpKeyDown(e, i)}
                    onFocus={e => e.target.select()}
                    autoComplete="one-time-code"
                  />
                ))}
              </div>

              {/* 重新發送 */}
              <div style={verifyStyles.resendRow}>
                <span style={verifyStyles.resendHint}>{t('沒有收到信件？') || '沒有收到信件？'}</span>
                {resendCooldown > 0 ? (
                  <span style={verifyStyles.cooldownText}>{resendCooldown}{t('秒後重新發送')}</span>
                ) : (
                  <button style={verifyStyles.resendBtn} onClick={handleResend} type="button">
                    {t('重新發送')}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Step 3：膚質測驗 */}
          {step === 3 && (
            <SkinQuiz
              onComplete={(skinTypeKey) => {
                setForm(f => ({ ...f, skin_type: skinTypeKey }));
                handleSubmit(skinTypeKey);
              }}
              onSkip={() => {
                setForm(f => ({ ...f, skin_type: '' }));
                handleSubmit('');
              }}
            />
          )}

          {/* Error */}
          {error && (
            <div style={styles.errorBox}>
              <span style={styles.errorText}>{error}</span>
            </div>
          )}

          {/* Actions（Step 3 由 SkinQuiz 自帶按鈕，不顯示此區塊）*/}
          {step < 3 && (
            <div style={styles.actions}>
              {step > 0 && (
                <button
                  style={styles.backBtn}
                  onClick={() => { setStep(s => s - 1); setError(''); }}
                  type="button"
                >
                  {t('上一步')}
                </button>
              )}
              <button style={{ ...styles.btn, flex: 1 }} onClick={handleNext} type="button">
                {step === 2 ? (t('驗證並繼續') || '驗證並繼續') : t('下一步')}
              </button>
            </div>
          )}

          <p style={styles.loginHint}>
            {t('已有帳號？') || '已有帳號？'}{' '}
            <Link to="/login" style={styles.loginLink}>{t('登入')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    minHeight: 'calc(100vh - 64px)',
    marginTop: '64px',
    backgroundColor: tokens.bgBase,
  },
  decorPanel: {
    flex: '0 0 50%',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'stretch',
    background: `linear-gradient(145deg, #2A1F1B 0%, ${tokens.textPrimary} 50%, #0F0D0C 100%)`,
  },
  decorInner: {
    position: 'relative',
    zIndex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '72px 64px',
    width: '100%',
  },
  decorLogoBlock: {
    display: 'flex',
    flexDirection: 'column',
  },
  decorEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 400,
    letterSpacing: '0.22em',
    color: 'rgba(247,244,242,0.3)',
    margin: '0 0 20px 0',
    textTransform: 'uppercase',
  },
  decorLogo: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '96px',
    fontWeight: 300,
    letterSpacing: '0.1em',
    color: '#F7F4F2',
    margin: 0,
    lineHeight: 0.9,
  },
  decorDivider: {
    width: '48px',
    height: '1px',
    backgroundColor: tokens.accent,
    margin: '28px 0',
  },
  decorTagline: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '32px',
    fontWeight: 300,
    fontStyle: 'italic',
    color: 'rgba(247,244,242,0.7)',
    lineHeight: 1.4,
    margin: 0,
  },
  stepEyebrow: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '10px',
    fontWeight: 500,
    letterSpacing: '0.18em',
    color: 'rgba(247,244,242,0.3)',
    margin: '0 0 20px 0',
    textTransform: 'uppercase',
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
  },
  stepDot: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.3)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '13px',
    color: 'rgba(247,244,242,0.3)',
    fontFamily: '"DM Sans", sans-serif',
    flexShrink: 0,
  },
  stepDotActive: {
    backgroundColor: tokens.accent,
    border: `1px solid ${tokens.accent}`,
    color: '#FFFFFF',
    fontWeight: 500,
  },
  stepDotDone: {
    backgroundColor: 'rgba(196,137,122,0.2)',
    border: `1px solid ${tokens.accent}`,
    color: tokens.accent,
  },
  stepLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: 'rgba(247,244,242,0.4)',
  },
  stepLabelActive: {
    color: '#F7F4F2',
    fontWeight: 500,
  },
  decorFooter: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '13px',
    fontWeight: 300,
    letterSpacing: '0.18em',
    color: 'rgba(247,244,242,0.2)',
    margin: 0,
  },
  decorCircle1: {
    position: 'absolute',
    width: '600px',
    height: '600px',
    borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.12)',
    top: '-120px',
    right: '-160px',
    pointerEvents: 'none',
  },
  decorCircle2: {
    position: 'absolute',
    width: '380px',
    height: '380px',
    borderRadius: '50%',
    border: '1px solid rgba(196,137,122,0.08)',
    bottom: '-80px',
    left: '-80px',
    pointerEvents: 'none',
  },
  decorCircle3: {
    position: 'absolute',
    width: '200px',
    height: '200px',
    borderRadius: '50%',
    backgroundColor: 'rgba(196,137,122,0.04)',
    top: '40%',
    left: '10%',
    pointerEvents: 'none',
  },
  formPanel: {
    flex: 1,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '48px 32px',
    overflowY: 'auto',
  },
  card: {
    width: '100%',
    maxWidth: '440px',
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
    gap: '14px',
  },
  field: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  twoCol: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '12px',
  },
  label: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.textSecondary,
  },
  labelDisabled: {
    color: tokens.textTertiary,
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
  selectDisabled: {
    backgroundColor: tokens.bgSubtle,
    color: tokens.textTertiary,
    cursor: 'not-allowed',
  },
  emailWrapper: {
    display: 'flex',
    alignItems: 'center',
    height: '44px',
    borderRadius: '8px',
    border: `1px solid ${tokens.border}`,
    backgroundColor: tokens.bgSurface,
    overflow: 'hidden',
    transition: 'border-color 150ms, box-shadow 150ms',
  },
  emailWrapperFocus: {
    borderColor: tokens.accent,
    boxShadow: `0 0 0 3px rgba(196,137,122,0.15)`,
  },
  emailInput: {
    flex: 1,
    height: '100%',
    padding: '0 12px',
    border: 'none',
    outline: 'none',
    fontSize: '14px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: tokens.textPrimary,
    backgroundColor: 'transparent',
    minWidth: 0,
  },
  emailSuffix: {
    padding: '0 12px 0 0',
    fontSize: '14px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: tokens.textTertiary,
    whiteSpace: 'nowrap',
    userSelect: 'none',
  },
  previewBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '10px 14px',
    backgroundColor: 'rgba(196,137,122,0.06)',
    border: `1px solid rgba(196,137,122,0.2)`,
    borderRadius: '8px',
  },
  previewLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.08em',
    color: tokens.accent,
    whiteSpace: 'nowrap',
  },
  previewValue: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: tokens.textPrimary,
  },
  skinHint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: tokens.textSecondary,
    margin: 0,
  },
  skinGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
  },
  skinCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    padding: '20px 12px',
    borderRadius: '12px',
    border: `1px solid ${tokens.border}`,
    backgroundColor: tokens.bgSurface,
    cursor: 'pointer',
    transition: 'border-color 150ms, background-color 150ms',
  },
  skinCardActive: {
    border: `1.5px solid ${tokens.accent}`,
    backgroundColor: 'rgba(196,137,122,0.06)',
  },
  skinEmoji: {
    fontSize: '24px',
    lineHeight: 1,
  },
  skinName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: tokens.textSecondary,
    fontWeight: 400,
  },
  skinNameActive: {
    color: tokens.accent,
    fontWeight: 500,
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
  actions: {
    display: 'flex',
    gap: '12px',
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
    transition: 'background-color 150ms',
    letterSpacing: '0.04em',
  },
  btnDisabled: {
    backgroundColor: tokens.accentLight,
    cursor: 'not-allowed',
  },
  backBtn: {
    height: '44px',
    width: '80px',
    backgroundColor: 'transparent',
    border: `1px solid ${tokens.border}`,
    borderRadius: '8px',
    fontSize: '14px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    color: tokens.textSecondary,
    cursor: 'pointer',
    flexShrink: 0,
  },
  loginHint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: tokens.textTertiary,
    margin: 0,
    textAlign: 'center',
  },
  loginLink: {
    color: tokens.accent,
    textDecoration: 'none',
    fontWeight: 500,
  },
};

const verifyStyles = {
  infoBox: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    padding: '14px 16px',
    backgroundColor: 'rgba(196,137,122,0.06)',
    border: `1px solid rgba(196,137,122,0.2)`,
    borderRadius: '10px',
  },
  infoIcon: {
    fontSize: '22px',
    flexShrink: 0,
  },
  infoText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  },
  infoTitle: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.textSecondary,
    margin: 0,
  },
  infoEmail: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    color: tokens.accent,
    fontWeight: 500,
    margin: 0,
    wordBreak: 'break-all',
  },
  otpWrap: {
    display: 'flex',
    gap: '10px',
    justifyContent: 'center',
    padding: '8px 0',
  },
  otpInput: {
    width: '52px',
    height: '60px',
    textAlign: 'center',
    fontSize: '24px',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontWeight: 500,
    color: tokens.textPrimary,
    backgroundColor: tokens.bgSurface,
    border: `1.5px solid ${tokens.border}`,
    borderRadius: '10px',
    outline: 'none',
    caretColor: tokens.accent,
    transition: 'border-color 150ms, box-shadow 150ms',
  },
  otpInputFilled: {
    borderColor: tokens.accent,
    boxShadow: `0 0 0 3px rgba(196,137,122,0.12)`,
  },
  resendRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
  },
  resendHint: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: tokens.textTertiary,
  },
  cooldownText: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    color: tokens.textTertiary,
  },
  resendBtn: {
    background: 'none',
    border: 'none',
    padding: 0,
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: tokens.accent,
    cursor: 'pointer',
    textDecoration: 'underline',
    textUnderlineOffset: '3px',
  },
};

const pwStyles = {
  wrap: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '6px',
  },
  barTrack: {
    flex: 1,
    display: 'flex',
    gap: '4px',
    height: '4px',
  },
  barSegment: {
    flex: 1,
    borderRadius: '2px',
  },
  levelText: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    whiteSpace: 'nowrap',
    minWidth: '48px',
    textAlign: 'right',
  },
};

const successStyles = {
  iconWrap: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '4px',
  },
  iconCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    backgroundColor: 'rgba(76,175,80,0.12)',
    border: '2px solid #4CAF50',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '28px',
    color: '#4CAF50',
    fontWeight: 600,
  },
  infoCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0',
    border: `1px solid ${tokens.border}`,
    borderRadius: '10px',
    overflow: 'hidden',
  },
  infoRow: {
    display: 'flex',
    alignItems: 'center',
    padding: '12px 16px',
    borderBottom: `1px solid ${tokens.border}`,
    gap: '12px',
  },
  infoLabel: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    fontWeight: 500,
    letterSpacing: '0.06em',
    color: tokens.accent,
    minWidth: '60px',
  },
  infoValue: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: tokens.textPrimary,
  },
};

export default Register;
