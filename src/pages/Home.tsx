import React, { useEffect } from 'react';
import { GlassCard } from '../components/ui/glass-card';
import { Zap, Users, Activity, Snowflake, ChevronDown } from 'lucide-react';

// Importando imagens (Vite resolve / para public/)
import unidadeSaoJose from '/unidade-sao-jose.jpeg';
import majorImg from '/[Fulltime][Major].jpeg';
import fotoForms from '/[Fulltime][FotoForms].jpeg';
import aulasImg from '/[Fulltime][Aulas][01].jpeg';
import suporte01Img from '/[Fulltime][Suporte][01].jpeg';
import suporte02Img from '/[Fulltime][Suporte][02].jpeg';
import aparelhosImg from '/[Fulltime][Aparelhos][01].jpeg';

const Home: React.FC = () => {
  useEffect(() => {
    // 1. Animação de entrada (Intersection Observer)
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -50px 0px" });

    document.querySelectorAll('.blur-text').forEach(el => observer.observe(el));

    // 2. Lógica do Carrossel Hero (Coverflow 3D Perfeito)
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

    return () => {
      if (cleanupCarrossel) cleanupCarrossel();
    };
  }, []);

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
    <div className="flex flex-col w-full">
      {/* Hero */}
      <div id="hero" data-section="hero" className="pt-24 md:pt-32 bg-transparent scroll-mt-24 md:scroll-mt-32">
        <section className="relative w-full h-fit md:min-h-screen flex items-center justify-center py-hero-page-padding">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl flex flex-col gap-4 md:gap-5 relative z-10">
            <div className="items-center text-center flex flex-col gap-3 md:gap-3">
              <h2 className="blur-text text-center text-4xl md:text-5xl font-medium text-balance">Transforme seu corpo<br />Supere seus limites</h2>
              <p className="text-sm md:text-base font-medium text-gray-300 mt-4 mb-6">Encontre a unidade Fulltime mais próxima de você.</p>
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
      <section id="sobre" className="bg-slate-900/30 py-12 md:py-16 relative overflow-hidden scroll-mt-24 md:scroll-mt-32" aria-label="Feature section">
        <div className="container mx-auto px-6 lg:px-12 max-w-7xl flex flex-col gap-12 relative z-10">
          <div className="flex flex-col items-center justify-center w-full mx-auto text-center">
            <div className="w-full flex flex-col gap-3 items-center">
              <h2 className="blur-text text-white text-4xl md:text-5xl font-medium text-balance">O Melhor para o seu Treino</h2>
              <p className="blur-text text-sm md:text-base font-medium text-gray-400 mt-4 mb-6">Recursos exclusivos pensados para sua performance e bem‑estar.</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <GlassCard className="p-6 md:p-8 h-full w-full flex flex-col">
              <div className="relative z-1 flex flex-col gap-6 items-center text-center h-full">
                <div className="h-20 w-20 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-full shadow-inner flex items-center justify-center">
                  <Zap className="w-full h-full text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold text-white">Treino Inteligente</h3>
                  <p className="text-gray-300">Equipamentos de musculação de última geração para resultados otimizados.</p>
                </div>
                <div className="mt-auto pt-6 w-full overflow-hidden rounded-xl h-36 md:h-40">
                  <img src={aparelhosImg} alt="Gym machines" className="h-full w-full object-cover" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8 h-full w-full flex flex-col">
              <div className="relative z-1 flex flex-col gap-6 items-center text-center h-full">
                <div className="h-20 w-20 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-full shadow-inner flex items-center justify-center">
                  <Users className="w-full h-full text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold text-white">Aulas Coletivas</h3>
                  <p className="text-gray-300">Diversidade de modalidades para todos os níveis e objetivos fitness.</p>
                </div>
                <div className="mt-auto pt-6 w-full overflow-hidden rounded-xl h-36 md:h-40">
                  <img src={aulasImg} alt="Collective classes" className="h-full w-full object-cover" />
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6 md:p-8 h-full w-full flex flex-col">
              <div className="relative z-1 flex flex-col gap-6 items-center text-center h-full">
                <div className="h-20 w-20 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-full shadow-inner flex items-center justify-center">
                  <Activity className="w-full h-full text-white" />
                </div>
                <div className="flex flex-col gap-2">
                  <h3 className="text-2xl font-semibold text-white">Suporte Técnico</h3>
                  <p className="text-gray-300">Profissionais qualificados sempre à disposição para orientar seu treino.</p>
                </div>
                <div className="mt-auto pt-6 w-full overflow-hidden rounded-xl h-36 md:h-40">
                  <img src={suporte01Img} alt="Gym coach" className="h-full w-full object-cover" />
                </div>
              </div>
            </GlassCard>
          </div>
        </div>
      </section>

      {/* Unidades */}
      <div id="unidades" data-section="unidades" className="scroll-mt-24 md:scroll-mt-32">
        <section className="relative py-12 md:py-16 w-full bg-transparent" aria-label="Units section">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center w-full mx-auto text-center">
              <div className="w-full flex flex-col gap-3 items-center">
                <h2 className="blur-text text-4xl md:text-5xl font-medium text-balance">Nossas Unidades</h2>
                <p className="blur-text text-sm md:text-base font-medium text-gray-300 mt-4 mb-6">Encontre a Fulltime mais próxima de você e venha treinar.</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
              <div className="min-h-[22rem]">
                <GlassCard hoverEffect="float" className="p-0 relative h-full w-full overflow-hidden flex flex-col">
                  <div className="w-full aspect-[4/3] md:aspect-video overflow-hidden">
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
              <div className="min-h-[22rem]">
                <GlassCard hoverEffect="float" className="p-0 relative h-full w-full overflow-hidden flex flex-col">
                  <div className="w-full aspect-[4/3] md:aspect-video overflow-hidden">
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
              <div className="min-h-[22rem]">
                <GlassCard hoverEffect="float" className="p-0 relative h-full w-full overflow-hidden flex flex-col">
                  <div className="w-full aspect-[4/3] md:aspect-video overflow-hidden">
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
              <div className="min-h-[22rem]">
                <GlassCard hoverEffect="float" className="p-0 relative h-full w-full overflow-hidden flex flex-col">
                  <div className="w-full aspect-[4/3] md:aspect-video overflow-hidden">
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
      <div id="contato" data-section="contact" className="scroll-mt-24 md:scroll-mt-32">
        <section aria-label="Contact section" className="relative py-12 md:py-16 w-full bg-[#003399]">
          <div className="container mx-auto px-6 lg:px-12 max-w-7xl">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:auto-rows-fr">
              <GlassCard id="formConsultarPlanos-container" className="p-6 md:p-10 flex items-center justify-center h-full w-full flex-col">
                <form id="formConsultarPlanos" className="relative z-1 w-full flex flex-col gap-4" onSubmit={handleConsultarPlanos}>
                  <div className="w-full flex flex-col gap-2 text-center">
                    <h2 className="blur-text text-white text-4xl md:text-5xl font-medium text-balance">Consultar Planos</h2>
                    <p className="blur-text text-sm md:text-base font-medium text-white/80 mt-4 mb-6">Entre em contato para saber mais</p>
                  </div>
                  <div className="w-full flex flex-col gap-4">
                    <input id="nomeConsulta" type="text" placeholder="Nome" aria-label="Nome" className="w-full relative z-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-base text-white placeholder:text-white/60 focus:outline-none" required />
                    <input id="emailConsulta" type="email" placeholder="Email" aria-label="Email" className="w-full relative z-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-base text-white placeholder:text-white/60 focus:outline-none" required />
                    <div className="w-full relative">
                      <select id="unidadeConsulta" required className="w-full relative z-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-base text-white focus:outline-none appearance-none cursor-pointer">
                        <option value="" disabled selected className="bg-[#003399]">Selecione uma Unidade</option>
                        <option value="Unidade Ibituruna" className="bg-[#003399]">Unidade Ibituruna</option>
                        <option value="Unidade São José" className="bg-[#003399]">Unidade São José</option>
                        <option value="Unidade Major Prates" className="bg-[#003399]">Unidade Major Prates</option>
                        <option value="Unidade Planalto" className="bg-[#003399]">Unidade Planalto</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-50" size={16} />
                    </div>
                    <button type="submit" className="mt-4 bg-white hover:bg-gray-100 text-[#003399] font-bold py-3 rounded-xl transition-all duration-300 shadow-lg uppercase tracking-wider text-sm">
                      Enviar Mensagem
                    </button>
                  </div>
                </form>
              </GlassCard>
              <GlassCard className="p-0 overflow-hidden h-full w-full flex flex-col shadow-2xl">
                <img src={fotoForms} alt="Academia" className="w-full h-full object-cover min-h-[400px] md:min-h-full rounded-2xl" />
              </GlassCard>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Home;
