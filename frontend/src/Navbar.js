import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';

function Navbar() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) setUser(JSON.parse(stored));
    else setUser(null);
  }, [location]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    navigate('/');
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.left}>
        <Link to="/" style={styles.activeBtn}>首頁</Link>
        <Link to="#" style={styles.link}>社群討論</Link>
        <Link to="/products" style={styles.link}>產品資料庫</Link>
        <Link to="#" style={styles.link}>問答</Link>
      </div>
      <div style={styles.right}>
        {user ? (
          <>
            <Link to="/dashboard" style={styles.activeBtn}>
              👤 {user.nickname}
            </Link>
            <button style={styles.logoutBtn} onClick={handleLogout}>登出</button>
          </>
        ) : (
          <Link to="/login" style={styles.activeBtn}>登入</Link>
        )}
      </div>
    </nav>
  );
}

const styles = {
  nav: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 32px',
    backgroundColor: '#f9f4f4',
  },
  left: {
    display: 'flex',
    gap: '32px',
    alignItems: 'center',
  },
  right: {
    display: 'flex',
    gap: '12px',
    alignItems: 'center',
  },
  activeBtn: {
    backgroundColor: '#f4b8b8',
    borderRadius: '20px',
    padding: '10px 24px',
    fontSize: '16px',
    textDecoration: 'none',
    color: '#1a1a1a',
  },
  link: {
    textDecoration: 'none',
    color: '#1a1a1a',
    fontSize: '16px',
  },
  logoutBtn: {
    backgroundColor: 'transparent',
    border: '1.5px solid #f4b8b8',
    borderRadius: '20px',
    padding: '10px 24px',
    fontSize: '16px',
    cursor: 'pointer',
    color: '#c0405a',
  },
};

export default Navbar;