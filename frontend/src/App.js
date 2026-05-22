import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useState, useEffect, useRef, lazy, Suspense } from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import Hero from './Hero';
import AuthGate from './components/AuthGate';
import { applyTheme, getStoredSettings } from './hooks/useSettings';
import './animations.css';

const Login = lazy(() => import('./Login'));
const Register = lazy(() => import('./Register'));
const ProductDB = lazy(() => import('./ProductDB'));
const Dashboard = lazy(() => import('./Dashboard'));
const Settings = lazy(() => import('./Settings'));
const Community = lazy(() => import('./Community'));
const QA = lazy(() => import('./QA'));
const AskQuestion = lazy(() => import('./AskQuestion'));
const Admin = lazy(() => import('./Admin'));
const Reverify       = lazy(() => import('./Reverify'));
const ForgotPassword = lazy(() => import('./ForgotPassword'));
const NewPost    = lazy(() => import('./NewPost'));
const PostDetail = lazy(() => import('./PostDetail'));

function RequireAuth({ feature, children }) {
  const user = localStorage.getItem('user');
  if (!user) return <AuthGate feature={feature} />;
  return children;
}

// Apply saved theme before first render
applyTheme(getStoredSettings().theme);

const SPLASH_BG = '#1C1917';
const SPLASH_ACCENT = '#C4897A';

function GlobalSplash({ onDone }) {
  const [phase, setPhase] = useState('in'); // 'in' | 'exit'
  useEffect(() => {
    const t1 = setTimeout(() => setPhase('exit'), 800);
    const t2 = setTimeout(() => onDone(), 1200);
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
  const { pathname } = useLocation();
  const [mountKey, setMountKey] = useState(0);
  const prevPath = useRef(null);

  useEffect(() => {
    if (prevPath.current !== null && prevPath.current !== pathname) {
      setMountKey(k => k + 1);
      window.scrollTo(0, 0);
    }
    prevPath.current = pathname;
  }, [pathname]);

  return (
    <>
      <Navbar />
      <div key={`${pathname}-${mountKey}`} className="glow-page">
        <Suspense fallback={null}>
          <Routes>
            <Route path="/"          element={<Hero />} />
            <Route path="/login"     element={<Login />} />
            <Route path="/register"  element={<Register />} />
            <Route path="/reverify"        element={<Reverify />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/community" element={<RequireAuth feature="community"><Community /></RequireAuth>} />
            <Route path="/community/new" element={<RequireAuth feature="community"><NewPost /></RequireAuth>} />
            <Route path="/community/:id" element={<RequireAuth feature="community"><PostDetail /></RequireAuth>} />
            <Route path="/qa"         element={<RequireAuth feature="qa"><QA /></RequireAuth>} />
            <Route path="/qa/ask"    element={<RequireAuth feature="qa"><AskQuestion /></RequireAuth>} />
            <Route path="/products"  element={<RequireAuth feature="products"><ProductDB /></RequireAuth>} />
            <Route path="/dashboard" element={<RequireAuth feature="dashboard"><Dashboard /></RequireAuth>} />
            <Route path="/settings"  element={<RequireAuth feature="settings"><Settings /></RequireAuth>} />
          </Routes>
        </Suspense>
      </div>
      <Footer />
    </>
  );
}

function App() {
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashDone = () => {
    setSplashDone(true);
    window.scrollTo(0, 0);
  };

  if (!splashDone) {
    return <GlobalSplash onDone={handleSplashDone} />;
  }

  return (
    <BrowserRouter>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/admin/*" element={<Admin />} />
          <Route path="/*"       element={<Layout />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
