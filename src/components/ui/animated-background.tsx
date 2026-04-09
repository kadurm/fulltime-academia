import React, { useEffect, useRef } from 'react';

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
      // Configurações por Status
      let bgColor = '#020617';
      let lineColor = '#003399';
      let lightningColor = '#06b6d4'; // cyan
      let speedMult = 1;

      switch (shopStatus) {
        case 'cart':
        case 'offer':
          lineColor = '#7c3aed'; // purple
          lightningColor = '#d946ef'; // magenta
          speedMult = 1.2;
          break;
        case 'checkout':
          bgColor = '#000000';
          lineColor = '#1e293b'; // slate-800
          lightningColor = '#fbbf24'; // amber/gold
          speedMult = 0.6;
          break;
      }

      // 1. Limpar Frame
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // 2. Atualizar e Desenhar Linhas
      lines.forEach(l => {
        l.x += l.speed * speedMult;
        l.y -= l.speed * speedMult;

        // Desenhar rastro da linha
        ctx.beginPath();
        ctx.strokeStyle = hexToRgba(lineColor, l.opacity);
        ctx.lineWidth = l.thickness;
        ctx.moveTo(l.x - l.length, l.y + l.length);
        ctx.lineTo(l.x, l.y);
        ctx.stroke();

        // Colisão com bordas (topo ou direita)
        if (l.y <= 0 || l.x >= w) {
          createLightning(l.x, l.y);
          // Reset para a base ou esquerda
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
  }, [shopStatus]);

  return <canvas ref={canvasRef} className="fixed inset-0 w-full h-full pointer-events-none z-0" />;
};

function hexToRgba(hex: string, opacity: number) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}
