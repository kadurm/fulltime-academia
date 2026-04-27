import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AnimatedBackground } from './components/ui/animated-background';
import { ShoppingCart, LogOut } from 'lucide-react';
import Home from './pages/Home';
import Loja from './pages/Loja';
import Admin from './pages/Admin';
import Checkout from './pages/Checkout';
import { HelmetProvider } from 'react-helmet-async';
import { CartSidebar } from './components/ui/cart-sidebar';

// Importando imagem da logo
import logo from '/logo.png';

// Componente para resetar o scroll ao trocar de rota
const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Navbar = ({ cartBadge, setIsCartOpen }: { cartBadge: number, setIsCartOpen: (open: boolean) => void }) => {
  const location = useLocation();
  const isAdminPath = location.pathname === "/admin";

  const handleLogout = () => {
    sessionStorage.removeItem("krm_admin_auth");
    window.location.href = "/";
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#003399]/70 backdrop-blur-2xl border-b border-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.1)] transition-all duration-300">
      <div className="container mx-auto px-6 lg:px-12 max-w-7xl py-4 flex flex-col md:flex-row justify-between items-center gap-4">
        <Link to="/" className="cursor-pointer flex-shrink-0" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src={logo} alt="Fulltime Academia" className="w-14 md:w-16 h-auto object-contain transition-transform hover:scale-105" />
        </Link>
        <div className="w-full md:w-auto flex flex-row justify-between items-center md:gap-8" role="navigation">
          <div className="flex flex-row flex-nowrap w-full justify-between gap-0 md:gap-4 items-center">
            <Link to="/" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>Início</Link>
            <a href="/#sobre" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Sobre</a>
            <a href="/#unidades" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Unidades</a>
            <a href="/#contato" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Contato</a>
            <Link to="/loja" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Loja</Link>
          </div>
          
          {isAdminPath ? (
            <button 
              onClick={handleLogout}
              className="px-4 py-2 rounded-full bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all duration-300 flex items-center gap-2 text-xs md:text-sm font-bold ml-4"
            >
              <LogOut size={16} />
              Sair
            </button>
          ) : (
            <button id="checkout-btn" className="relative p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 flex items-center justify-center text-white flex-shrink-0 scale-90 md:scale-100 origin-right ml-1" onClick={() => setIsCartOpen(true)}>
              <ShoppingCart size={20} />
              <span id="cart-badge" className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">{cartBadge}</span>
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

function App() {
  const [cartBadge, setCartBadge] = useState(0);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const handleCartUpdate = () => {
      const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
      if (cart.length > 0) {
        setIsCartOpen(true);
      } else {
        setIsCartOpen(false);
      }
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  useEffect(() => {
    // Carrinho Badge Update
    const updateBadge = () => {
      const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
      const totalItems = cart.reduce((sum: number, item: any) => sum + (item.quantidade || 1), 0);
      setCartBadge(totalItems);
    };
    updateBadge();
    
    // Escutar por mudanças no localStorage e evento customizado
    window.addEventListener('storage', updateBadge);
    window.addEventListener('cartUpdated', updateBadge);
    return () => {
      window.removeEventListener('storage', updateBadge);
      window.removeEventListener('cartUpdated', updateBadge);
    };
  }, []);

  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <AnimatedBackground shopStatus="default" />
        
        <div className="relative z-10 w-full min-h-screen antialiased text-white">
          <Navbar cartBadge={cartBadge} setIsCartOpen={setIsCartOpen} />

          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/loja" element={<Loja />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/checkout" element={<Checkout />} />
          </Routes>

          <footer className="relative w-full z-10 bg-[#003399]/70 backdrop-blur-2xl border-t border-white/20 text-white py-10 mt-20 shadow-[0_-15px_30px_rgba(0,0,0,0.4)]">
            <div className="container mx-auto px-6 lg:px-12 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
              <Link to="/" className="cursor-pointer">
                <img src={logo} alt="Fulltime Academia" className="h-10 md:h-14 w-auto object-contain transition-transform hover:scale-105" />
              </Link>
              <span className="text-white/50 text-sm">© 2026 | KrM Corp</span>
            </div>
          </footer>

          <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
        </div>
      </Router>
    </HelmetProvider>
  );
}

export default App;
