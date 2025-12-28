
import { Subject, Opportunity, UserStats } from './types';

export const INITIAL_USER_STATS: UserStats = {
  xp: 0,
  level: 1,
  nextLevelXp: 1000,
  streak: 0,
  hoursStudied: 0,
  questionsAnswered: 0,
};

export const SUBJECT_LIBRARY: Record<string, Subject[]> = {
  POLICE: [
    { id: 'port', title: 'Português', subtitle: 'Gramática e Interpretação', icon: 'menu_book', colorClass: 'bg-orange-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'rlm', title: 'RLM', subtitle: 'Lógica e Matemática', icon: 'psychology', colorClass: 'bg-purple-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'const', title: 'Direito Constitucional', subtitle: 'Direitos e Garantias', icon: 'gavel', colorClass: 'bg-blue-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'adm', title: 'Direito Administrativo', subtitle: 'Atos e Poderes', icon: 'balance', colorClass: 'bg-pink-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'info', title: 'Informática', subtitle: 'Redes e Segurança', icon: 'computer', colorClass: 'bg-red-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'penal', title: 'Direito Penal', subtitle: 'Código Penal e Processo', icon: 'policy', colorClass: 'bg-emerald-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] }
  ],
  BANK: [
    { id: 'port', title: 'Português', subtitle: 'Gramática e Interpretação', icon: 'menu_book', colorClass: 'bg-orange-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'mat_fin', title: 'Matemática Financeira', subtitle: 'Juros e Capitalização', icon: 'calculate', colorClass: 'bg-purple-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'bancario', title: 'Conhecimentos Bancários', subtitle: 'Mercado Financeiro', icon: 'account_balance', colorClass: 'bg-blue-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'vendas', title: 'Vendas e Negociação', subtitle: 'Atendimento Bancário', icon: 'handshake', colorClass: 'bg-pink-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'info', title: 'Informática', subtitle: 'Ferramentas Digitais', icon: 'computer', colorClass: 'bg-red-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] }
  ],
  SOCIAL: [
    { id: 'port', title: 'Português', subtitle: 'Gramática e Interpretação', icon: 'menu_book', colorClass: 'bg-orange-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'rlm', title: 'RLM', subtitle: 'Lógica e Matemática', icon: 'psychology', colorClass: 'bg-purple-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'prev', title: 'Direito Previdenciário', subtitle: 'Seguridade Social', icon: 'health_and_safety', colorClass: 'bg-emerald-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'const', title: 'Direito Constitucional', subtitle: 'CF/88', icon: 'gavel', colorClass: 'bg-blue-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] },
    { id: 'adm', title: 'Direito Administrativo', subtitle: 'Servidores Públicos', icon: 'balance', colorClass: 'bg-pink-400', iconColorClass: 'text-white', progress: 0, totalTopics: 0, topics: [] }
  ]
};

export const getSubjectsForContest = (contest: string): Subject[] => {
  const c = contest.toUpperCase().trim();
  
  // Regras de detecção por palavras-chave
  const isPolice = /\b(PF|PRF|POLICIA|POLICIAL|CIVIL|MILITAR|GCM|AGENTE|DELEGADO|INVESTIGADOR|ESCRIVAO|PENAL)\b/.test(c);
  const isBank = /\b(CAIXA|BB|BANCO|BANCARIO|FINANCEIRO|BNB|CEF|ECONOMICA)\b/.test(c);
  const isSocial = /\b(INSS|PREVIDENCIA|SOCIAL|RECEITA|FISCAL|TRT|TRE|TRIBUNAIS)\b/.test(c);

  if (isPolice) return SUBJECT_LIBRARY.POLICE;
  if (isBank) return SUBJECT_LIBRARY.BANK;
  if (isSocial) return SUBJECT_LIBRARY.SOCIAL;
  
  return SUBJECT_LIBRARY.POLICE; // Default: Área Policial
};

export const MOCK_OPPORTUNITIES: Opportunity[] = [
  {
    id: '1',
    title: 'Caixa Econômica',
    role: 'Técnico Bancário',
    salary: 'R$ 3.762,00',
    location: 'Nacional',
    status: 'Aberto',
    registrationUrl: 'https://www.cesgranrio.org.br',
    colorHex: '#1d4ed8',
    description: 'Concurso focado em atendimento ao público e rotinas bancárias.',
    requirements: ['Ensino Médio Completo'],
    benefits: ['Vale Alimentação', 'PLR']
  },
  {
    id: '2',
    title: 'Polícia Federal',
    role: 'Agente / Escrivão',
    salary: 'R$ 13.600,00',
    location: 'Nacional',
    status: 'Previsto',
    registrationUrl: 'https://www.cebraspe.org.br',
    colorHex: '#e11d48',
    description: 'Carreira de elite para investigação federal.',
    requirements: ['Ensino Superior', 'CNH B'],
    benefits: ['Estabilidade', 'Adicional de Fronteira']
  }
];
