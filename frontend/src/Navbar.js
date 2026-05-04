import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useLang } from './hooks/useLang';
import API_BASE from './config';
import './animations.css';


const NAV_KEYS = [
  { key: '社群討論',   to: '/community' },
  { key: '產品資料庫', to: '/products' },
  { key: '問答',       to: '/qa' },
];

function Navbar() {
  const [user,        setUser]        = useState(null);
  const [menuOpen,    setMenuOpen]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [scrolled,    setScrolled]    = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const menuRef                 = useRef(null);
  const navigate                = useNavigate();
  const location                = useLocation();

  // 路由切換時關閉 mobile 選單
  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    const u = stored ? JSON.parse(stored) : null;
    setUser(u);

    const fetchUnread = (currentUser) => {
      if (!currentUser?.user_id) { setUnreadCount(0); return; }
      const since = localStorage.getItem('lastSeenQA') || '';
      fetch(`${API_BASE}/api/notifications/unread?user_id=${currentUser.user_id}&since=${encodeURIComponent(since)}`)
        .then(r => r.json())
        .then(d => setUnreadCount(d.count || 0))
        .catch(() => {});
    };

    fetchUnread(u);

    // 每 60 秒自動重新查詢
    const timer = setInterval(() => fetchUnread(u), 10000);
    return () => clearInterval(timer);
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
    navigate('/', { state: { showSplash: true } });
  };

  const { t } = useLang();
  const initial = user?.nickname?.[0]?.toUpperCase() || '?';

  return (
    <>
    <nav style={styles.nav} className={scrolled ? 'navbar-scrolled' : ''}>
      <div style={styles.inner} className="nav-inner">

        {/* ── 左側：Logo + 導覽 ── */}
        <div style={styles.left}>
          <Link to="/" style={styles.logo}>GLŌW</Link>
          <div style={styles.divider} className="nav-divider" />
          <div style={styles.navLinks} className="nav-links">
            {NAV_KEYS.map(({ key, to }) => (
              <Link
                key={key}
                to={to}
                className="g-nav-link"
                style={{
                  ...styles.navLink,
                  ...(user && location.pathname === to ? styles.navLinkActive : {}),
                  position: 'relative',
                }}
              >
                {t(key)}
                {key === '問答' && unreadCount > 0 && (
                  <span style={styles.badge}>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </div>

        {/* ── 右側：登入狀態 ── */}
        <div style={styles.right}>
          {user && (
            <button
              className="nav-post-btn"
              style={styles.postBtn}
              onClick={() => navigate('/community')}
            >
              + {t('發布貼文')}
            </button>
          )}

          {/* 漢堡按鈕（手機） */}
          <button
            className="nav-hamburger"
            onClick={() => setMobileOpen(o => !o)}
            aria-label="選單"
          >
            {mobileOpen ? (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M4 4L16 16M16 4L4 16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            )}
          </button>

          {user ? (
            <div style={styles.userMenu} ref={menuRef}>
              {/* 觸發按鈕 */}
              <button
                style={styles.userBtn}
                onClick={() => setMenuOpen(o => !o)}
                aria-expanded={menuOpen}
              >
                <div style={styles.avatar}>{initial}</div>
                <span style={styles.nickname} className="nav-nickname">{user.nickname}</span>
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
                    <DropIcon type="person" />
                    {t('個人主頁')}
                  </button>
                  <button
                    style={styles.dropItem}
                    onClick={() => { navigate('/settings'); setMenuOpen(false); }}
                  >
                    <DropIcon type="settings" />
                    {t('帳號設定')}
                  </button>

                  {user?.is_admin && (
                    <>
                      <div style={styles.dropSeparator} />
                      <button
                        style={{ ...styles.dropItem, color: '#C4897A' }}
                        onClick={() => { navigate('/admin'); setMenuOpen(false); }}
                      >
                        <DropIcon type="admin" />
                        平台管理
                      </button>
                    </>
                  )}

                  <div style={styles.dropSeparator} />

                  <button style={{ ...styles.dropItem, ...styles.dropItemDanger }} onClick={handleLogout}>
                    {t('登出')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <Link to="/register" style={styles.registerBtn}>{t('註冊')}</Link>
              <Link to="/login"    style={styles.loginBtn}>{t('登入')}</Link>
            </div>
          )}
        </div>

      </div>
    </nav>

    {/* ── Mobile Menu ── */}
    {mobileOpen && (
      <>
        <div className="nav-mobile-overlay" onClick={() => setMobileOpen(false)} />
        <div className="nav-mobile-menu">
          {NAV_KEYS.map(({ key, to }) => (
            <Link
              key={key}
              to={to}
              className="nav-mobile-link"
              onClick={() => setMobileOpen(false)}
            >
              {t(key)}
              {key === '問答' && unreadCount > 0 && (
                <span style={{ ...styles.badge, position: 'static', display: 'inline-flex', marginLeft: '8px', verticalAlign: 'middle' }}>
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>
          ))}
          <div className="nav-mobile-divider" />
          {user ? (
            <>
              <button className="nav-mobile-link" onClick={() => { navigate('/dashboard'); setMobileOpen(false); }}>{t('個人主頁')}</button>
              <button className="nav-mobile-link" onClick={() => { navigate('/settings'); setMobileOpen(false); }}>{t('帳號設定')}</button>
              {user?.is_admin && (
                <button className="nav-mobile-link" style={{ color: '#C4897A' }} onClick={() => { navigate('/admin'); setMobileOpen(false); }}>平台管理</button>
              )}
              <div className="nav-mobile-divider" />
              <button className="nav-mobile-post-btn" onClick={() => { navigate('/community'); setMobileOpen(false); }}>
                + {t('發布貼文')}
              </button>
              <button
                className="nav-mobile-link"
                style={{ color: '#C0504A', marginTop: '4px' }}
                onClick={handleLogout}
              >{t('登出')}</button>
            </>
          ) : (
            <div className="nav-auth-mobile">
              <Link to="/register" style={{ backgroundColor: 'var(--bg-subtle)', border: '1px solid var(--border)', color: 'var(--text-secondary)' }}>{t('註冊')}</Link>
              <Link to="/login" style={{ backgroundColor: 'var(--bg-inverse)', color: 'var(--text-inverse)' }}>{t('登入')}</Link>
            </div>
          )}
        </div>
      </>
    )}
    </>
  );
}

function DropIcon({ type }) {
  const color = 'var(--text-tertiary)';
  if (type === 'person') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="4.5" r="2.5" stroke={color} strokeWidth="1.2"/>
      <path d="M1.5 12.5c0-2.76 2.46-5 5.5-5s5.5 2.24 5.5 5" stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'settings') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <circle cx="7" cy="7" r="2" stroke={color} strokeWidth="1.2"/>
      <path d="M7 1v1.5M7 11.5V13M1 7h1.5M11.5 7H13M2.93 2.93l1.06 1.06M10.01 10.01l1.06 1.06M2.93 11.07l1.06-1.06M10.01 3.99l1.06-1.06"
        stroke={color} strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
  if (type === 'admin') return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M7 1.5L2 4v3c0 2.76 2.13 5.34 5 5.97C9.87 12.34 12 9.76 12 7V4L7 1.5z"
        stroke="#C4897A" strokeWidth="1.2" strokeLinejoin="round"/>
    </svg>
  );
  return null;
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
    backgroundColor: 'var(--bg-surface)',
    borderBottom: '1px solid var(--border)',
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
    color: 'var(--text-primary)',
    textDecoration: 'none',
  },
  divider: {
    width: '1px',
    height: '18px',
    backgroundColor: 'var(--border)',
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
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '6px 12px',
    borderRadius: '6px',
    transition: 'color 150ms, background-color 150ms',
  },
  navLinkActive: {
    color: 'var(--text-primary)',
    backgroundColor: 'var(--bg-subtle)',
  },

  badge: {
    position: 'absolute',
    top: '2px',
    right: '2px',
    minWidth: '16px',
    height: '16px',
    borderRadius: '999px',
    backgroundColor: '#C4897A',
    color: '#FFFFFF',
    fontSize: '10px',
    fontWeight: 600,
    fontFamily: '"DM Sans", sans-serif',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '0 4px',
    pointerEvents: 'none',
  },

  /* 右側 */
  right: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  postBtn: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '13px',
    fontWeight: 500,
    color: 'var(--accent)',
    background: 'transparent',
    border: '1px solid var(--accent)',
    borderRadius: '7px',
    padding: '6px 14px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background-color 150ms, color 150ms',
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
    color: 'var(--text-secondary)',
    textDecoration: 'none',
    padding: '7px 16px',
    borderRadius: '6px',
    transition: 'color 150ms',
  },
  loginBtn: {
    fontFamily: '"DM Sans", "Noto Sans TC", sans-serif',
    fontSize: '14px',
    fontWeight: 500,
    color: 'var(--text-inverse)',
    textDecoration: 'none',
    padding: '7px 18px',
    borderRadius: '6px',
    backgroundColor: 'var(--bg-inverse)',
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
    border: '1px solid var(--border)',
    borderRadius: '8px',
    padding: '6px 12px 6px 6px',
    cursor: 'pointer',
    color: 'var(--text-primary)',
    transition: 'border-color 150ms, background-color 150ms',
  },
  avatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    backgroundColor: 'var(--accent)',
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
    color: 'var(--text-primary)',
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
    backgroundColor: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: '12px',
    overflow: 'hidden',
    boxShadow: '0 8px 32px rgba(28,25,23,0.16)',
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
    backgroundColor: 'var(--accent)',
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
    color: 'var(--text-primary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropEmail: {
    fontFamily: '"DM Sans", sans-serif',
    fontSize: '11px',
    color: 'var(--text-tertiary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  dropSeparator: {
    height: '1px',
    backgroundColor: 'var(--border)',
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
    color: 'var(--text-secondary)',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'background-color 120ms, color 120ms',
  },
  dropItemDanger: {
    color: '#C0504A',
  },
  dropItemIcon: {
    fontSize: '14px',
    width: '18px',
    textAlign: 'center',
    flexShrink: 0,
  },
};

export default Navbar;
