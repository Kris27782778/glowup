import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      navigate('/login');
    } else {
      setUser(JSON.parse(stored));
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  if (!user) return null;

  return (
    <div style={styles.page}>
      <div style={styles.left}>
        <div style={styles.profileCard}>
          <div style={styles.avatar}>👤</div>
          <p style={styles.nickname}>{user.nickname}</p>
          <p style={styles.department}>{user.department_grade}</p>
          <p style={styles.email}>{user.email}</p>
          <hr style={styles.divider} />
          <p style={styles.skinType}>膚質：{user.skin_type}</p>
        </div>
        <button style={styles.logoutBtn} onClick={handleLogout}>登出</button>
      </div>

      <div style={styles.right}>
        <div style={styles.block}>
          <p style={styles.blockTitle}>貼文管理</p>
        </div>
        <div style={styles.block}>
          <p style={styles.blockTitle}>美妝收藏庫</p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    display: 'flex',
    gap: '24px',
    padding: '40px',
    backgroundColor: '#fce8ec',
    minHeight: '80vh',
  },
  left: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
    width: '260px',
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px 24px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '8px',
    boxShadow: '0 2px 12px rgba(192,64,90,0.08)',
  },
  avatar: {
    fontSize: '64px',
    backgroundColor: '#fce8ec',
    borderRadius: '50%',
    width: '100px',
    height: '100px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  nickname: {
    fontSize: '20px',
    fontWeight: 'bold',
    fontFamily: 'Georgia, serif',
    margin: 0,
    color: '#1a1a1a',
  },
  department: {
    fontSize: '13px',
    color: '#888',
    margin: 0,
  },
  email: {
    fontSize: '12px',
    color: '#bbb',
    margin: 0,
  },
  divider: {
    width: '100%',
    border: 'none',
    borderTop: '1px solid #f0e8ea',
    margin: '8px 0',
  },
  skinType: {
    fontSize: '13px',
    color: '#c0405a',
    margin: 0,
    fontWeight: 'bold',
  },
  logoutBtn: {
    padding: '12px',
    backgroundColor: 'white',
    color: '#c0405a',
    border: '1.5px solid #f4b8c4',
    borderRadius: '12px',
    fontSize: '14px',
    cursor: 'pointer',
  },
  right: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
  },
  block: {
    backgroundColor: 'white',
    borderRadius: '20px',
    padding: '32px',
    flex: 1,
    boxShadow: '0 2px 12px rgba(192,64,90,0.08)',
  },
  blockTitle: {
    fontSize: '18px',
    fontFamily: 'Georgia, serif',
    margin: 0,
    color: '#1a1a1a',
  },
};

export default Dashboard;