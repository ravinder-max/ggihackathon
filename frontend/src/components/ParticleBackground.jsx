import { useEffect, useRef, useCallback } from 'react';

export default function ParticleBackground() {
  const canvasRef = useRef(null);
  const particlesRef = useRef([]);
  const mouseRef = useRef({ x: 0, y: 0 });
  const animationRef = useRef(null);

  const initParticles = useCallback((width, height) => {
    const particles = [];
    const particleCount = Math.min(Math.floor((width * height) / 15000), 100);

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2 + 1,
        opacity: Math.random() * 0.5 + 0.2,
      });
    }

    return particles;
  }, []);

  const drawParticles = useCallback((ctx, width, height) => {
    ctx.clearRect(0, 0, width, height);

    const particles = particlesRef.current;
    const mouse = mouseRef.current;

    // Update and draw particles
    particles.forEach((particle, i) => {
      // Update position
      particle.x += particle.vx;
      particle.y += particle.vy;

      // Mouse interaction
      const dx = mouse.x - particle.x;
      const dy = mouse.y - particle.y;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 100) {
        const force = (100 - distance) / 100;
        particle.vx -= (dx / distance) * force * 0.02;
        particle.vy -= (dy / distance) * force * 0.02;
      }

      // Boundary check
      if (particle.x < 0 || particle.x > width) particle.vx *= -1;
      if (particle.y < 0 || particle.y > height) particle.vy *= -1;

      // Keep in bounds
      particle.x = Math.max(0, Math.min(width, particle.x));
      particle.y = Math.max(0, Math.min(height, particle.y));

      // Draw particle
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(99, 102, 241, ${particle.opacity})`;
      ctx.fill();

      // Draw connections
      particles.slice(i + 1).forEach((other) => {
        const dist = Math.sqrt(
          Math.pow(particle.x - other.x, 2) + Math.pow(particle.y - other.y, 2)
        );

        if (dist < 100) {
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(99, 102, 241, ${0.2 * (1 - dist / 100)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      });
    });

    animationRef.current = requestAnimationFrame(() => drawParticles(ctx, width, height));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      particlesRef.current = initParticles(canvas.width, canvas.height);
    };

    const handleMouseMove = (e) => {
      mouseRef.current = { x: e.clientX, y: e.clientY };
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    drawParticles(ctx, canvas.width, canvas.height);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [initParticles, drawParticles]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ background: 'transparent' }}
    />
  );
}
