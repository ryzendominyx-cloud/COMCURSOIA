
import React, { useState, useEffect } from 'react';
import { soundService } from '../services/soundService';

interface XPAccumulatorProps {
  amount: number;
  onComplete: () => void;
}

export const XPAccumulator: React.FC<XPAccumulatorProps> = ({ amount, onComplete }) => {
  const [displayXp, setDisplayXp] = useState(0);
  const [show, setShow] = useState(true);

  useEffect(() => {
    let current = 0;
    const duration = 1500;
    const step = amount / (duration / 16);

    const interval = setInterval(() => {
      current += step;
      if (current >= amount) {
        setDisplayXp(amount);
        clearInterval(interval);
        soundService.playLevelUp();
        setTimeout(() => {
          setShow(false);
          setTimeout(onComplete, 500);
        }, 1000);
      } else {
        const nextVal = Math.floor(current);
        if (nextVal !== displayXp) {
          soundService.playXpTick(300 + (nextVal % 200));
          setDisplayXp(nextVal);
        }
      }
    }, 16);

    return () => clearInterval(interval);
  }, [amount]);

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="flex flex-col items-center gap-6 animate-cartoon-pop">
        <div className="relative">
          <div className="h-32 w-32 bg-primary rounded-full border-8 border-text-main shadow-cartoon flex items-center justify-center animate-bounce">
            <span className="material-symbols-outlined text-6xl text-text-main font-black">star</span>
          </div>
          {[...Array(6)].map((_, i) => (
            <div 
              key={i} 
              className="absolute top-1/2 left-1/2 h-4 w-4 bg-yellow-400 rounded-full border-2 border-text-main animate-ping"
              style={{ 
                transform: `rotate(${i * 60}deg) translateY(-80px)`,
                animationDelay: `${i * 0.1}s`
              }}
            ></div>
          ))}
        </div>
        
        <div className="text-center">
          <h2 className="text-4xl font-black text-white italic uppercase tracking-tighter mb-2">XP COLETADO!</h2>
          <div className="bg-white border-4 border-text-main px-8 py-4 rounded-3xl shadow-cartoon">
            <span className="text-6xl font-black italic text-primary-dark">+{displayXp}</span>
          </div>
        </div>
        
        <p className="text-white font-black uppercase italic tracking-widest animate-pulse">Sincronizando com o Edital...</p>
      </div>
    </div>
  );
};
