import { Link } from 'react-router-dom';
import { useLang } from './hooks/useLang';

const T = {
  bgInverse:   '#1C1917',
  textInverse: '#F7F4F2',
  accent:      '#C4897A',
  border:      'rgba(247,244,242,0.1)',
  muted:       'rgba(247,244,242,0.4)',
};

const LINKS = [
  { group: '平台',   items: [{ label: '首頁', to: '/' }, { label: '成分庫', to: '/products' }, { label: '社群討論', to: '#' }, { label: 'Q&A', to: '#' }] },
  { group: '關於',   items: [{ label: '關於 GLŌW', to: '/about' }, { label: '使用條款', to: '/terms' }, { label: '隱私政策', to: '/privacy' }] },
  { group: '帳號',   items: [{ label: '登入', to: '/login' }, { label: '註冊', to: '/register' }] },
];


function Footer() {
  const { t } = useLang();
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>
        <div style={styles.top}>
          <div style={styles.brand}>
            <Link to="/" style={styles.logo}>GLŌW</Link>
            <p style={styles.tagline}>{t('輔大美妝交流平台')}<br />{t('清晰就是美')}</p>
          </div>
          <div style={styles.linkGroups}>
            {LINKS.map(({ group, items }) => (
              <div key={group} style={styles.linkGroup}>
                <p style={styles.groupTitle}>{t(group)}</p>
                {items.map(({ label, to }) => (
                  <Link key={label} to={to} style={styles.footerLink} className="g-footer-link">{t(label)}</Link>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div style={styles.divider} />

        <div style={styles.bottom}>
          <p style={styles.copyright}>© 2025 GLŌW · {t('輔仁大學')}</p>
          <p style={styles.copyright}>{t('以成分透明為核心，共建知識型美妝社群')}</p>
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    backgroundColor: T.bgInverse,
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '64px 40px 32px',
  },
  top: {
    display: 'flex',
    justifyContent: 'space-between',
    gap: '48px',
    flexWrap: 'wrap',
  },
  brand: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  logo: {
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '28px',
    fontWeight: 300,
    letterSpacing: '0.14em',
    color: T.textInverse,
  },
  tagline: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.muted,
    lineHeight: 1.7,
    margin: 0,
  },
  linkGroups: {
    display: 'flex',
    gap: '64px',
    flexWrap: 'wrap',
  },
  linkGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  groupTitle: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    fontWeight: 500,
    letterSpacing: '0.12em',
    color: T.accent,
    margin: '0 0 4px 0',
    textTransform: 'uppercase',
  },
  footerLink: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.muted,
    transition: 'color 150ms',
  },
  divider: {
    height: '1px',
    backgroundColor: T.border,
    margin: '48px 0 24px',
  },
  bottom: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '8px',
  },
  copyright: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '12px',
    color: T.muted,
    margin: 0,
    letterSpacing: '0.04em',
  },
};

export default Footer;
