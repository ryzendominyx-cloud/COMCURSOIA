import React from 'react';
import { Subject } from '../types';

interface SubjectCardProps {
  subject: Subject;
  onClick: () => void;
}

export const SubjectCard: React.FC<SubjectCardProps> = ({ subject, onClick }) => {
  return (
    <div 
      onClick={onClick}
      className="group relative flex flex-col gap-4 rounded-2xl bg-white dark:bg-card-dark p-5 border-4 border-text-main shadow-cartoon transition-transform active:translate-x-1 active:translate-y-1 active:shadow-none cursor-pointer"
    >
      <div className="flex items-start justify-between">
        <div className="flex gap-4">
          <div className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-xl border-4 border-text-main ${subject.colorClass}`}>
            <span className="material-symbols-outlined text-3xl font-bold">{subject.icon}</span>
          </div>
          <div className="flex flex-col pt-1">
            <h3 className="text-lg font-black text-text-main dark:text-white uppercase tracking-tight">{subject.title}</h3>
            <p className="text-xs font-bold text-text-muted dark:text-gray-400">{subject.subtitle}</p>
          </div>
        </div>
        {subject.progress > 80 && (
           <div className="rounded-lg bg-primary border-2 border-text-main px-2 py-0.5 text-[10px] font-black uppercase">
             Expert
           </div>
        )}
      </div>
      
      <div className="flex flex-col gap-1.5">
        <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
          <span>Progresso</span>
          <span>{subject.progress}%</span>
        </div>
        <div className="h-4 w-full rounded-full bg-background-light dark:bg-background-dark border-2 border-text-main overflow-hidden">
          <div 
            className="h-full bg-primary transition-all duration-500" 
            style={{ width: `${subject.progress}%` }}
          ></div>
        </div>
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex -space-x-2">
            {[1,2,3].map(i => (
                <div key={i} className="w-6 h-6 rounded-full border-2 border-text-main bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                    <span className="text-[8px] font-black">AI</span>
                </div>
            ))}
        </div>
        <button className="flex items-center gap-2 rounded-xl bg-primary border-2 border-text-main px-4 py-2 text-xs font-black uppercase hover:bg-primary-dark transition-colors">
          <span>{subject.progress > 0 ? 'Continuar' : 'Bora'}</span>
          <span className="material-symbols-outlined text-sm font-bold">bolt</span>
        </button>
      </div>
    </div>
  );
};