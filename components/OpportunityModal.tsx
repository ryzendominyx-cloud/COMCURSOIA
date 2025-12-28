import React from 'react';
import { Opportunity } from '../types';

interface OpportunityModalProps {
  opportunity: Opportunity | null;
  onClose: () => void;
}

export const OpportunityModal: React.FC<OpportunityModalProps> = ({ opportunity, onClose }) => {
  if (!opportunity) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-6">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-fade-in" 
        onClick={onClose}
      ></div>

      {/* Modal Content */}
      <div className="relative w-full max-w-md bg-white dark:bg-card-dark rounded-3xl border-4 border-text-main shadow-cartoon animate-cartoon-pop flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-6 border-b-4 border-text-main bg-primary/10 rounded-t-2xl flex justify-between items-start">
           <div className="flex gap-4">
               <div 
                 className="h-14 w-14 rounded-xl border-4 border-text-main flex items-center justify-center text-white shadow-cartoon"
                 style={{ backgroundColor: opportunity.colorHex || '#25f46a' }}
               >
                   <span className="material-symbols-outlined text-3xl font-bold">account_balance</span>
               </div>
               <div className="flex flex-col pt-1">
                   <h2 className="text-xl font-black leading-none uppercase italic tracking-tighter text-text-main dark:text-white">
                    {opportunity.title}
                   </h2>
                   <p className="text-xs font-bold text-text-muted uppercase tracking-widest mt-1">{opportunity.role}</p>
               </div>
           </div>
           <button 
            onClick={onClose}
            className="h-10 w-10 border-4 border-text-main rounded-xl bg-white dark:bg-surface-dark flex items-center justify-center shadow-cartoon active:shadow-none active:translate-y-0.5 transition-all"
           >
               <span className="material-symbols-outlined font-black">close</span>
           </button>
        </div>

        <div className="overflow-y-auto no-scrollbar p-6 flex flex-col gap-6">
           {/* Summary Row */}
           <div className="flex flex-wrap gap-2">
               <span className={`px-3 py-1 rounded-lg border-2 border-text-main text-[10px] font-black uppercase shadow-cartoon ${opportunity.status === 'Aberto' ? 'bg-green-400' : 'bg-orange-400'}`}>
                    {opportunity.status}
               </span>
               <span className="px-3 py-1 rounded-lg border-2 border-text-main bg-yellow-400 text-[10px] font-black uppercase shadow-cartoon">
                    {opportunity.location}
               </span>
           </div>

           {/* Salary Box */}
           <div className="bg-primary/5 p-4 rounded-2xl border-4 border-dashed border-text-main">
                <p className="text-[10px] font-black text-text-muted uppercase mb-1">Salário Inicial</p>
                <p className="text-2xl font-black text-text-main dark:text-white italic">{opportunity.salary}</p>
           </div>

           {/* Sections */}
           <div className="flex flex-col gap-6">
                {opportunity.description && (
                    <div>
                        <h3 className="font-black text-xs uppercase italic tracking-widest mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-primary text-sm font-black">description</span>
                            Sobre o Edital
                        </h3>
                        <p className="text-sm font-bold text-gray-600 dark:text-gray-300 leading-relaxed">
                            {opportunity.description}
                        </p>
                    </div>
                )}

                {opportunity.requirements && opportunity.requirements.length > 0 && (
                    <div>
                        <h3 className="font-black text-xs uppercase italic tracking-widest mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-blue-500 text-sm font-black">task_alt</span>
                            Requisitos
                        </h3>
                        <div className="flex flex-col gap-2">
                            {opportunity.requirements?.map((req, i) => (
                                <div key={i} className="flex items-center gap-3 text-sm font-bold bg-gray-50 dark:bg-white/5 p-3 rounded-xl border-2 border-text-main">
                                    <div className="h-2 w-2 rounded-full bg-blue-500 shrink-0"></div>
                                    {req}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {opportunity.benefits && opportunity.benefits.length > 0 && (
                    <div>
                        <h3 className="font-black text-xs uppercase italic tracking-widest mb-2 flex items-center gap-2">
                            <span className="material-symbols-outlined text-pink-500 text-sm font-black">card_giftcard</span>
                            Benefícios Top
                        </h3>
                        <div className="flex flex-wrap gap-2">
                            {opportunity.benefits?.map((ben, i) => (
                                <span key={i} className="px-3 py-2 rounded-xl bg-pink-100 border-2 border-text-main text-pink-700 text-[10px] font-black uppercase shadow-cartoon">
                                    {ben}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
           </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t-4 border-text-main bg-white dark:bg-card-dark rounded-b-2xl">
            <a 
              href={opportunity.registrationUrl} 
              target="_blank" 
              rel="noopener noreferrer"
              className="w-full bg-text-main text-white font-black py-4 rounded-2xl border-2 border-white shadow-cartoon hover:scale-[1.02] active:shadow-none active:translate-y-1 transition-all flex items-center justify-center gap-2 uppercase italic text-sm"
            >
                Abrir Inscrição
                <span className="material-symbols-outlined font-black">open_in_new</span>
            </a>
        </div>
      </div>
    </div>
  );
};