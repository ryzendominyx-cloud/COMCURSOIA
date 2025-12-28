import React from 'react';

interface ProfessorMascotProps {
  state: 'neutral' | 'happy' | 'sad' | 'thinking';
}

export const ProfessorMascot: React.FC<ProfessorMascotProps> = ({ state }) => {
  const getAvatar = () => {
    switch(state) {
      case 'happy': return '🤩';
      case 'sad': return '😔';
      case 'thinking': return '🧐';
      default: return '👨‍🏫';
    }
  };

  const getMessage = () => {
    switch(state) {
      case 'happy': return 'Excelente! Você está no caminho da aprovação!';
      case 'sad': return 'Não desanime! Errar faz parte do aprendizado.';
      case 'thinking': return 'Deixe-me preparar esse material para você...';
      default: return 'Olá, futuro concursado! Vamos estudar?';
    }
  };

  const getAnimationClass = () => {
    switch(state) {
      case 'happy': return 'animate-cartoon-bounce';
      case 'sad': return 'animate-cartoon-shake';
      case 'thinking': return 'animate-pulse';
      default: return 'animate-cartoon-pop';
    }
  };

  return (
    <div className="flex flex-col items-center gap-2 p-4">
        <div className="relative" key={state}>
            <div className={`w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center text-5xl border-4 border-text-main shadow-cartoon transition-all duration-300 ${getAnimationClass()}`}>
                {getAvatar()}
            </div>
            {state !== 'neutral' && (
                <div className="absolute -top-2 -right-2 bg-white dark:bg-card-dark rounded-full p-1.5 shadow-cartoon border-2 border-text-main animate-cartoon-pop">
                    <span className="material-symbols-outlined text-primary text-sm font-black">
                        {state === 'happy' ? 'auto_awesome' : state === 'sad' ? 'sentiment_dissatisfied' : 'psychology'}
                    </span>
                </div>
            )}
        </div>
        <div className="bg-white dark:bg-card-dark px-4 py-2 rounded-2xl shadow-cartoon border-4 border-text-main max-w-[220px] text-center mt-2 animate-cartoon-pop">
            <p className="text-[10px] font-black leading-tight uppercase italic">{getMessage()}</p>
        </div>
    </div>
  );
};