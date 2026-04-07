import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './Navbar';
import Hero from './Hero';
import Footer from './Footer';
import Login from './Login';
import Register from './Register';
import ProductDB from './ProductDB';
import Dashboard from './Dashboard';

function Layout() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/"          element={<Hero />} />
        <Route path="/login"     element={<Login />} />
        <Route path="/register"  element={<Register />} />
        <Route path="/products"  element={<ProductDB />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
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
