
import React from 'react';
import { ViewState } from '../types';
import { soundService } from '../services/soundService';

interface BottomNavProps {
  currentView: ViewState;
  onNavigate: (view: ViewState) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const navItems = [
    { id: ViewState.HOME, label: 'Início', icon: 'home' },
    { id: ViewState.SUBJECTS, label: 'Estudos', icon: 'menu_book' },
    { id: ViewState.OPPORTUNITIES, label: 'Oportunidades', icon: 'work' }, 
    { id: ViewState.PROFILE, label: 'Perfil', icon: 'person' },
  ];

  const handleNav = (id: ViewState) => {
    soundService.playClick();
    onNavigate(id);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-surface-light dark:bg-surface-dark border-t border-gray-200 dark:border-gray-800 pb-safe pt-2">
      <div className="flex items-center justify-around pb-4 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`flex flex-col items-center justify-center gap-1 p-2 transition-colors ${
                isActive 
                  ? 'text-primary' 
                  : 'text-text-muted dark:text-gray-400 hover:text-primary dark:hover:text-primary'
              }`}
            >
              {isActive ? (
                 <div className="flex items-center justify-center h-8 w-12 rounded-2xl bg-primary/10 mb-1">
                   <span className="material-symbols-outlined fill-current" style={{ fontSize: '24px' }}>{item.icon}</span>
                 </div>
              ) : (
                <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>{item.icon}</span>
              )}
              <span className={`text-[10px] font-bold ${isActive ? 'text-primary' : ''}`}>{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
