import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { COLLEGES, getDepts, getDivisions, getGrades } from './data/departments';
import CustomSelect from './components/Select';
import SkinQuiz from './components/SkinQuiz';

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
const STEPS = ['基本資料', '帳號設定', '膚質設定'];

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

const PW_LEVELS = [
  { label: '請輸入密碼', color: tokens.border },
  { label: '非常弱', color: '#E05252' },
  { label: '弱', color: '#E09352' },
  { label: '普通', color: '#E0C652' },
  { label: '強', color: '#7ABF6A' },
  { label: '非常強', color: '#4CAF50' },
];

function Register() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [focusField, setFocusField] = useState(null);
  const [success, setSuccess] = useState(false);
  const [registeredInfo, setRegisteredInfo] = useState(null);

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
    // step 2 由 SkinQuiz 元件自行處理，無需外層驗證
    return null;
  };

  const handleNext = () => {
    const err = validateStep();
    if (err) { setError(err); return; }
    setError('');
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
        setRegisteredInfo({
          nickname: form.nickname,
          studentId: form.email,
          email: `${form.email}@cloud.fju.edu.tw`,
          departmentGrade,
          skinType: skinTypeKey || '（未設定）',
        });
        setSuccess(true);
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
          <p style={styles.decorLogo}>GLŌW</p>
          <p style={styles.decorTagline}>輔大美妝交流平台</p>
          <div style={styles.decorCircle1} />
          <div style={styles.decorCircle2} />
        </div>
        <div style={styles.formPanel}>
          <div style={styles.card}>
            <div style={successStyles.iconWrap}>
              <div style={successStyles.iconCircle}>✓</div>
            </div>
            <div style={styles.cardHeader}>
              <p style={styles.eyebrow}>REGISTRATION COMPLETE</p>
              <h1 style={styles.title}>註冊成功！</h1>
              <p style={styles.subtitle}>歡迎加入 GLŌW，以下是你的帳號資訊</p>
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
                  <span style={successStyles.infoLabel}>{label}</span>
                  <span style={successStyles.infoValue}>{value}</span>
                </div>
              ))}
            </div>
            <button style={styles.btn} onClick={() => navigate('/login')}>
              前往登入
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
        <p style={styles.decorLogo}>GLŌW</p>
        <p style={styles.decorTagline}>輔大美妝交流平台</p>
        <div style={styles.stepList}>
          {STEPS.map((s, i) => (
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
              }}>{s}</span>
            </div>
          ))}
        </div>
        <div style={styles.decorCircle1} />
        <div style={styles.decorCircle2} />
      </div>

      {/* 右側表單區 */}
      <div style={styles.formPanel}>
        <div style={styles.card}>
          {/* Header */}
          <div style={styles.cardHeader}>
            <p style={styles.eyebrow}>STEP {step + 1} / {STEPS.length}</p>
            <h1 style={styles.title}>{STEPS[step]}</h1>
            <p style={styles.subtitle}>
              {step === 0 && '告訴我們一些關於你的資訊'}
              {step === 1 && '為你的學號設定登入密碼'}
              {step === 2 && '回答 5 題，找出你的膚質類型'}
            </p>
          </div>

          {/* Step 0：基本資料 */}
          {step === 0 && (
            <div style={styles.fieldGroup}>
              <div style={styles.field}>
                <label style={styles.label}>暱稱</label>
                <input
                  style={inputStyle('nickname')}
                  type="text"
                  placeholder="顯示在平台上的名字"
                  value={form.nickname}
                  onChange={set('nickname')}
                  onFocus={() => setFocusField('nickname')}
                  onBlur={() => setFocusField(null)}
                />
              </div>

              {/* 4 層系級選單 */}
              <div style={styles.field}>
                <label style={styles.label}>學院</label>
                <CustomSelect
                  value={college}
                  onChange={handleCollegeChange}
                  options={COLLEGES}
                  placeholder="請選擇學院"
                />
              </div>

              <div style={styles.field}>
                <label style={{ ...styles.label, ...(!college ? styles.labelDisabled : {}) }}>科系</label>
                <CustomSelect
                  value={dept}
                  onChange={handleDeptChange}
                  options={depts}
                  placeholder="請選擇科系"
                  disabled={!college}
                />
              </div>

              <div style={styles.twoCol}>
                <div style={styles.field}>
                  <label style={{ ...styles.label, ...(!dept ? styles.labelDisabled : {}) }}>部別</label>
                  <CustomSelect
                    value={division}
                    onChange={handleDivisionChange}
                    options={divisions}
                    placeholder="部別"
                    disabled={!dept}
                  />
                </div>

                <div style={styles.field}>
                  <label style={{ ...styles.label, ...(!division ? styles.labelDisabled : {}) }}>年級</label>
                  <CustomSelect
                    value={grade}
                    onChange={(val) => { setGrade(val); setError(''); }}
                    options={grades}
                    placeholder="年級"
                    disabled={!division}
                  />
                </div>
              </div>

              {/* 預覽 */}
              {departmentGrade && (
                <div style={styles.previewBox}>
                  <span style={styles.previewLabel}>系級預覽</span>
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
                    placeholder="帳號"
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
                <span style={styles.previewLabel}>學號</span>
                <span style={styles.previewValue}>{form.email}</span>
              </div>
              <div style={styles.field}>
                <label style={styles.label}>密碼</label>
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
                  const level = PW_LEVELS[score];
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
                        {level.label}
                      </span>
                    </div>
                  );
                })()}
              </div>
              <div style={styles.field}>
                <label style={styles.label}>確認密碼</label>
                <input
                  style={inputStyle('pw2')}
                  type="password"
                  placeholder="再輸入一次密碼"
                  value={form.passwordConfirm}
                  onChange={set('passwordConfirm')}
                  onFocus={() => setFocusField('pw2')}
                  onBlur={() => setFocusField(null)}
                  autoComplete="new-password"
                />
              </div>
            </div>
          )}

          {/* Step 2：膚質測驗 */}
          {step === 2 && (
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

          {/* Actions（Step 2 由 SkinQuiz 自帶按鈕，不顯示此區塊）*/}
          {step < 2 && <div style={styles.actions}>
            {step > 0 && (
              <button
                style={styles.backBtn}
                onClick={() => { setStep(s => s - 1); setError(''); }}
                type="button"
              >
                返回
              </button>
            )}
            <button style={{ ...styles.btn, flex: 1 }} onClick={handleNext} type="button">
              下一步
            </button>
          </div>}

          <p style={styles.loginHint}>
            已有帳號？{' '}
            <Link to="/login" style={styles.loginLink}>登入</Link>
          </p>
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
  decorPanel: {
    flex: '0 0 30%',
    backgroundColor: tokens.textPrimary,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    gap: '12px',
  },
  decorLogo: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '56px',
    fontWeight: 300,
    letterSpacing: '0.18em',
    color: '#F7F4F2',
    margin: 0,
    position: 'relative',
    zIndex: 1,
  },
  decorTagline: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    letterSpacing: '0.2em',
    color: tokens.textTertiary,
    margin: '0 0 32px 0',
    position: 'relative',
    zIndex: 1,
  },
  stepList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
    position: 'relative',
    zIndex: 1,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  stepDot: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.3)`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '12px',
    color: tokens.textTertiary,
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
    fontSize: '13px',
    color: 'rgba(247,244,242,0.4)',
  },
  stepLabelActive: {
    color: '#F7F4F2',
    fontWeight: 500,
  },
  decorCircle1: {
    position: 'absolute',
    width: '320px',
    height: '320px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.15)`,
    top: '-80px',
    right: '-120px',
  },
  decorCircle2: {
    position: 'absolute',
    width: '220px',
    height: '220px',
    borderRadius: '50%',
    border: `1px solid rgba(196,137,122,0.1)`,
    bottom: '-50px',
    left: '-60px',
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
