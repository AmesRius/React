import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: '/React/', // ← リポジトリ名と一致させる（前後の / を忘れずに）
<<<<<<< HEAD
})
=======
})
>>>>>>> 16fb57f550408660307de30fd73faaa14305196e
