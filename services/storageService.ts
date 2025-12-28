
import { User } from '../types';
import { supabase } from './supabaseClient';

const USERS_KEY = 'concursopro_db_users';
const LESSON_CACHE_KEY = 'concursopro_cache_lessons';
const APP_STATE_KEY = 'concursopro_current_session';

// --- HYBRID DATABASE: USER REPOSITORY (Local + Supabase) ---

export const saveUser = async (user: User) => {
  if (!user || !user.email) return;

  // 1. Salva Localmente (Para velocidade instantânea da UI)
  const users = getUsersLocal();
  const emailLower = user.email.toLowerCase();
  const index = users.findIndex(u => u.email.toLowerCase() === emailLower);
  
  const updatedUsers = [...users];
  if (index >= 0) {
    updatedUsers[index] = { ...user };
  } else {
    updatedUsers.push({ ...user });
  }
  
  localStorage.setItem(USERS_KEY, JSON.stringify(updatedUsers));
  localStorage.setItem(APP_STATE_KEY, JSON.stringify(user));

  // 2. Sincroniza com Supabase (Banco de Dados Real)
  // Assumindo que existe uma tabela 'users' com colunas correspondentes ou uma coluna JSONB
  try {
    // Removemos campos que podem não ser colunas no banco se o usuário não criou (ex: id se for auto-generated)
    // Mas para garantir a sincronia, enviamos o objeto todo.
    // É CRÍTICO que as colunas existam no Supabase com os MESMOS NOMES do objeto JSON (camelCase).
    // Caso contrário, ocorrerá erro de coluna inexistente.
    const { error } = await supabase
      .from('users')
      .upsert(user, { onConflict: 'email' }); // Usa email como chave única
    
    if (error) {
      console.error("Erro detalhado ao salvar no Supabase:", JSON.stringify(error, null, 2));
      // Se o erro for 'relation "users" does not exist', o usuário precisa criar a tabela.
      // Se o erro for 'column "..." does not exist', o usuário precisa criar as colunas.
    } else {
        console.log("Usuário sincronizado com Supabase com sucesso.");
    }
  } catch (e) {
    console.error("Erro de conexão/exceção com Supabase:", e);
  }
};

// Busca síncrona apenas do LocalStorage (para inicialização rápida)
export const getUsersLocal = (): User[] => {
  const users = localStorage.getItem(USERS_KEY);
  try {
    return users ? JSON.parse(users) : [];
  } catch (e) {
    return [];
  }
};

// Busca Assíncrona do Supabase (para Login/Verificação)
export const getUserRemote = async (email: string): Promise<User | null> => {
    if (!email) return null;
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', email)
            .single();
        
        if (error) {
            console.error("Erro ao buscar usuário remoto:", JSON.stringify(error, null, 2));
            return null;
        }
        return data as User;
    } catch (e) {
        console.error("Erro de conexão ao buscar usuário remoto", e);
        return null;
    }
};

export const getUserLocal = (email: string): User | undefined => {
  if (!email) return undefined;
  const users = getUsersLocal();
  return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

export const getCurrentSession = (): User | null => {
  const session = localStorage.getItem(APP_STATE_KEY);
  try {
    if (!session) return null;
    const parsed = JSON.parse(session);
    // Tenta pegar a versão mais recente do cache local
    return getUserLocal(parsed.email) || parsed;
  } catch (e) {
    return null;
  }
};

export const clearSession = () => {
  localStorage.removeItem(APP_STATE_KEY);
};

// --- CONTENT CACHE ---

export const getCachedLesson = (subject: string, topic: string): string | null => {
  const cache = localStorage.getItem(LESSON_CACHE_KEY);
  if (!cache) return null;
  try {
    const parsed = JSON.parse(cache);
    return parsed[`${subject}-${topic}`] || null;
  } catch (e) {
    return null;
  }
};

export const saveCachedLesson = (subject: string, topic: string, content: string) => {
  try {
    const cacheStr = localStorage.getItem(LESSON_CACHE_KEY);
    const cache = cacheStr ? JSON.parse(cacheStr) : {};
    cache[`${subject}-${topic}`] = content;
    localStorage.setItem(LESSON_CACHE_KEY, JSON.stringify(cache));
  } catch(e) {}
};
