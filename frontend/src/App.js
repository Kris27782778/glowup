import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Footer from './Footer';
import Login from './Login';
import Register from './Register';
import ProductDB from './ProductDB';
import Dashboard from './Dashboard';

// 不顯示 Navbar / Footer 的頁面
const STANDALONE_ROUTES = ['/login', '/register'];

function Layout() {
  const { pathname } = useLocation();
  const isStandalone = STANDALONE_ROUTES.includes(pathname);

  return (
    <>
      {!isStandalone && <Navbar />}
      <Routes>
        <Route path="/"          element={<Hero />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/products"  element={<ProductDB />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
      {!isStandalone && <Footer />}
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
