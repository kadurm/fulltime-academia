import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AnimatedBackground } from './components/ui/animated-background';
import { ShoppingCart } from 'lucide-react';
import Home from './pages/Home';
import Loja from './pages/Loja';

// Importando imagem da logo
import logo from '/logo.png';

function App() {
  const [cartBadge, setCartBadge] = useState(0);

  useEffect(() => {
    // Carrinho Badge Update
    const updateBadge = () => {
      const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
      const totalItems = cart.reduce((sum: number, item: any) => sum + (item.quantidade || 1), 0);
      setCartBadge(totalItems);
    };
    updateBadge();
    
    // Escutar por mudanças no localStorage para o badge
    window.addEventListener('storage', updateBadge);
    return () => window.removeEventListener('storage', updateBadge);
  }, []);

  const toggleCart = () => {
    // Por enquanto redireciona para a loja se estiver na home ou abre lateral se implementarmos futuramente
    // Se estivermos usando rotas, talvez queiramos um modal lateral global
  };

  return (
    <Router>
      <AnimatedBackground shopStatus="default" />
      
      <div className="relative z-10 w-full min-h-screen antialiased text-white">
        <nav className="fixed top-0 left-0 w-full z-50 bg-[#003399]/70 backdrop-blur-2xl border-b border-white/20 shadow-[0_15px_30px_rgba(0,0,0,0.4),inset_0_-1px_0_rgba(255,255,255,0.1)] transition-all duration-300">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl py-4 flex flex-col md:flex-row justify-between items-center gap-4">
            <Link to="/" className="cursor-pointer flex-shrink-0">
              <img src={logo} alt="Fulltime Academia" className="w-14 md:w-16 h-auto object-contain transition-transform hover:scale-105" />
            </Link>
            <div className="w-full md:w-auto flex flex-row justify-between items-center md:gap-8" role="navigation">
              <div className="flex flex-row flex-nowrap w-full justify-between gap-0 md:gap-4 items-center">
                <Link to="/" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Início</Link>
                <a href="/#sobre" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Sobre</a>
                <a href="/#unidades" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Unidades</a>
                <a href="/#contato" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Contato</a>
                <Link to="/loja" className="px-1 md:px-5 py-2 rounded-full text-white hover:bg-white/20 transition-all duration-300 text-[10px] md:text-sm font-medium tracking-tighter md:tracking-wide whitespace-nowrap">Loja</Link>
              </div>
              <button id="checkout-btn" className="relative p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 flex items-center justify-center text-white flex-shrink-0 scale-90 md:scale-100 origin-right ml-1" onClick={toggleCart}>
                <ShoppingCart size={20} />
                <span id="cart-badge" className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">{cartBadge}</span>
              </button>
            </div>
          </div>
        </nav>

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/loja" element={<Loja />} />
        </Routes>

        <footer className="relative w-full z-10 bg-[#003399]/70 backdrop-blur-2xl border-t border-white/20 text-white py-10 mt-20 shadow-[0_-15px_30px_rgba(0,0,0,0.4)]">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl flex flex-col md:flex-row items-center justify-between gap-8">
            <Link to="/" className="cursor-pointer">
              <img src={logo} alt="Fulltime Academia" className="h-10 md:h-14 w-auto object-contain transition-transform hover:scale-105" />
            </Link>
            <span className="text-white/50 text-sm">© 2026 | KrM Corp</span>
          </div>
        </footer>
      </div>
    </Router>
  );
}

export default App;
