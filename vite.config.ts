import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [react()],
    define: {
      // This allows the app to read process.env.API_KEY during the build
      'process.env.API_KEY': JSON.stringify(env.API_KEY)
    }
  }
})