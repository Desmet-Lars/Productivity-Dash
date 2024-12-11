'use client';
import { useEffect, useState } from 'react';

const Confetti = ({ active }) => {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const newParticles = Array.from({ length: 50 }).map((_, i) => ({
        id: i,
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 8 + 4,
        color: [
          '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
          '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71'
        ][Math.floor(Math.random() * 10)],
        rotation: Math.random() * 360,
        duration: Math.random() * 1 + 1,
        delay: Math.random() * 0.5,
      }));
      setParticles(newParticles);

      const timer = setTimeout(() => {
        setParticles([]);
      }, 2000);

      return () => clearTimeout(timer);
    }
  }, [active]);

  if (!active && particles.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            backgroundColor: particle.color,
            transform: `rotate(${particle.rotation}deg)`,
            animation: `
              confetti-fall ${particle.duration}s ease-out forwards,
              confetti-fade 0.75s ease-out ${particle.duration - 0.75}s forwards
            `,
            animationDelay: `${particle.delay}s`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
          }
          100% {
            transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg);
          }
        }
        @keyframes confetti-fade {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default Confetti;
