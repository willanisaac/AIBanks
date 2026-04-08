import { useRef, useEffect, useCallback } from 'react';

// Animated stars/particles background inspired by animate-ui/backgrounds/stars
// Creates floating golden particles for a luxurious premium feel

function randomRange(min, max) {
  return Math.random() * (max - min) + min;
}

class Star {
  constructor(canvas) {
    this.canvas = canvas;
    this.reset();
  }
  reset() {
    this.x = Math.random() * this.canvas.width;
    this.y = Math.random() * this.canvas.height;
    this.size = randomRange(0.5, 2);
    this.speed = randomRange(0.1, 0.4);
    this.alpha = randomRange(0.1, 0.6);
    this.alphaDir = randomRange(0.002, 0.008);
  }
  update() {
    this.y -= this.speed;
    this.alpha += this.alphaDir;
    if (this.alpha > 0.7 || this.alpha < 0.05) this.alphaDir *= -1;
    if (this.y < -5) {
      this.y = this.canvas.height + 5;
      this.x = Math.random() * this.canvas.width;
    }
  }
  draw(ctx) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, this.alpha);
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fillStyle = '#ffd700';
    ctx.shadowBlur = this.size * 3;
    ctx.shadowColor = '#ffd700';
    ctx.fill();
    ctx.restore();
  }
}

export default function StarsBackground({
  count = 40,
  className = '',
  style = {},
}) {
  const canvasRef = useRef(null);
  const starsRef = useRef([]);
  const animRef = useRef();

  const animate = useCallback(function animateFrame(ctx, canvas) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    starsRef.current.forEach(star => {
      star.update();
      star.draw(ctx);
    });
    animRef.current = requestAnimationFrame(() => animateFrame(ctx, canvas));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    starsRef.current = Array.from({ length: count }, () => new Star(canvas));
    animate(ctx, canvas);

    const handleResize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [count, animate]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        ...style,
      }}
    />
  );
}
