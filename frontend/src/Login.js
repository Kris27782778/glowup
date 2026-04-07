import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [studentId, setStudentId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ student_id: studentId, password }),
      });
      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.user));
        navigate('/dashboard');
      } else {
        setError(data.error || '登入失敗');
      }
    } catch (err) {
      setError('伺服器連線失敗，請稍後再試');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <p style={styles.eyebrow}>GLOW UP</p>
        <h2 style={styles.title}>登入</h2>
        <p style={styles.subtitle}>輔大校務帳號登入</p>
        <input
          style={styles.input}
          type="text"
          placeholder="學號"
          value={studentId}
          onChange={e => { setStudentId(e.target.value); setError(''); }}
        />
        <input
          style={styles.input}
          type="password"
          placeholder="密碼"
          value={password}
          onChange={e => { setPassword(e.target.value); setError(''); }}
        />
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} onClick={handleLogin}>登入</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '80vh',
    backgroundColor: '#fdf6f7',
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '360px',
    boxShadow: '0 4px 24px rgba(192,64,90,0.08)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
  },
  eyebrow: {
    fontSize: '10px',
    letterSpacing: '4px',
    color: '#f4b8c4',
    margin: 0,
  },
  title: {
    fontFamily: 'Georgia, serif',
    fontSize: '28px',
    margin: 0,
    color: '#1a1a1a',
    fontWeight: 'normal',
  },
  subtitle: {
    fontSize: '13px',
    color: '#bbb',
    margin: '0 0 8px 0',
  },
  input: {
    padding: '14px 16px',
    borderRadius: '12px',
    border: '1.5px solid #f0e8ea',
    fontSize: '14px',
    outline: 'none',
    backgroundColor: '#fffafa',
  },
  error: {
    color: '#c0405a',
    fontSize: '13px',
    margin: 0,
  },
  btn: {
    padding: '14px',
    backgroundColor: '#c0405a',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    fontSize: '15px',
    cursor: 'pointer',
    fontWeight: 'bold',
    marginTop: '4px',
  },
};

export default Login;