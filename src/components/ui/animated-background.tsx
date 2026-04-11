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

  useEffect(() => {
    console.log("ROTA ATUAL:", location.pathname);
  }, [location]);

  const getThemeColors = () => {
    switch (location.pathname) {
      case '/loja':
        return {
          aura: 'rgba(212, 175, 55, 0.5)',
          line: '#D4AF37',
          lightning: '#FFD700',
          speed: 1.1
        };
      case '/admin':
        return {
          aura: 'rgba(34, 197, 94, 0.5)',
          line: '#22c55e',
          lightning: '#4ade80',
          speed: 0.8
        };
      default: // Home /
        return {
          aura: 'rgba(0, 51, 153, 0.5)',
          line: '#003399',
          lightning: '#06b6d4',
          speed: 1.0
        };
    }
  };

  const theme = getThemeColors();

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
      ctx.clearRect(0, 0, w, h);
      
      const currentLineColor = theme.line;
      const currentLightningColor = theme.lightning;
      const speedMult = theme.speed;

      // 2. Atualizar e Desenhar Linhas
      lines.forEach(l => {
        l.x += l.speed * speedMult;
        l.y -= l.speed * speedMult;

        ctx.beginPath();
        ctx.strokeStyle = hexToRgba(currentLineColor, l.opacity);
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
        ctx.strokeStyle = hexToRgba(currentLightningColor, ln.life / 10);
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
  }, [theme]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 bg-[#030712]">
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

