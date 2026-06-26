/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';

export default function InteractiveBg() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const mouseRef = useRef({ x: -1000, y: -1000, targetX: -1000, targetY: -1000 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    // Grid details
    const gridSize = 40;
    let points: { x: number; y: number; originalX: number; originalY: number; scale: number; rotation: number }[] = [];

    const resize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;

      // Reinitialize grid points
      points = [];
      const cols = Math.ceil(width / gridSize) + 1;
      const rows = Math.ceil(height / gridSize) + 1;

      for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
          const x = c * gridSize;
          const y = r * gridSize;
          points.push({
            x,
            y,
            originalX: x,
            originalY: y,
            scale: 1,
            rotation: 0,
          });
        }
      }
    };

    resize();
    window.addEventListener('resize', resize);

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
    };

    const handleMouseLeave = () => {
      mouseRef.current.targetX = -1000;
      mouseRef.current.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Animation Loop
    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse coordinates interpolation
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.1;
      mouse.y += (mouse.targetY - mouse.y) * 0.1;

      // Draw interactive grid with monospace editorial aesthetics
      ctx.lineWidth = 1;

      points.forEach(p => {
        const dx = mouse.x - p.originalX;
        const dy = mouse.y - p.originalY;
        const dist = Math.sqrt(dx * dx + dy * dy);

        let targetX = p.originalX;
        let targetY = p.originalY;
        let targetScale = 1;
        let color = 'rgba(120, 120, 120, 0.2)';

        if (dist < 150) {
          const force = (150 - dist) / 150;
          // Warp away from mouse slightly
          const angle = Math.atan2(dy, dx);
          targetX = p.originalX - Math.cos(angle) * force * 24;
          targetY = p.originalY - Math.sin(angle) * force * 24;
          targetScale = 1 + force * 0.8;
          color = `rgba(0, 0, 0, ${0.15 + force * 0.35})`;
        } else {
          // Gentle ambient breathing based on sine waves
          const time = Date.now() * 0.001;
          const waveForce = Math.sin(time + (p.originalX * 0.005) + (p.originalY * 0.003)) * 2;
          targetX = p.originalX + waveForce;
        }

        p.x += (targetX - p.x) * 0.2;
        p.y += (targetY - p.y) * 0.2;
        p.scale += (targetScale - p.scale) * 0.2;

        ctx.strokeStyle = color;

        // Draw elegant minimalist "+" cursor intersections
        const size = 3 * p.scale;
        ctx.beginPath();
        ctx.moveTo(p.x - size, p.y);
        ctx.lineTo(p.x + size, p.y);
        ctx.moveTo(p.x, p.y - size);
        ctx.lineTo(p.x, p.y + size);
        ctx.stroke();

        // Occasionally draw subtle pixel grids/coordinates near mouse
        if (dist < 80 && Math.random() < 0.005) {
          ctx.font = '7px monospace';
          ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
          ctx.fillText(`X:${Math.round(p.x)}`, p.x + 8, p.y - 4);
          ctx.fillText(`Y:${Math.round(p.y)}`, p.x + 8, p.y + 4);
        }
      });

      // Subtle vintage vignette edge effects
      const grad = ctx.createRadialGradient(
        width / 2, height / 2, Math.min(width, height) * 0.3,
        width / 2, height / 2, Math.max(width, height) * 0.8
      );
      grad.addColorStop(0, 'rgba(255, 255, 255, 0)');
      grad.addColorStop(1, 'rgba(245, 245, 245, 0.25)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 bg-neutral-50/75 select-none"
      id="canvas-active-background"
    />
  );
}
