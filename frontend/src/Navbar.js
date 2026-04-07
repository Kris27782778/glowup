import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const T = {
  bgBase:    '#F7F4F2',
  bgSurface: '#FFFFFF',
  bgSubtle:  '#F0EBE7',
  accent:    '#C4897A',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  border:    '#E5DDD9',
};

const NAV_LINKS = [
  { label: '首頁',    to: '/' },
  { label: '成分庫',  to: '/products' },
  { label: '社群討論', to: '#' },
  { label: 'Q&A',    to: '#' },
];

function Navbar() {
  const [user, setUser]         = useState(null);
  const [scrolled, setScrolled] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const dropRef = useRef(null);
  const location  = useLocation();
  const navigate  = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
  }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 點外面關閉 dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setDropdown(false);
    navigate('/');
  };

  const isActive = (to) => to !== '#' && location.pathname === to;

  return (
    <nav style={{ ...styles.nav, ...(scrolled ? styles.navScrolled : {}) }}>
      {/* Logo */}
      <Link to="/" style={{ ...styles.logo, ...(scrolled ? styles.logoScrolled : {}) }}>
        GLŌW
      </Link>

      {/* 主導覽 */}
      <div style={styles.links}>
        {NAV_LINKS.map(({ label, to }) => (
          <Link
            key={label}
            to={to}
            style={{
              ...styles.link,
              ...(isActive(to) ? styles.linkActive : {}),
            }}
          >
            {label}
            {isActive(to) && <span style={styles.linkUnderline} />}
          </Link>
        ))}
      </div>

      {/* 右側 */}
      <div style={styles.right}>
        {user ? (
          <div ref={dropRef} style={{ position: 'relative' }}>
            <button style={styles.avatarBtn} onClick={() => setDropdown(d => !d)}>
              <div style={styles.avatar}>
                {user.nickname?.[0]?.toUpperCase() || '?'}
              </div>
              <span style={styles.avatarName}>{user.nickname}</span>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"
                style={{ transition: 'transform 200ms', transform: dropdown ? 'rotate(180deg)' : 'none' }}>
                <path d="M2 4l4 4 4-4" stroke={T.textSecondary} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {dropdown && (
              <div style={styles.dropdown}>
                <Link to="/dashboard" style={styles.dropItem} onClick={() => setDropdown(false)}>
                  個人檔案
                </Link>
                <Link to="#" style={styles.dropItem} onClick={() => setDropdown(false)}>
                  我的收藏
                </Link>
                <Link to="#" style={styles.dropItem} onClick={() => setDropdown(false)}>
                  成分筆記
                </Link>
                <Link to="#" style={styles.dropItem} onClick={() => setDropdown(false)}>
                  設定
                </Link>
                <div style={styles.dropDivider} />
                <button style={{ ...styles.dropItem, ...styles.dropLogout }} onClick={handleLogout}>
                  登出
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" style={styles.loginBtn}>登入</Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 100,
    height: '64px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 40px',
    backgroundColor: T.bgBase,
    borderBottom: `1px solid transparent`,
    transition: 'all 250ms cubic-bezier(0.16,1,0.3,1)',
  },
  navScrolled: {
    height: '48px',
    backgroundColor: 'rgba(247,244,242,0.92)',
    backdropFilter: 'blur(16px)',
    WebkitBackdropFilter: 'blur(16px)',
    borderBottom: `1px solid ${T.border}`,
  },
  logo: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px',
    fontWeight: 400,
    letterSpacing: '0.12em',
    color: T.textPrimary,
    transition: 'font-size 250ms cubic-bezier(0.16,1,0.3,1)',
  },
  logoScrolled: {
    fontSize: '18px',
  },
  links: {
    display: 'flex',
    alignItems: 'center',
    gap: '32px',
    position: 'absolute',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  link: {
    position: 'relative',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 400,
    color: T.textSecondary,
    transition: 'color 150ms',
    paddingBottom: '2px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
  },
  linkActive: {
    color: T.textPrimary,
    fontWeight: 500,
  },
  linkUnderline: {
    position: 'absolute',
    bottom: '-2px',
    left: 0,
    right: 0,
    height: '2px',
    backgroundColor: T.accent,
    borderRadius: '999px',
  },
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
  },
  loginBtn: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: T.textPrimary,
    padding: '8px 18px',
    border: `1px solid ${T.border}`,
    borderRadius: '999px',
    transition: 'background-color 150ms',
  },
  avatarBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 10px 4px 4px',
    borderRadius: '999px',
    transition: 'background-color 150ms',
  },
  avatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    backgroundColor: T.accent,
    color: '#FFFFFF',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    flexShrink: 0,
  },
  avatarName: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    color: T.textPrimary,
    fontWeight: 400,
  },
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '180px',
    backgroundColor: T.bgSurface,
    borderRadius: '12px',
    border: `1px solid ${T.border}`,
    boxShadow: '0 4px 16px rgba(28,25,23,0.08)',
    padding: '6px',
    display: 'flex',
    flexDirection: 'column',
  },
  dropItem: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    color: T.textPrimary,
    padding: '9px 12px',
    borderRadius: '6px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 100ms',
    display: 'block',
    width: '100%',
  },
  dropDivider: {
    height: '1px',
    backgroundColor: T.border,
    margin: '4px 0',
  },
  dropLogout: {
    color: '#C4614A',
  },
};

export default Navbar;
