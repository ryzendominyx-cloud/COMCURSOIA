import React, { useState, useEffect } from 'react';
import { Subject } from '../types';
import { generateRandomQuestion } from '../services/geminiService';

interface QuickQuizSessionProps {
  subjects: Subject[];
  onBack: () => void;
  onFinish: (score: number) => void;
  targetContest: string;
}

export const QuickQuizSession: React.FC<QuickQuizSessionProps> = ({ subjects, onBack, onFinish, targetContest }) => {
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  
  // Timer (15 minutes in seconds)
  const [timeLeft, setTimeLeft] = useState(15 * 60);
  const [score, setScore] = useState(0);
  
  const [currentQuestion, setCurrentQuestion] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [result, setResult] = useState<'correct' | 'incorrect' | null>(null);

  // Timer Effect
  useEffect(() => {
    let interval: any;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isPlaying) {
      setIsPlaying(false);
      // Time up
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const handleStart = (subject: Subject) => {
    setSelectedSubject(subject);
    setIsPlaying(true);
    loadQuestion(subject.title);
  };

  const loadQuestion = async (subjectTitle: string) => {
    setLoading(true);
    setCurrentQuestion(null);
    setSelectedAnswer(null);
    setResult(null);

    const q = await generateRandomQuestion(subjectTitle, targetContest);
    setCurrentQuestion(q);
    setLoading(false);
  };

  const nextQuestion = () => {
    if (selectedSubject) {
        loadQuestion(selectedSubject.title);
    }
  };

  const handleAnswer = (idx: number) => {
    if (selectedAnswer !== null || !currentQuestion) return;
    setSelectedAnswer(idx);
    const isCorrect = idx === currentQuestion.answerIndex;
    if (isCorrect) {
      setScore(s => s + 1);
      setResult('correct');
    } else {
      setResult('incorrect');
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // --- Render Selection Screen ---
  if (!isPlaying && timeLeft === 15 * 60) {
    return (
      <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col p-6 animate-slide-up">
        <header className="flex items-center gap-3 mb-8">
            <button onClick={onBack} className="h-10 w-10 rounded-full bg-gray-100 dark:bg-white/10 flex items-center justify-center">
                <span className="material-symbols-outlined">close</span>
            </button>
            <h2 className="text-xl font-bold">Desafio Rápido 15min</h2>
        </header>

        <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-4 animate-bounce">
                <span className="material-symbols-outlined text-4xl">timer</span>
            </div>
            <p className="text-center text-text-muted">
                Escolha uma matéria. Você terá 15 minutos para responder o máximo de questões que conseguir.
            </p>
        </div>

        <h3 className="font-bold mb-4">Escolha a Matéria:</h3>
        <div className="grid grid-cols-2 gap-3 overflow-y-auto">
            {subjects?.map(sub => (
                <button 
                    key={sub.id}
                    onClick={() => handleStart(sub)}
                    className={`p-4 rounded-2xl flex flex-col items-center gap-2 border-2 transition-all ${sub.colorClass} border-transparent hover:border-black/10 dark:hover:border-white/20`}
                >
                    <span className={`material-symbols-outlined text-3xl ${sub.iconColorClass}`}>{sub.icon}</span>
                    <span className="text-sm font-bold text-center leading-tight">{sub.title}</span>
                </button>
            ))}
        </div>
      </div>
    );
  }

  // --- Render Result Screen (Time Up) ---
  if (!isPlaying && timeLeft === 0) {
     return (
        <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col p-6 items-center justify-center animate-fade-in">
             <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-5xl text-red-500">alarm_off</span>
            </div>
            <h2 className="text-3xl font-bold mb-2">Tempo Esgotado!</h2>
            <p className="text-xl mb-8">Você acertou <strong className="text-primary-dark">{score}</strong> questões.</p>
            <button 
                onClick={() => onFinish(score)} 
                className="w-full bg-primary text-black font-bold py-4 rounded-xl shadow-lg"
            >
                Coletar Recompensas
            </button>
        </div>
     );
  }

  // --- Render Game Screen ---
  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col animate-fade-in">
        {/* Header */}
        <div className="p-4 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-2">
                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${selectedSubject?.colorClass}`}>
                    <span className={`material-symbols-outlined text-sm ${selectedSubject?.iconColorClass}`}>{selectedSubject?.icon}</span>
                 </div>
                 <span className="font-bold text-sm truncate max-w-[120px]">{selectedSubject?.title}</span>
            </div>
            <div className={`px-4 py-1 rounded-full font-mono font-bold ${timeLeft < 60 ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-gray-100 dark:bg-white/10'}`}>
                {formatTime(timeLeft)}
            </div>
            <div className="flex items-center gap-1 font-bold text-primary-dark dark:text-primary">
                <span className="material-symbols-outlined text-lg">check_circle</span>
                {score}
            </div>
        </div>

        <main className="flex-1 overflow-y-auto p-6">
            {loading ? (
                 <div className="flex flex-col items-center justify-center h-full gap-4">
                    <div className="w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-text-muted">Buscando desafio...</p>
                 </div>
            ) : (
                <div className="flex flex-col gap-6 animate-slide-up">
                    <div className="bg-surface-light dark:bg-card-dark p-6 rounded-2xl shadow-sm border-l-4 border-red-500">
                        <p className="text-lg font-medium">{currentQuestion?.question}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {currentQuestion?.options?.map((opt: string, idx: number) => {
                             let btnClass = "p-4 rounded-xl border-2 text-left font-medium transition-all ";
                             if (selectedAnswer === null) {
                               btnClass += "border-gray-200 dark:border-gray-700 hover:border-red-400 hover:bg-red-50 dark:hover:bg-red-900/20";
                             } else {
                               if (idx === currentQuestion.answerIndex) {
                                 btnClass += "border-green-500 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200";
                               } else if (idx === selectedAnswer) {
                                 btnClass += "border-red-500 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200";
                               } else {
                                 btnClass += "opacity-50 border-gray-200";
                               }
                             }
                             return (
                               <button 
                                 key={idx}
                                 disabled={selectedAnswer !== null}
                                 onClick={() => handleAnswer(idx)}
                                 className={btnClass}
                               >
                                 {opt}
                               </button>
                             );
                        })}
                    </div>

                    {result && (
                        <div className="animate-fade-in pb-6">
                            <div className={`p-4 rounded-xl mb-4 ${result === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                <p className="text-sm font-bold">{result === 'correct' ? 'Boa!' : 'Errou!'} {currentQuestion.explanation}</p>
                            </div>
                            <button 
                                onClick={nextQuestion}
                                className="w-full bg-black dark:bg-white text-white dark:text-black font-bold py-4 rounded-xl shadow-lg"
                            >
                                Próxima &raquo;
                            </button>
                        </div>
                    )}
                </div>
            )}
        </main>
        
        <button onClick={() => onFinish(score)} className="absolute bottom-4 left-6 text-xs text-text-muted underline">
            Parar e Sair
        </button>
    </div>
  );
};