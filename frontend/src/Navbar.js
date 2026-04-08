import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

const T = {
  bg:            '#FFFFFF',
  bgBorder:      '#E5DDD9',
  accent:        '#C4897A',
  accentLight:   'rgba(196,137,122,0.1)',
  textPrimary:   '#1C1917',
  textSecondary: '#6B5E58',
  textTertiary:  '#A89990',
  danger:        '#C0504A',
};

const NAV_LINKS = [
  { label: '社群討論', to: '#' },
  { label: '產品資料庫', to: '/products' },
  { label: '問答', to: '#' },
];

function Navbar() {
  const [user, setUser]         = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef                 = useRef(null);
  const navigate                = useNavigate();
  const location                = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    setUser(stored ? JSON.parse(stored) : null);
  }, [location]);

  // 點選選單外部時關閉
  useEffect(() => {
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setMenuOpen(false);
    navigate('/');
  };

  const initial = user?.nickname?.[0]?.toUpperCase() || '?';

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>

        {/* ── 左側：Logo + 導覽 ── */}
        <div style={styles.left}>
          <Link to="/" style={styles.logo}>GLŌW</Link>
          <div style={styles.divider} />
          <div style={styles.navLinks}>
            {NAV_LINKS.map(({ label, to }) => (
              <Link
                key={label}
                to={to}
                style={{
                  ...styles.navLink,
                  ...(location.pathname === to ? styles.navLinkActive : {}),
                }}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>

        {/* ── 右側：登入狀態 ── */}
        <div style={styles.right}>
          {user ? (
            <div style={styles.userMenu} ref={menuRef}>
              {/* 觸發按鈕 */}
              <button
                style={styles.userBtn}
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
              >
                <div style={styles.avatar}>{initial}</div>
                <span style={styles.nickname}>{user.nickname}</span>
                <ChevronIcon open={menuOpen} />
              </button>

              {/* 下拉選單 */}
              {menuOpen && (
                <div style={styles.dropdown}>
                  {/* 使用者資訊頭部 */}
                  <div style={styles.dropHeader}>
                    <div style={styles.dropAvatar}>{initial}</div>
                    <div style={styles.dropUserInfo}>
                      <span style={styles.dropNickname}>{user.nickname}</span>
                      {user.email && (
                        <span style={styles.dropEmail}>{user.email}</span>
                      )}
                    </div>
                  </div>

                  <div style={styles.dropSeparator} />

                  {/* 選單項目 */}
                  <button
                    style={styles.dropItem}
                    onClick={() => { navigate('/dashboard'); setMenuOpen(false); }}
                  >
                    <span style={styles.dropItemIcon}>👤</span>
                    個人主頁
                  </button>
                  <button style={styles.dropItem} onClick={() => setMenuOpen(false)}>
                    <span style={styles.dropItemIcon}>⚙️</span>
                    帳號設定
                  </button>

                  <div style={styles.dropSeparator} />

                  <button style={{ ...styles.dropItem, ...styles.dropItemDanger }} onClick={handleLogout}>
                    <span style={styles.dropItemIcon}>↩</span>
                    登出
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/register" style={styles.registerBtn}>註冊</Link>
              <Link to="/login"    style={styles.loginBtn}>登入</Link>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}

function ChevronIcon({ open }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms' }}
    >
      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
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
    backgroundColor: T.bg,
    borderBottom: `1px solid ${T.bgBorder}`,
    backdropFilter: 'blur(12px)',
  },
  inner: {
    maxWidth: '1200px',
    margin: '0 auto',
    height: '100%',
    padding: '0 32px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  /* 左側 */
  left: {
    display: 'flex',
    alignItems: 'center',
    gap: '24px',
  },
  logo: {
    fontFamily: '"Cormorant Garamond", "Noto Serif TC", serif',
    fontSize: '22px',
    fontWeight: 300,
    letterSpacing: '0.2em',
    color: T.textPrimary,
    textDecoration: 'none',
  },
  divider: {
    width: '1px',
    height: '18px',
    backgroundColor: T.bgBorder,
  },
  navLinks: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  navLink: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: T.textSecondary,
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'color 150ms, background-color 150ms',
  },
  navLinkActive: {
    color: T.textPrimary,
    backgroundColor: 'rgba(255,255,255,0.06)',
  },

  /* 右側 */
  right: {
    display: 'flex',
    alignItems: 'center',
  },

  /* 未登入 */
  authBtns: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  registerBtn: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: T.textSecondary,
    textDecoration: 'none',
    padding: '7px 16px',
    borderRadius: '6px',
    transition: 'color 150ms',
  },
  loginBtn: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    color: '#F7F4F2',
    textDecoration: 'none',
    padding: '7px 18px',
    borderRadius: '6px',
    backgroundColor: '#1C1917',
    transition: 'opacity 150ms',
  },

  /* 已登入：觸發按鈕 */
  userMenu: {
    position: 'relative',
  },
  userBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    background: 'none',
    border: `1px solid ${T.bgBorder}`,
    borderRadius: '8px',
    padding: '6px 12px 6px 6px',
    cursor: 'pointer',
    color: T.textPrimary,
    transition: 'border-color 150ms, background-color 150ms',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: T.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '14px',
    fontWeight: 400,
    color: '#FFFFFF',
    flexShrink: 0,
  },
  nickname: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: T.textPrimary,
    maxWidth: '100px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },

  /* 下拉選單 */
  dropdown: {
    position: 'absolute',
    top: 'calc(100% + 8px)',
    right: 0,
    width: '220px',
    backgroundColor: '#FFFFFF',
    border: `1px solid ${T.bgBorder}`,
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(28,25,23,0.12)',
    zIndex: 200,
  },
  dropHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px',
  },
  dropAvatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: T.accent,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: '"Cormorant Garamond", serif',
    fontSize: '18px',
    color: '#FFFFFF',
    flexShrink: 0,
  },
  dropUserInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    minWidth: 0,
  },
  dropNickname: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    color: T.textPrimary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropEmail: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    color: T.textTertiary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropSeparator: {
    height: '1px',
    backgroundColor: T.bgBorder,
    margin: '0',
  },
  dropItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    width: '100%',
    padding: '11px 16px',
    background: 'none',
    border: 'none',
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 400,
    color: T.textSecondary,
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 120ms, color 120ms',
  },
  dropItemDanger: {
    color: T.danger,
  },
  dropItemIcon: {
    fontSize: '14px',
    width: '18px',
    textAlign: 'center',
    flexShrink: 0,
  },
};

export default Navbar;
