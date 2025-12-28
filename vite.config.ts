import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Carrega variáveis de ambiente
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    // CRÍTICO PARA GITHUB PAGES: base './' faz os assets serem relativos
    base: './', 
    define: {
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  };
});