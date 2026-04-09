import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Footer from './Footer';
import Login from './Login';
import Register from './Register';
import ProductDB from './ProductDB';
import Dashboard from './Dashboard';
import './animations.css';

function Layout() {
  const { pathname } = useLocation();

  return (
    <>
      <Navbar />
      {/* key 讓每次換頁都重新掛載，觸發 glow-page 入場動畫 */}
      <div key={pathname} className="glow-page">
        <Routes>
          <Route path="/"          element={<Hero />} />
          <Route path="/login"     element={<Login />} />
          <Route path="/register"  element={<Register />} />
          <Route path="/products"  element={<ProductDB />} />
          <Route path="/dashboard" element={<Dashboard />} />
        </Routes>
      </div>
      <Footer />
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
