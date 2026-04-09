import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import Navbar from './Navbar';
import Hero from './Hero';
import Footer from './Footer';
import Login from './Login';
import Register from './Register';
import ProductDB from './ProductDB';
import Dashboard from './Dashboard';
import Settings from './Settings';
import { applyTheme, getStoredSettings } from './hooks/useSettings';
import './animations.css';

// Apply saved theme before first render
applyTheme(getStoredSettings().theme);

const SPLASH_BG = '#1C1917';
const SPLASH_ACCENT = '#C4897A';

function GlobalSplash({ onDone }) {
  const [phase, setPhase] = useState('in'); // 'in' | 'exit'
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 2000);
    const t2 = setTimeout(() => onDone(), 2750);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: SPLASH_BG,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      overflow: 'hidden',
      animation: phase === 'exit'
        ? 'glow-splash-rise 750ms cubic-bezier(0.76,0,0.24,1) forwards'
        : 'none',
    }}>
      <div style={{ position: 'absolute', width: '600px', height: '600px', borderRadius: '50%',
        border: '1px solid rgba(196,137,122,0.1)', top: '-160px', right: '-160px', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: '360px', height: '360px', borderRadius: '50%',
        border: '1px solid rgba(196,137,122,0.07)', bottom: '-80px', left: '-80px', pointerEvents: 'none' }} />
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1 }}>
        <h1 style={{
          fontFamily: '"Cormorant Garamond","Noto Serif TC",serif',
          fontSize: '100px', fontWeight: 300, letterSpacing: '0.18em',
          color: '#F7F4F2', margin: 0, lineHeight: 1,
          animation: 'glow-splash-text 800ms cubic-bezier(0.22,1,0.36,1) 150ms both',
        }}>GLŌW</h1>
        <div style={{
          width: '48px', height: '1px', backgroundColor: SPLASH_ACCENT,
          margin: '28px auto 24px',
          animation: 'glow-splash-line 600ms cubic-bezier(0.22,1,0.36,1) 600ms both',
        }} />
        <p style={{
          fontFamily: '"DM Sans","Noto Sans TC",sans-serif',
          fontSize: '12px', fontWeight: 400, letterSpacing: '0.22em',
          color: 'rgba(196,137,122,0.75)', margin: 0,
          animation: 'glow-splash-sub 500ms ease 800ms both',
        }}>輔大美妝交流平台</p>
      </div>
    </div>
  );
}

function Layout() {
  const { pathname, state } = useLocation();
  const [showSplash, setShowSplash] = useState(false);
  const [mountKey,   setMountKey]   = useState(0);
  const prevState = useRef(null);

  useEffect(() => {
    // 只在 state 物件真正變動（不是同一個參照）時才觸發
    if (state?.showSplash && state !== prevState.current) {
      prevState.current = state;
      setMountKey(k => k + 1); // 強制子路由重新掛載（讓 Hero 重讀 localStorage）
      setShowSplash(true);
    }
  }, [pathname, state]);

  return (
    <>
      <Navbar />
      {/* key 改變時強制重新掛載，觸發 glow-page 入場動畫 */}
      <div key={`${pathname}-${mountKey}`} className="glow-page">
        <Routes>
          <Route path="/"          element={<Hero />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/products"  element={<ProductDB />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/settings"  element={<Settings />} />
        </Routes>
      </div>
      <Footer />
      {showSplash && <GlobalSplash onDone={() => setShowSplash(false)} />}
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}

export default App;
