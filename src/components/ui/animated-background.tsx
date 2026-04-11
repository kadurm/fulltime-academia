import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

interface AnimatedBackgroundProps {
  shopStatus?: 'default' | 'cart' | 'checkout' | 'offer';
}

interface Line {
  x: number;
  y: number;
  speed: number;
  length: number;
  thickness: number;
  opacity: number;
}

interface Lightning {
  x: number;
  y: number;
  life: number;
  segments: { dx: number; dy: number }[];
}

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ shopStatus = 'default' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const location = useLocation();
  const isAdmin = location.pathname === '/admin';
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCartCount = () => {
      const cart = JSON.parse(localStorage.getItem('fulltime_cart') || '[]');
      const count = cart.reduce((acc: number, item: any) => acc + (item.quantidade || 0), 0);
      setCartCount(count);
      console.log("Background State:", { isAdmin, cartCount: count });
    };
    updateCartCount();
    window.addEventListener('cartUpdated', updateCartCount);
    return () => window.removeEventListener('cartUpdated', updateCartCount);
  }, [isAdmin]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let w: number, h: number;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Inicializar Linhas
    let lines: Line[] = Array.from({ length: 12 }, () => ({
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + Math.random() * 200,
      speed: Math.random() * 2 + 1,
      length: Math.random() * 100 + 50,
      thickness: Math.random() * 2 + 1,
      opacity: Math.random() * 0.4 + 0.1
    }));

    let lightnings: Lightning[] = [];

    const createLightning = (x: number, y: number) => {
      const segments = Array.from({ length: 4 }, () => ({
        dx: (Math.random() - 0.5) * 40,
        dy: Math.random() * 30 + 10
      }));
      lightnings.push({ x, y, life: 10, segments });
    };

    const render = () => {
      // Configurações por Status e Contexto
      let bgColor = 'transparent';
      let lineColor = '#003399';
      let lightningColor = '#06b6d4'; // cyan
      let speedMult = 1;

      // Prioridade: Admin > Cart > Default
      if (isAdmin) {
        lineColor = '#FFD700'; // Gold
        lightningColor = '#FFFACD'; // Light Gold
        speedMult = 0.8;
      } else if (cartCount > 0) {
        lineColor = '#3b82f6'; // Vibrant Blue
        lightningColor = '#60a5fa'; // Lighter Blue
        speedMult = 1.2;
      }

      // Sobrescrever com shopStatus se necessário (ex: checkout)
      if (shopStatus === 'checkout') {
        lineColor = '#1e293b';
        lightningColor = '#fbbf24';
        speedMult = 0.6;
      }

      // 1. Limpar Frame
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // 2. Atualizar e Desenhar Linhas
      lines.forEach(l => {
        l.x += l.speed * speedMult;
        l.y -= l.speed * speedMult;

        ctx.beginPath();
        ctx.strokeStyle = hexToRgba(lineColor, l.opacity);
        ctx.lineWidth = l.thickness;
        ctx.moveTo(l.x - l.length, l.y + l.length);
        ctx.lineTo(l.x, l.y);
        ctx.stroke();

        if (l.y <= 0 || l.x >= w) {
          createLightning(l.x, l.y);
          if (Math.random() > 0.5) {
            l.x = Math.random() * w;
            l.y = h + l.length;
          } else {
            l.x = -l.length;
            l.y = Math.random() * h + h/2;
          }
        }
      });

      // 3. Atualizar e Desenhar Raios
      for (let i = lightnings.length - 1; i >= 0; i--) {
        const ln = lightnings[i];
        ctx.beginPath();
        ctx.strokeStyle = hexToRgba(lightningColor, ln.life / 10);
        ctx.lineWidth = 2;
        
        let curX = ln.x;
        let curY = ln.y;
        ctx.moveTo(curX, curY);
        
        ln.segments.forEach(seg => {
          curX += seg.dx;
          curY += seg.dy;
          ctx.lineTo(curX, curY);
        });
        ctx.stroke();

        ln.life--;
        if (ln.life <= 0) lightnings.splice(i, 1);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [shopStatus, isAdmin, cartCount]);

  // Aura de Background Dinâmica com Transição Suave
  const auraColor = isAdmin 
    ? 'rgba(255, 215, 0, 0.6)' 
    : cartCount > 0 
      ? 'rgba(59, 130, 246, 0.8)' 
      : 'rgba(0, 51, 153, 0.2)';

  return (
    <div 
      className="fixed inset-0 pointer-events-none z-0 transition-all duration-[2000ms] ease-in-out bg-[#020617]"
      style={{ backgroundColor: auraColor, backgroundBlendMode: 'overlay' }}
    >
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  );
};

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
