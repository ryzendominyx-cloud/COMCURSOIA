
import React, { useState } from 'react';
import { User } from '../types';
import { INITIAL_USER_STATS, getSubjectsForContest } from '../constants';
import { saveUser, getUserRemote, getUserLocal } from '../services/storageService';
import { soundService } from '../services/soundService';

interface AuthScreenProps {
  onLogin: (user: User) => void;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetContest, setTargetContest] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
        // ADMIN BACKDOOR (Mantido local para testes rápidos)
        if (email === 'appadimim@gmail.com' && password === 'admim123') {
            soundService.playSuccess();
            const adminUser: User = {
                id: 'admin',
                name: 'Administrador',
                email: 'appadimim@gmail.com',
                password: 'admim123',
                targetContest: 'Elite Policial',
                stats: { ...INITIAL_USER_STATS, level: 99 },
                subjectsProgress: getSubjectsForContest('POLICIA')
            };
            onLogin(adminUser);
            setIsLoading(false);
            return;
        }

        if (!email || !password || (!isLogin && (!name || !targetContest))) {
          soundService.playIncorrect();
          setError('Atenção: Preencha todos os campos!');
          setIsLoading(false);
          return;
        }

        if (isLogin) {
          // Tenta buscar primeiro no Supabase, fallback para Local
          let user = await getUserRemote(email);
          if (!user) {
             user = getUserLocal(email) || null;
          }

          if (user && user.password === password) {
            soundService.playSuccess();
            // Atualiza local storage com dados frescos do servidor
            await saveUser(user); 
            onLogin(user);
          } else {
            soundService.playIncorrect();
            setError('E-mail ou senha não conferem (ou usuário não existe).');
          }
        } else {
          // Registro
          const existingUser = await getUserRemote(email);
          const existingLocal = getUserLocal(email);

          if (existingUser || existingLocal) {
            soundService.playIncorrect();
            setError('E-mail já está em uso.');
            setIsLoading(false);
            return;
          }

          soundService.playSuccess();
          const filteredSubjects = getSubjectsForContest(targetContest);

          const newUser: User = {
            id: Date.now().toString(),
            name,
            email,
            password,
            targetContest,
            stats: INITIAL_USER_STATS,
            subjectsProgress: JSON.parse(JSON.stringify(filteredSubjects)) // Deep copy
          };

          await saveUser(newUser); // Salva no Supabase e Local
          onLogin(newUser);
        }
    } catch (err) {
        console.error(err);
        setError('Erro de conexão. Tente novamente.');
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark p-6 overflow-hidden">
      <div className="w-full max-sm animate-cartoon-pop">
        <div className="text-center mb-10">
            <div className="h-24 w-24 bg-primary rounded-[2rem] mx-auto flex items-center justify-center shadow-cartoon mb-4 border-4 border-text-main rotate-3">
                 <span className="material-symbols-outlined text-5xl text-text-main font-black">bolt</span>
            </div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter leading-none text-text-main dark:text-white">CONCURSOPRO <span className="text-primary-dark">AI</span></h1>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] mt-2 opacity-60">Sua Aprovação na Velocidade da Luz</p>
        </div>

        <div className="bg-white dark:bg-card-dark p-8 rounded-[3rem] shadow-cartoon border-4 border-text-main">
           <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              {!isLogin && (
                <>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase ml-2">Nome Completo</label>
                    <input 
                      type="text" 
                      value={name}
                      onChange={e => setName(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-background-dark border-4 border-text-main focus:ring-0 text-sm font-bold"
                      placeholder="Ex: João Silva"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-[10px] font-black uppercase ml-2">Qual seu Concurso Alvo?</label>
                    <input 
                      type="text" 
                      value={targetContest}
                      onChange={e => setTargetContest(e.target.value)}
                      className="w-full p-4 rounded-2xl bg-yellow-100 border-4 border-text-main focus:ring-0 text-sm font-bold text-black"
                      placeholder="Ex: Polícia Federal, Caixa..."
                    />
                  </div>
                </>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase ml-2">E-mail de Acesso</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-background-dark border-4 border-text-main focus:ring-0 text-sm font-bold"
                  placeholder="seu@email.com"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[10px] font-black uppercase ml-2">Sua Senha</label>
                <input 
                  type="password" 
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-background-dark border-4 border-text-main focus:ring-0 text-sm font-bold"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <div className="bg-red-100 border-2 border-red-500 p-2 rounded-xl flex items-center gap-2 animate-cartoon-shake">
                    <span className="material-symbols-outlined text-red-500 text-sm">warning</span>
                    <p className="text-red-500 text-[10px] font-black uppercase">{error}</p>
                </div>
              )}

              <button disabled={isLoading} type="submit" className="mt-2 bg-primary hover:bg-primary-dark text-text-main font-black py-5 rounded-[2rem] border-4 border-text-main shadow-cartoon transition-all active:translate-y-1 active:shadow-none uppercase italic tracking-widest text-lg disabled:opacity-50 disabled:cursor-wait">
                 {isLoading ? 'Conectando...' : (isLogin ? 'Entrar Agora ➔' : 'Criar Conta ➔')}
              </button>
           </form>

           <button 
             onClick={() => { soundService.playClick(); setIsLogin(!isLogin); setError(''); }}
             className="w-full mt-6 text-[10px] font-black text-text-muted hover:text-primary-dark transition-colors uppercase tracking-widest"
           >
             {isLogin ? 'Novo por aqui? Criar Perfil' : 'Já tem conta? Fazer Login'}
           </button>
        </div>
      </div>
    </div>
  );
};
