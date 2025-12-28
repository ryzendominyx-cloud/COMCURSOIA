export interface Topic {
  id: string;
  title: string;
  isCompleted: boolean;
  content?: string;
}

export interface Subject {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  colorClass: string;
  iconColorClass: string;
  progress: number;
  totalTopics: number;
  topics: Topic[];
  isFavorite?: boolean;
}

export interface Opportunity {
  id: string;
  title: string;
  role: string;
  salary: string;
  location: string;
  deadline?: string;
  status: 'Aberto' | 'Previsto' | 'Encerrado';
  isHot?: boolean;
  colorHex?: string;
  description?: string;
  requirements?: string[];
  benefits?: string[];
  registrationUrl: string;
}

export interface UserStats {
  xp: number;
  level: number;
  streak: number;
  hoursStudied: number;
  questionsAnswered: number;
  nextLevelXp: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  targetContest: string; // O concurso que o usuário quer passar
  stats: UserStats;
  subjectsProgress: Subject[];
}

export enum ViewState {
  AUTH = 'auth',
  HOME = 'home',
  SUBJECTS = 'subjects',
  OPPORTUNITIES = 'opportunities',
  PROFILE = 'profile',
  STUDY_SESSION = 'study_session',
  QUICK_QUIZ = 'quick_quiz'
}