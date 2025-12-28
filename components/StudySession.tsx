
import React, { useState, useEffect } from 'react';
import { Subject, Topic } from '../types';
import { generateLesson, generateQuizBatch } from '../services/geminiService';
import { soundService } from '../services/soundService';
import ReactMarkdown from 'react-markdown';
import { ProfessorMascot } from './ProfessorMascot';

interface StudySessionProps {
  subject: Subject;
  topic: Topic;
  targetContest: string;
  onBack: () => void;
  onComplete: () => void;
}

export const StudySession: React.FC<StudySessionProps> = ({ subject, topic, targetContest, onBack, onComplete }) => {
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<'reading' | 'quiz'>('reading');
  const [professorState, setProfessorState] = useState<'neutral' | 'happy' | 'sad' | 'thinking'>('thinking');
  
  const [currentIdx, setCurrentIdx] = useState(0);
  const [score, setScore] = useState(0);
  const [quizPool, setQuizPool] = useState<any[]>([]);
  const [selected, setSelected] = useState<number | null>(null);

  const TOTAL_QUESTIONS = 5; // Reduzido de 15 para 5 para economizar tokens e tempo do usuário

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setProfessorState('thinking');
      const text = await generateLesson(subject.title, topic.title, targetContest);
      setContent(text);
      setLoading(false);
      setProfessorState('neutral');
    };
    load();
  }, [topic.title]);

  const startQuiz = async () => {
    setMode('quiz');
    setLoading(true);
    setProfessorState('thinking');
    // Faz UMA ÚNICA CHAMADA para todas as questões da sessão
    const questions = await generateQuizBatch(subject.title, topic.title, targetContest, TOTAL_QUESTIONS);
    setQuizPool(questions);
    setLoading(false);
    setProfessorState('neutral');
  };

  const handleAnswer = (idx: number) => {
    if (selected !== null || !quizPool[currentIdx]) return;
    setSelected(idx);
    const isCorrect = idx === quizPool[currentIdx].answerIndex;
    if (isCorrect) {
        setScore(s => s + 1);
        setProfessorState('happy');
        soundService.playCorrect();
    } else {
        setProfessorState('sad');
        soundService.playIncorrect();
    }
  };

  const handleComplete = () => {
    soundService.playSuccess();
    onComplete();
  };

  const currentQuestion = quizPool[currentIdx];

  return (
    <div className="fixed inset-0 z-50 bg-background-light dark:bg-background-dark flex flex-col p-6 overflow-hidden">
      <header className="flex justify-between items-center mb-4">
        <button onClick={() => { soundService.playClick(); onBack(); }} className="h-10 w-10 border-4 border-text-main rounded-xl bg-white flex items-center justify-center font-black shadow-cartoon active:translate-y-0.5 active:shadow-none transition-all">
            <span className="material-symbols-outlined">close</span>
        </button>
        <div className="flex flex-col items-center">
            <ProfessorMascot state={professorState} />
        </div>
        <div className="w-10"></div>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar pb-10">
        {mode === 'reading' ? (
          <div className="animate-fade-in">
            {loading ? (
                <div className="h-64 flex flex-col items-center justify-center gap-4">
                    <div className="w-12 h-12 border-8 border-primary border-t-text-main rounded-full animate-spin"></div>
                    <p className="font-black uppercase text-xs">Carregando Conteúdo...</p>
                </div>
            ) : (
              <>
                <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border-4 border-text-main shadow-cartoon prose dark:prose-invert max-w-none text-sm leading-relaxed">
                  <ReactMarkdown>{content}</ReactMarkdown>
                </div>
                <button 
                  onClick={() => { soundService.playClick(); startQuiz(); }}
                  className="mt-8 w-full bg-primary text-black font-black py-5 rounded-2xl border-4 border-text-main shadow-cartoon flex items-center justify-center gap-2 hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all"
                >
                  DESAFIO DO TÓPICO <span className="material-symbols-outlined">bolt</span>
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="flex flex-col gap-6 animate-slide-up">
            <div className="flex justify-between items-center px-2">
                <span className="text-[10px] font-black uppercase bg-white border-2 border-text-main px-3 py-1 rounded-lg shadow-cartoon">
                    Questão {currentIdx + 1}/{TOTAL_QUESTIONS}
                </span>
                <span className="text-[10px] font-black uppercase text-green-600">Acertos: {score}</span>
            </div>
            
            {loading || !currentQuestion ? (
                <div className="h-48 flex flex-col items-center justify-center gap-4">
                     <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                     <p className="text-[10px] font-black">PREPARANDO QUESTÕES...</p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="bg-white dark:bg-card-dark p-6 rounded-3xl border-4 border-text-main shadow-cartoon">
                        <p className="font-black text-lg leading-tight">{currentQuestion.question}</p>
                    </div>

                    <div className="flex flex-col gap-3">
                        {currentQuestion.options?.map((opt: string, i: number) => {
                            let style = "bg-white dark:bg-card-dark border-text-main text-text-main dark:text-white";
                            if (selected !== null) {
                                if (i === currentQuestion.answerIndex) style = "bg-green-400 border-text-main text-white";
                                else if (i === selected) style = "bg-red-400 border-text-main text-white";
                                else style = "opacity-50 grayscale";
                            }
                            return (
                                <button 
                                    key={i} 
                                    disabled={selected !== null}
                                    onClick={() => handleAnswer(i)}
                                    className={`p-4 rounded-xl text-left font-black text-sm border-4 shadow-cartoon active:shadow-none active:translate-y-0.5 transition-all ${style}`}
                                >
                                    {opt}
                                </button>
                            );
                        })}
                    </div>

                    {selected !== null && (
                        <div className="bg-blue-100 dark:bg-blue-900/30 p-5 rounded-3xl border-4 border-text-main animate-fade-in">
                            <p className="font-black text-xs uppercase mb-2">Explicação:</p>
                            <p className="text-sm font-bold leading-tight">{currentQuestion.explanation}</p>
                            <button 
                                onClick={() => {
                                    soundService.playClick();
                                    if (currentIdx < quizPool.length - 1) {
                                        setCurrentIdx(c => c + 1);
                                        setSelected(null);
                                    } else {
                                        handleComplete();
                                    }
                                }}
                                className="mt-4 w-full bg-text-main text-white font-black py-4 rounded-xl border-2 border-white shadow-cartoon"
                            >
                                {currentIdx < quizPool.length - 1 ? 'Próxima Questão' : 'Concluir Estudo'}
                            </button>
                        </div>
                    )}
                </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
