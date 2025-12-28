
import React, { useState, useEffect, useMemo } from 'react';
import { ViewState, Subject, Topic, UserStats, Opportunity, User } from './types';
import { MOCK_OPPORTUNITIES } from './constants';
import { BottomNav } from './components/BottomNav';
import { SubjectCard } from './components/SubjectCard';
import { StudySession } from './components/StudySession';
import { QuickQuizSession } from './components/QuickQuizSession';
import { OpportunityModal } from './components/OpportunityModal';
import { AuthScreen } from './components/AuthScreen';
import { XPAccumulator } from './components/XPAccumulator';
import { saveUser, getCurrentSession, clearSession } from './services/storageService';
import { generateStudyPlan } from './services/geminiService';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.AUTH);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [userStats, setUserStats] = useState<UserStats | null>(null);
  const [activeSubject, setActiveSubject] = useState<Subject | null>(null);
  const [activeTopic, setActiveTopic] = useState<Topic | null>(null);
  const [selectedOpportunity, setSelectedOpportunity] = useState<Opportunity | null>(null);
  const [isGeneratingTopics, setIsGeneratingTopics] = useState(false);
  const [accumulatingXp, setAccumulatingXp] = useState<number | null>(null);

  // Inicialização: Restaura o usuário logado e seus dados do "banco"
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
      setSubjects(session.subjectsProgress || []);
      setUserStats(session.stats);
      setCurrentView(ViewState.HOME);
    }
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setSubjects(user.subjectsProgress || []);
    setUserStats(user.stats);
    setCurrentView(ViewState.HOME);
    // saveUser agora é async e salva no Supabase, mas não precisamos esperar aqui pois o AuthScreen já chamou
    saveUser(user); 
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setSubjects([]);
    setUserStats(null);
    setCurrentView(ViewState.AUTH);
  };

  const handleSubjectClick = async (subject: Subject) => {
    const currentSubjectState = subjects.find(s => s.id === subject.id) || subject;
    setActiveSubject(currentSubjectState);
    setCurrentView(ViewState.SUBJECTS);

    if ((!currentSubjectState.topics || currentSubjectState.topics.length === 0) && currentUser) {
        setIsGeneratingTopics(true);
        try {
          const generatedTitles = await generateStudyPlan(currentSubjectState.title, currentUser.targetContest);
          const newTopics: Topic[] = generatedTitles.map((title, index) => ({
              id: `${currentSubjectState.id}-${Date.now()}-${index}`,
              title: title,
              isCompleted: false
          }));
          const updatedSubject = { ...currentSubjectState, topics: newTopics, totalTopics: newTopics.length };
          
          const updatedSubjects = subjects.map(s => s.id === updatedSubject.id ? updatedSubject : s);
          setSubjects(updatedSubjects);
          setActiveSubject(updatedSubject);
          
          // Salva progresso no Supabase
          const updatedUser = { ...currentUser, subjectsProgress: updatedSubjects };
          setCurrentUser(updatedUser); // Update local state immediately
          saveUser(updatedUser); // Sync DB in background
        } catch (error) {
          console.error("Erro ao gerar tópicos", error);
        } finally {
          setIsGeneratingTopics(false);
        }
    }
  };

  const handleTopicClick = (subject: Subject, topic: Topic) => {
    setActiveSubject(subject);
    setActiveTopic(topic);
    setCurrentView(ViewState.STUDY_SESSION);
  };

  const handleCompleteLesson = () => {
    setAccumulatingXp(650); // XP por aula concluída
  };

  const handleQuickQuizFinish = (score: number) => {
    if (score > 0) {
        setAccumulatingXp(score * 100); // 100 XP por acerto no quiz
    } else {
        setCurrentView(ViewState.HOME);
    }
  };

  const finishXpAccumulation = () => {
    if (!userStats || accumulatingXp === null || !currentUser) return;
    
    // Cálculos de Progressão e Level Up
    let newXp = userStats.xp + accumulatingXp;
    let newLevel = userStats.level;
    let nextXp = userStats.nextLevelXp;

    // Lógica ajustada: Se atingir o próximo nível, zera o XP e aumenta a meta em 50%
    if (newXp >= nextXp) {
        newLevel += 1;
        newXp = 0; 
        nextXp = Math.round(nextXp * 1.5);
    }
    
    const newStats: UserStats = { 
        ...userStats, 
        xp: newXp, 
        level: newLevel,
        nextLevelXp: nextXp,
        hoursStudied: userStats.hoursStudied + (activeTopic ? 1 : 0),
        questionsAnswered: userStats.questionsAnswered + (activeTopic ? 5 : 0)
    };
    
    // Marca tópico como concluído se for o caso
    let updatedSubjects = [...subjects];
    if (activeSubject && activeTopic) {
        updatedSubjects = subjects.map(s => {
            if (s.id === activeSubject.id) {
                const updatedTopics = (s.topics || []).map(t => t.id === activeTopic.id ? { ...t, isCompleted: true } : t);
                const completedCount = updatedTopics.filter(t => t.isCompleted).length;
                return { ...s, topics: updatedTopics, progress: Math.round((completedCount / (s.totalTopics || 1)) * 100) };
            }
            return s;
        });
        setSubjects(updatedSubjects);
    }

    setUserStats(newStats);
    
    // SINCRONIZAÇÃO TOTAL COM O BANCO (Local + Supabase)
    const updatedUser: User = { 
        ...currentUser, 
        stats: newStats, 
        subjectsProgress: updatedSubjects 
    };
    setCurrentUser(updatedUser);
    saveUser(updatedUser);

    setAccumulatingXp(null);
    setActiveTopic(null);
    setCurrentView(ViewState.HOME);
  };

  const filteredOpportunities = useMemo(() => {
    if (!currentUser) return MOCK_OPPORTUNITIES;
    const focus = (currentUser.targetContest || "").toLowerCase();
    return [...MOCK_OPPORTUNITIES].sort((a, b) => {
        const aMatch = a.title.toLowerCase().includes(focus) || a.role.toLowerCase().includes(focus);
        const bMatch = b.title.toLowerCase().includes(focus) || b.role.toLowerCase().includes(focus);
        if (aMatch && !bMatch) return -1;
        if (!aMatch && bMatch) return 1;
        return 0;
    });
  }, [currentUser?.targetContest]);

  const renderHome = () => (
    <div className="flex flex-col gap-6 px-6 pb-28 animate-fade-in pt-12">
      <header className="flex items-center justify-between">
        <div className="animate-cartoon-pop">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-sm font-black">verified_user</span>
            <span className="text-[10px] font-black uppercase bg-text-main text-primary border-2 border-text-main px-2 py-0.5 rounded shadow-cartoon">
                {currentUser?.targetContest}
            </span>
          </div>
          <h1 className="text-3xl font-black mt-2 uppercase italic tracking-tighter leading-none">VAI COM TUDO,<br/>{currentUser?.name.split(' ')[0]}!</h1>
        </div>
        <button onClick={handleLogout} className="h-12 w-12 flex items-center justify-center rounded-2xl border-4 border-text-main bg-white shadow-cartoon active:translate-y-1 active:shadow-none transition-all">
          <span className="material-symbols-outlined text-red-500 font-bold">logout</span>
        </button>
      </header>

      <div className="bg-primary border-4 border-text-main p-6 rounded-[2.5rem] shadow-cartoon flex justify-between items-center cursor-pointer transition-all hover:scale-[1.03] active:scale-100" onClick={() => setCurrentView(ViewState.QUICK_QUIZ)}>
         <div>
            <h3 className="font-black text-2xl uppercase italic leading-none">SPRINT DE XP</h3>
            <p className="text-[10px] font-black uppercase tracking-widest mt-1 opacity-80">100 XP por cada acerto!</p>
         </div>
         <div className="h-14 w-14 bg-white border-4 border-text-main rounded-2xl flex items-center justify-center shadow-cartoon">
            <span className="material-symbols-outlined text-3xl font-bold animate-pulse">flash_on</span>
         </div>
      </div>

      <div className="flex flex-col gap-6">
        <h2 className="text-xs font-black uppercase tracking-[0.2em] border-b-4 border-text-main pb-1 inline-block w-fit">Seu Edital</h2>
        <div className="flex flex-col gap-5">
            {subjects && subjects.length > 0 ? (
                subjects.map(subject => (
                  <SubjectCard key={subject.id} subject={subject} onClick={() => handleSubjectClick(subject)} />
                ))
            ) : (
                <div className="p-10 text-center border-4 border-dashed border-text-main rounded-3xl opacity-40">
                    <p className="text-xs font-black uppercase">Nenhuma matéria vinculada.</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="relative min-h-screen max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-x-hidden border-x-4 border-text-main">
      {currentView === ViewState.AUTH ? (
         <AuthScreen onLogin={handleLogin} />
      ) : (
         <>
            <main className="h-full overflow-y-auto no-scrollbar">
                {currentView === ViewState.HOME && renderHome()}
                {currentView === ViewState.SUBJECTS && (
                   <div className="pb-28 pt-10 px-6">
                       <button onClick={() => setCurrentView(ViewState.HOME)} className="mb-6 flex items-center gap-2 font-black uppercase text-[10px] border-4 border-text-main bg-white px-4 py-2 rounded-xl shadow-cartoon">
                          <span className="material-symbols-outlined font-black text-sm">arrow_back</span> Voltar
                       </button>
                       {isGeneratingTopics ? (
                           <div className="flex flex-col items-center justify-center py-20 gap-6">
                               <div className="relative h-24 w-24">
                                   <div className="absolute inset-0 border-8 border-primary border-t-text-main rounded-full animate-spin"></div>
                                   <div className="absolute inset-4 bg-primary/20 rounded-full flex items-center justify-center">
                                       <span className="material-symbols-outlined text-3xl font-black animate-bounce">rocket_launch</span>
                                   </div>
                               </div>
                               <div className="text-center">
                                   <p className="font-black uppercase text-sm italic tracking-tighter">PREPARANDO SEU ESTUDO...</p>
                                   <p className="text-[9px] font-black uppercase opacity-60 mt-1">Salvando progresso no banco de dados...</p>
                               </div>
                           </div>
                       ) : (
                           <div className="flex flex-col gap-4 animate-slide-up">
                               <div className="flex items-center gap-3 mb-2">
                                   <div className={`h-12 w-12 rounded-xl border-4 border-text-main flex items-center justify-center ${activeSubject?.colorClass}`}>
                                       <span className="material-symbols-outlined font-black text-white">{activeSubject?.icon}</span>
                                   </div>
                                   <h2 className="text-2xl font-black uppercase italic tracking-tighter leading-none">{activeSubject?.title}</h2>
                               </div>
                               <div className="grid grid-cols-1 gap-3">
                                   {activeSubject?.topics?.map((t, idx) => (
                                       <div key={t.id} onClick={() => handleTopicClick(activeSubject, t)} className="p-5 bg-white dark:bg-card-dark rounded-2xl flex items-center justify-between border-4 border-text-main shadow-cartoon hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all cursor-pointer group">
                                           <div className="flex gap-4 items-center">
                                               <span className="font-black text-2xl text-primary-dark opacity-30 group-hover:opacity-100 transition-opacity">{String(idx+1).padStart(2, '0')}</span>
                                               <span className={`font-bold text-sm leading-tight ${t.isCompleted ? 'line-through opacity-50' : ''}`}>{t.title}</span>
                                           </div>
                                           {t.isCompleted ? (
                                               <span className="material-symbols-outlined text-primary-dark font-black">check_circle</span>
                                           ) : (
                                               <span className="material-symbols-outlined text-text-muted opacity-20 text-sm">play_arrow</span>
                                           )}
                                       </div>
                                   ))}
                               </div>
                           </div>
                       )}
                   </div>
                )}
                {currentView === ViewState.STUDY_SESSION && activeSubject && activeTopic && currentUser && (
                    <StudySession 
                        subject={activeSubject} 
                        topic={activeTopic} 
                        onBack={() => setCurrentView(ViewState.SUBJECTS)} 
                        onComplete={handleCompleteLesson}
                        targetContest={currentUser.targetContest}
                    />
                )}
                {currentView === ViewState.QUICK_QUIZ && currentUser && (
                    <QuickQuizSession subjects={subjects} onBack={() => setCurrentView(ViewState.HOME)} onFinish={handleQuickQuizFinish} targetContest={currentUser.targetContest} />
                )}
                {currentView === ViewState.OPPORTUNITIES && (
                    <div className="px-6 py-12 flex flex-col gap-6 pb-28">
                        <div>
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter">Editais</h2>
                            <p className="text-[10px] font-black text-text-muted uppercase tracking-widest">Sincronizado com seu perfil</p>
                        </div>
                        
                        {filteredOpportunities?.map(opp => (
                            <div 
                                key={opp.id} 
                                onClick={() => setSelectedOpportunity(opp)}
                                className="p-6 rounded-[2rem] border-4 border-text-main shadow-cartoon bg-white dark:bg-card-dark transition-all hover:scale-[1.02] cursor-pointer"
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-xl leading-none uppercase italic tracking-tighter">{opp.title}</h3>
                                    <span className="text-[8px] font-black bg-yellow-400 border-2 border-text-main px-2 py-0.5 rounded-full uppercase">{opp.status}</span>
                                </div>
                                <p className="text-xs font-bold text-text-muted mb-4">{opp.role} • {opp.salary}</p>
                                <div className="w-full text-center bg-primary border-4 border-text-main font-black py-3 rounded-2xl text-[10px] uppercase italic tracking-widest">Ver Vaga</div>
                            </div>
                        ))}
                    </div>
                )}
                {currentView === ViewState.PROFILE && (
                    <div className="px-6 py-12 flex flex-col items-center gap-8 pb-28 animate-fade-in">
                        <div className="relative">
                            <div className="w-32 h-32 bg-primary rounded-[2.5rem] border-8 border-text-main shadow-cartoon flex items-center justify-center text-6xl font-black italic text-text-main rotate-6">
                                {currentUser?.name.charAt(0)}
                            </div>
                        </div>
                        
                        <div className="text-center">
                            <h2 className="text-3xl font-black uppercase italic tracking-tighter leading-none">{currentUser?.name}</h2>
                            <p className="font-black text-primary-dark text-xs uppercase tracking-[0.2em] mt-2">Nível {userStats?.level} • Foco: {currentUser?.targetContest}</p>
                            <p className="text-[10px] font-bold text-text-muted mt-2 px-3 py-1 bg-gray-100 rounded-lg">{currentUser?.email}</p>
                        </div>

                        <div className="w-full grid grid-cols-2 gap-4">
                            <div className="bg-white dark:bg-card-dark border-4 border-text-main p-6 rounded-3xl shadow-cartoon text-center">
                                <p className="text-[10px] text-text-muted font-black uppercase mb-1">Total XP</p>
                                <p className="text-3xl font-black italic">{userStats?.xp}</p>
                            </div>
                            <div className="bg-white dark:bg-card-dark border-4 border-text-main p-6 rounded-3xl shadow-cartoon text-center">
                                <p className="text-[10px] text-text-muted font-black uppercase mb-1">Questões</p>
                                <p className="text-3xl font-black italic">{userStats?.questionsAnswered}</p>
                            </div>
                        </div>
                        
                        <div className="w-full bg-yellow-100 border-4 border-text-main p-6 rounded-[2rem] flex items-center gap-4">
                            <div className="h-12 w-12 bg-white border-2 border-text-main rounded-xl flex items-center justify-center shadow-cartoon">
                                <span className="material-symbols-outlined text-2xl text-text-main font-black">sync</span>
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase italic opacity-60">Segurança de Dados</p>
                                <p className="font-black uppercase text-sm">Progresso Salvo!</p>
                            </div>
                        </div>

                        <button 
                            onClick={handleLogout}
                            className="w-full border-4 border-red-500 text-red-500 font-black py-4 rounded-2xl uppercase italic tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all shadow-cartoon active:translate-y-1 active:shadow-none"
                        >
                            Trocar de Conta
                        </button>
                    </div>
                )}
            </main>
            <BottomNav currentView={currentView} onNavigate={setCurrentView} />
            
            <OpportunityModal 
              opportunity={selectedOpportunity} 
              onClose={() => setSelectedOpportunity(null)} 
            />

            {accumulatingXp !== null && (
               <XPAccumulator amount={accumulatingXp} onComplete={finishXpAccumulation} />
            )}
         </>
      )}
    </div>
  );
}
