import React, { useEffect, useState } from 'react';
import { GlassCard } from './components/ui/glass-card';
import { ShoppingCart, Zap, Users, Activity, Snowflake, X, ChevronDown, MapPin } from 'lucide-react';

// Importando imagens para o Vite
import logo from '/logo.png';
import unidadeSaoJose from '/unidade-sao-jose.jpeg';
import majorImg from '/[Fulltime][Major].jpeg';
import fotoForms from '/[Fulltime][FotoForms].jpeg';
import aulasImg from '/[Fulltime][Aulas][01].jpeg';
import suporte01Img from '/[Fulltime][Suporte][01].jpeg';
import suporte02Img from '/[Fulltime][Suporte][02].jpeg';
import aparelhosImg from '/[Fulltime][Aparelhos][01].jpeg';

function App() {
  const [cartBadge, setCartBadge] = useState(0);
  const [navScrolled, setNavScrolled] = useState(false);
  const [modalOpen, setNavModalOpen] = useState(false);
  const [selectedUnit, setSelectedUnit] = useState('Unidade Ibituruna');

  useEffect(() => {
    // 1. Navbar no Scroll
    const handleScroll = () => {
      setNavScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);

    // 2. Animação de entrada (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.blur-text').forEach(el => observer.observe(el));

    // 3. Canvas de Fundo (Simulação Webild)
    const canvas = document.getElementById('bg-canvas') as HTMLCanvasElement;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      let time = 0;
      const resize = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
      };
      window.addEventListener('resize', resize);
      resize();
      const animate = () => {
        time += 0.005;
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const cx = canvas.width / 2 + Math.sin(time) * (canvas.width * 0.1);
          const cy = canvas.height / 2 + Math.cos(time * 0.8) * (canvas.height * 0.1);
          const radius = Math.max(canvas.width, canvas.height) * 0.6;
          const gradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
          gradient.addColorStop(0, 'rgba(59, 130, 246, 0.04)');
          gradient.addColorStop(1, 'rgba(0, 51, 153, 0)');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
        requestAnimationFrame(animate);
      };
      animate();
    }

    // 4. Lógica do Carrossel Hero (Coverflow 3D Perfeito)
    const carrosselLogic = () => {
      const container = document.getElementById('main-carousel');
      if (!container) return;
      const items = Array.from(container.querySelectorAll('.carousel-item')) as HTMLElement[];
      const total = items.length;
      let activeIndex = 0;
      const updateCarousel = () => {
        items.forEach((item, index) => {
          let diff = (index - activeIndex + total) % total;
          if (diff > Math.floor(total / 2)) diff -= total;
          const absDiff = Math.abs(diff);
          const translateX = diff * 85;
          const translateY = absDiff * 25;
          const translateZ = -absDiff * 150;
          const rotateY = diff !== 0 ? (diff > 0 ? -25 : 25) : 0;
          item.style.transform = `translateX(${translateX}%) translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg)`;
          item.style.zIndex = (total - absDiff).toString();
        });
      };
      updateCarousel();
      const interval = setInterval(() => {
        activeIndex = (activeIndex + 1) % total;
        updateCarousel();
      }, 3500);
      return () => clearInterval(interval);
    };
    const cleanupCarrossel = carrosselLogic();

    // 5. Scroll Suave
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a');
      if (anchor && anchor.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const targetId = anchor.getAttribute('href')?.substring(1);
        if (targetId) {
          const targetElement = document.getElementById(targetId);
          if (targetElement) {
            window.scrollTo({
              top: targetElement.offsetTop,
              behavior: 'smooth'
            });
          }
        }
      }
    };
    document.addEventListener('click', handleAnchorClick);

    // 6. Carrinho Badge
    const updateBadge = () => {
      const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
      const totalItems = cart.reduce((sum: number, item: any) => sum + (item.quantidade || 1), 0);
      setCartBadge(totalItems);
    };
    updateBadge();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('click', handleAnchorClick);
      if (cleanupCarrossel) cleanupCarrossel();
    };
  }, []);

  const toggleCart = () => {
    window.location.href = 'public/suplementos.html';
  };

  const handleConsultarPlanos = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const nome = (form.elements.namedItem('nomeConsulta') as HTMLInputElement).value;
    const email = (form.elements.namedItem('emailConsulta') as HTMLInputElement).value;
    const unidade = (form.elements.namedItem('unidadeConsulta') as HTMLSelectElement).value;
    const numeroZap = "5538999999999";
    const textoBot = `Olá! Gostaria de consultar os planos. Meu nome é ${nome}, e-mail: ${email}. Tenho interesse na unidade: ${unidade}. Poderiam me passar mais opções e informações?`;
    window.open(`https://wa.me/${numeroZap}?text=${encodeURIComponent(textoBot)}`, "_blank");
  };

  return (
    <div className="antialiased text-white">
      {/* Background Global Escuro com Esferas Refrativas */}
      <div className="fixed inset-0 z-[-1] bg-slate-950 overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-blue-600/30 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-teal-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-[40%] left-[40%] w-[25vw] h-[25vw] bg-indigo-500/20 rounded-full mix-blend-screen filter blur-[100px] opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="fixed top-0 left-0 w-full z-50 bg-[#003399]/80 backdrop-blur-lg border-b border-white/10 shadow-lg transition-all duration-300">
        <div className="container mx-auto px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <a href="#hero" className="cursor-pointer flex-shrink-0">
            <img src={logo} alt="Fulltime Academia" className="w-14 md:w-16 h-auto object-contain transition-transform hover:scale-105" />
          </a>
          <div className="w-full md:w-auto flex flex-row justify-between items-center md:gap-8" role="navigation">
            <div className="flex flex-row flex-wrap gap-2 md:gap-4 items-center">
              <a href="#hero" className="px-5 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 text-sm font-medium tracking-wide">Início</a>
              <a href="#sobre" className="px-5 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 text-sm font-medium tracking-wide">Sobre</a>
              <a href="#unidades" className="px-5 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 text-sm font-medium tracking-wide">Unidades</a>
              <a href="#contato" className="px-5 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 text-sm font-medium tracking-wide">Contato</a>
              <a href="public/suplementos.html" className="px-5 py-2 rounded-full text-white/80 hover:text-white hover:bg-white/15 transition-all duration-300 text-sm font-medium tracking-wide">Loja</a>
            </div>
            <button id="checkout-btn" className="relative p-3 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/25 hover:scale-105 transition-all duration-300 flex items-center justify-center text-white" onClick={toggleCart}>
              <ShoppingCart size={20} />
              <span id="cart-badge" className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold w-5 h-5 flex items-center justify-center rounded-full shadow-md">{cartBadge}</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <div id="hero" data-section="hero" className="pt-32">
        <section className="relative w-full h-fit md:min-h-screen flex items-center justify-center py-hero-page-padding">
          <div className="w-full flex flex-col gap-4 md:gap-5 relative z-10">
            <div className="w-content-width mx-auto mt-6 md:mt-0">
              <div className="items-center text-center flex flex-col gap-3 md:gap-3">
                <h2 className="blur-text text-center text-6xl font-medium text-balance">Transforme seu corpo<br />Supere seus limites</h2>
                <p className="text-sm md:text-base font-medium text-gray-300 mt-4 mb-6">Encontre a unidade Fulltime mais próxima de você.</p>
              </div>
            </div>

            {/* Galeria Flutuante */}
            <div className="hero-carousel-wrapper" id="main-carousel">
              <img alt="Locker room" loading="lazy" className="carousel-item" src={suporte01Img} />
              <img alt="Strength training" loading="lazy" className="carousel-item" src={aparelhosImg} />
              <img alt="Modern gym interior" loading="lazy" className="carousel-item" src={aulasImg} />
              <img alt="Gym equipment" loading="lazy" className="carousel-item" src={majorImg} />
              <img alt="Weight room" loading="lazy" className="carousel-item" src={unidadeSaoJose} />
            </div>
          </div>
        </section>
      </div>

      {/* Funcionalidades (Diferenciais) */}
      <section id="sobre" className="bg-slate-950/40 py-20 relative overflow-hidden" aria-label="Feature section">
        <div className="container mx-auto px-4 flex flex-col gap-12 relative z-10">
          <div className="flex flex-col items-center justify-center w-full mx-auto text-center">
            <div className="w-full md:w-8/10 flex flex-col gap-3 items-center">
              <h2 className="blur-text text-white text-6xl font-medium text-balance">O Melhor para o seu Treino</h2>
              <p className="blur-text text-sm md:text-base font-medium text-gray-400 mt-4 mb-6">Recursos exclusivos pensados para sua performance e bem‑estar.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard className="p-8 h-full flex flex-col">
              <div className="relative z-1 flex flex-col gap-6 items-center text-center h-full">
                <div className="h-20 w-20 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-full shadow-inner flex items-center justify-center">
                  <Zap className="w-full h-full text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold text-white">Treino Inteligente</h3>
                  <p className="text-gray-300">Equipamentos de musculação de última geração para resultados otimizados.</p>
                </div>
                <div className="mt-auto pt-6 w-full overflow-hidden rounded-xl h-48">
                  <img src={aparelhosImg} alt="Gym machines" className="h-full w-full object-cover" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 h-full flex flex-col">
              <div className="relative z-1 flex flex-col gap-6 items-center text-center h-full">
                <div className="h-20 w-20 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-full shadow-inner flex items-center justify-center">
                  <Users className="w-full h-full text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold text-white">Aulas Coletivas</h3>
                  <p className="text-gray-300">Diversidade de modalidades para todos os níveis e objetivos fitness.</p>
                </div>
                <div className="mt-auto pt-6 w-full overflow-hidden rounded-xl h-48">
                  <img src={aulasImg} alt="Collective classes" className="h-full w-full object-cover" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-8 h-full flex flex-col">
              <div className="relative z-1 flex flex-col gap-6 items-center text-center h-full">
                <div className="h-20 w-20 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-full shadow-inner flex items-center justify-center">
                  <Activity className="w-full h-full text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold text-white">Suporte Técnico</h3>
                  <p className="text-gray-300">Profissionais qualificados sempre à disposição para orientar seu treino.</p>
                </div>
                <div className="mt-auto pt-6 w-full overflow-hidden rounded-xl h-48">
                  <img src={suporte01Img} alt="Gym coach" className="h-full w-full object-cover" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Unidades */}
      <div id="unidades" data-section="unidades">
        <section className="relative py-20 w-full" aria-label="Units section">
          <div className="w-content-width mx-auto flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center w-full mx-auto text-center">
              <div className="w-full md:w-8/10 flex flex-col gap-3 items-center">
                <h2 className="blur-text text-6xl font-medium text-balance">Nossas Unidades</h2>
                <p className="blur-text text-sm md:text-base font-medium text-gray-300 mt-4 mb-6">Encontre a Fulltime mais próxima de você e venha treinar.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              {/* Unidade Ibituruna */}
              <div className="min-h-[28rem]">
                <GlassCard hoverEffect="float" className="p-0 relative h-full text-foreground overflow-hidden flex flex-col">
                  <div className="w-full aspect-video overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=800&auto=format&fit=crop" alt="Unidade Ibituruna" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 rounded-t-2xl" />
                  </div>
                  <div className="p-8 flex flex-col gap-4 flex-1">
                    <h3 className="text-center font-bold text-xl">Unidade<br />Ibituruna</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed text-center">Av. José Corrêa Machado, 1079, Ibituruna - Montes Claros</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Av.+José+Corrêa+Machado,+1079+-+Ibituruna,+Montes+Claros" target="_blank" rel="noopener noreferrer" className="mt-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/20 uppercase tracking-wider text-sm text-center">
                      Como Chegar
                    </a>
                  </div>
                </GlassCard>
              </div>
              {/* Unidade São José */}
              <div className="min-h-[28rem]">
                <GlassCard hoverEffect="float" className="p-0 relative h-full text-foreground overflow-hidden flex flex-col">
                  <div className="w-full aspect-video overflow-hidden">
                    <img src={unidadeSaoJose} alt="Unidade São José" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 rounded-t-2xl" />
                  </div>
                  <div className="p-8 flex flex-col gap-4 flex-1">
                    <h3 className="text-center font-bold text-xl">Unidade<br />São José</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed text-center">Av. Floriano Neiva, 610, Alto São João - Montes Claros</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Av.+Floriano+Neiva,+610+-+Alto+São+João,+Montes+Claros" target="_blank" rel="noopener noreferrer" className="mt-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/20 uppercase tracking-wider text-sm text-center">
                      Como Chegar
                    </a>
                  </div>
                </GlassCard>
              </div>
              {/* Unidade Major Prates */}
              <div className="min-h-[28rem]">
                <GlassCard hoverEffect="float" className="p-0 relative h-full text-foreground overflow-hidden flex flex-col">
                  <div className="w-full aspect-video overflow-hidden">
                    <img src={majorImg} alt="Unidade Major Prates" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 rounded-t-2xl" />
                  </div>
                  <div className="p-8 flex flex-col gap-4 flex-1">
                    <h3 className="text-center font-bold text-xl">Unidade<br />Major Prates</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed text-center">Av. Francisco Gaetani, 742, Major Prates - Montes Claros</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Av.+Francisco+Gaetani,+742+-+Maj.+Prates,+Montes+Claros" target="_blank" rel="noopener noreferrer" className="mt-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/20 uppercase tracking-wider text-sm text-center">
                      Como Chegar
                    </a>
                  </div>
                </GlassCard>
              </div>
              {/* Unidade Planalto */}
              <div className="min-h-[28rem]">
                <GlassCard hoverEffect="float" className="p-0 relative h-full text-foreground overflow-hidden flex flex-col">
                  <div className="w-full aspect-video overflow-hidden">
                    <img src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?q=80&w=800&auto=format&fit=crop" alt="Unidade Planalto" className="w-full h-full object-cover transition-transform duration-500 hover:scale-110 rounded-t-2xl" />
                  </div>
                  <div className="p-8 flex flex-col gap-4 flex-1">
                    <h3 className="text-center font-bold text-xl">Unidade<br />Planalto</h3>
                    <p className="text-sm text-foreground/70 leading-relaxed text-center">Av. Osmane Barbosa, 1177, Residencial JK - Montes Claros</p>
                    <a href="https://www.google.com/maps/search/?api=1&query=Av.+Osmane+Barbosa,+1177+-+Conj.+Res.+Jk,+Montes+Claros" target="_blank" rel="noopener noreferrer" className="mt-auto bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg shadow-blue-600/20 uppercase tracking-wider text-sm text-center">
                      Como Chegar
                    </a>
                  </div>
                </GlassCard>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Contato */}
      <div id="contato" data-section="contact">
        <section aria-label="Contact section" className="relative py-20 w-full bg-[#003399]">
          <div className="w-content-width mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:auto-rows-fr">
              <div id="formConsultarPlanos-container" className="bg-[#003399]/50 backdrop-blur-xl border border-white/10 text-white rounded-theme-capped p-12 flex items-center justify-center shadow-2xl">
                <form id="formConsultarPlanos" className="relative z-1 w-full flex flex-col gap-6" onSubmit={handleConsultarPlanos}>
                  <div className="w-full flex flex-col gap-2 text-center">
                    <h2 className="blur-text text-white text-6xl font-medium text-balance">Consultar Planos</h2>
                    <p className="blur-text text-sm md:text-base font-medium text-white/80 mt-4 mb-6">Entre em contato para saber mais</p>
                  </div>
                  <div className="w-full flex flex-col gap-4">
                    <input id="nomeConsulta" type="text" placeholder="Nome" aria-label="Nome" className="w-full relative z-1 px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-base text-white placeholder:text-white/60 focus:outline-none" required />
                    <input id="emailConsulta" type="email" placeholder="Email" aria-label="Email" className="w-full relative z-1 px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-base text-white placeholder:text-white/60 focus:outline-none" required />
                    <div className="w-full relative">
                      <select id="unidadeConsulta" required className="w-full relative z-1 px-4 py-4 bg-white/10 border border-white/20 rounded-2xl text-base text-white focus:outline-none appearance-none cursor-pointer">
                        <option value="" disabled selected className="bg-[#003399]">Selecione uma Unidade</option>
                        <option value="Unidade Ibituruna" className="bg-[#003399]">Unidade Ibituruna</option>
                        <option value="Unidade São José" className="bg-[#003399]">Unidade São José</option>
                        <option value="Unidade Major Prates" className="bg-[#003399]">Unidade Major Prates</option>
                        <option value="Unidade Planalto" className="bg-[#003399]">Unidade Planalto</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
                    </div>
                    <button type="submit" className="mt-4 bg-white hover:bg-gray-100 text-[#003399] font-bold py-4 rounded-2xl transition-all duration-300 shadow-lg uppercase tracking-wider text-sm">
                      Enviar Mensagem
                    </button>
                  </div>
                </form>
              </div>
              <div className="overflow-hidden rounded-2xl card md:relative md:h-full shadow-2xl">
                <img src={fotoForms} alt="Academia" className="h-auto w-full md:absolute md:inset-0 md:h-full object-cover" />
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="relative overflow-hidden w-full bg-[#003399] text-white py-10 mt-20">
        <div className="relative w-content-width mx-auto z-10 flex flex-col md:flex-row items-center justify-between gap-8">
          <a href="#hero" className="cursor-pointer">
            <img src={logo} alt="Fulltime Academia" className="h-10 md:h-14 w-auto object-contain transition-transform hover:scale-105" />
          </a>
          <span className="text-white/50 text-sm">© 2026 | KrM Corp</span>
        </div>
      </footer>
    </div>
  );
}

export default App;
