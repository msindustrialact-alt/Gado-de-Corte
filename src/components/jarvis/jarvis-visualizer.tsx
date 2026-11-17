"use client";

import { useEffect, useRef } from "react";

interface JarvisVisualizerProps {
  isActive: boolean;
  level: number;
  status: "online" | "offline" | "processing";
}

export function JarvisVisualizer({ isActive, level, status }: JarvisVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let animationFrame: number;
    let rotation = 0;

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      rotation += 0.01;

      // Cor baseada no status
      const color = 
        status === "online" ? "47, 227, 154" : // accent
        status === "offline" ? "220, 38, 38" : // red
        "245, 158, 11"; // yellow

      // Círculo central pulsante
      const pulseRadius = 40 + (isActive ? Math.sin(Date.now() / 200) * 10 : 0);
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, pulseRadius);
      gradient.addColorStop(0, `rgba(${color}, 0.8)`);
      gradient.addColorStop(0.5, `rgba(${color}, 0.4)`);
      gradient.addColorStop(1, `rgba(${color}, 0)`);
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
      ctx.fill();

      // Anéis orbitais
      if (isActive) {
        for (let i = 0; i < 3; i++) {
          const radius = 60 + i * 40;
          const segments = 60;
          
          ctx.strokeStyle = `rgba(${color}, ${0.6 - i * 0.15})`;
          ctx.lineWidth = 2;

          for (let j = 0; j < segments; j++) {
            const angle = (j / segments) * Math.PI * 2 + rotation * (i + 1);
            const nextAngle = ((j + 1) / segments) * Math.PI * 2 + rotation * (i + 1);
            
            // Variação na intensidade baseada no nível de áudio
            const intensity = Math.abs(Math.sin(angle * 4 + Date.now() / 500)) * (level / 100);
            
            if (intensity > 0.3) {
              const x1 = centerX + Math.cos(angle) * radius;
              const y1 = centerY + Math.sin(angle) * radius;
              const x2 = centerX + Math.cos(nextAngle) * radius;
              const y2 = centerY + Math.sin(nextAngle) * radius;

              ctx.beginPath();
              ctx.moveTo(x1, y1);
              ctx.lineTo(x2, y2);
              ctx.stroke();
            }
          }
        }

        // Partículas orbitando
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
          const angle = (i / particleCount) * Math.PI * 2 + rotation * 2;
          const radius = 80 + Math.sin(Date.now() / 1000 + i) * 20;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ctx.fillStyle = `rgba(${color}, 0.8)`;
          ctx.beginPath();
          ctx.arc(x, y, 3, 0, Math.PI * 2);
          ctx.fill();

          // Trilha
          ctx.strokeStyle = `rgba(${color}, 0.2)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      } else {
        // Estado idle - apenas círculos sutis
        for (let i = 0; i < 3; i++) {
          const radius = 60 + i * 30;
          ctx.strokeStyle = `rgba(${color}, ${0.3 - i * 0.08})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      animationFrame = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrame);
    };
  }, [isActive, level, status]);

  return (
    <canvas
      ref={canvasRef}
      width={400}
      height={400}
      className="drop-shadow-[0_0_30px_rgba(47,227,154,0.3)]"
    />
  );
}
