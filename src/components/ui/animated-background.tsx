import React, { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
  shopStatus?: 'default' | 'offer' | 'checkout';
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
    let phase = 0;

    const resize = () => {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resize);
    resize();

    // Partículas
    const particles = Array.from({ length: 15 }, () => ({
      x: Math.random(),
      y: Math.random(),
      size: Math.random() * 4 + 2,
      speed: Math.random() * 0.001 + 0.0005,
      opacity: Math.random() * 0.5 + 0.2
    }));

    const render = () => {
      // 1. Limpar fundo e preencher base sólida
      let bgColor = '#020617';
      if (shopStatus === 'checkout') bgColor = '#000000';
      
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, w, h);

      // 2. Configurações de Cor e Velocidade
      let baseColor = '#003399';
      let waveSpeed = 0.02;

      if (shopStatus === 'offer') {
        baseColor = '#4c1d95';
        waveSpeed = 0.04;
      } else if (shopStatus === 'checkout') {
        waveSpeed = 0.01;
      }

      // 3. Renderizar Ondas Senoidais
      const drawWave = (offset: number, amplitude: number, opacity: number, speedMult: number) => {
        ctx.beginPath();
        ctx.moveTo(0, h * 0.7);
        for (let x = 0; x <= w; x += 10) {
          const y = h * 0.75 + Math.sin(x * 0.005 + phase * speedMult + offset) * amplitude;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        ctx.fillStyle = hexToRgba(baseColor, opacity);
        ctx.fill();
      };

      drawWave(0, 40, 0.1, 1);
      drawWave(2, 30, 0.2, 0.8);
      drawWave(4, 50, 0.15, 1.2);

      // 4. Renderizar Partículas (Luz Refratada)
      particles.forEach(p => {
        p.y -= p.speed;
        if (p.y < -0.1) p.y = 1.1;

        const px = p.x * w;
        const py = p.y * h;

        const grad = ctx.createRadialGradient(px, py, 0, px, py, p.size * 10);
        grad.addColorStop(0, hexToRgba('#ffffff', p.opacity));
        grad.addColorStop(1, 'transparent');

        ctx.beginPath();
        ctx.arc(px, py, p.size * 10, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      phase += waveSpeed;
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
