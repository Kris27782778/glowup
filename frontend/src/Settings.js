import { useNavigate } from 'react-router-dom';
import { useSettings } from './hooks/useSettings';

const LANG = {
  'zh-TW': {
    back: '返回',
    title: '設定',
    appearance: '外觀',
    themeLabel: '色彩模式',
    themes: { light: '日間', dark: '夜間', system: '系統' },
    language: '語言',
    langLabel: '介面語言',
    langs: { 'zh-TW': '繁體中文', en: 'English' },
    account: '帳號',
    logout: '登出',
    version: '版本',
  },
  en: {
    back: 'Back',
    title: 'Settings',
    appearance: 'Appearance',
    themeLabel: 'Color Mode',
    themes: { light: 'Light', dark: 'Dark', system: 'System' },
    language: 'Language',
    langLabel: 'Interface Language',
    langs: { 'zh-TW': 'Traditional Chinese', en: 'English' },
    account: 'Account',
    logout: 'Sign Out',
    version: 'Version',
  },
};

function Settings() {
  const navigate = useNavigate();
  const { settings, update } = useSettings();
  const t = LANG[settings.language] || LANG['zh-TW'];

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  return (
    <div style={s.page}>
      <div style={s.container}>

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
            {['light', 'dark', 'system'].map(val => (
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

        {/* ── 帳號 ── */}
        <Section label={t.account}>
          <button style={s.dangerBtn} onClick={handleLogout}>
            {t.logout}
          </button>
        </Section>

        {/* Footer */}
        <p style={s.footer}>GLŌW · {t.version} 1.0.0</p>

      </div>
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
