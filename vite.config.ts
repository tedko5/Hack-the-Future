import { existsSync } from 'node:fs'
import tailwindcss from '@tailwindcss/vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import { nitro } from 'nitro/vite'
import { defineConfig } from 'vite'

// Vite does not put .env into process.env, and the server needs DATABASE_URL.
// Variables that are already set win over the file.
if (existsSync('.env')) process.loadEnvFile('.env')

export default defineConfig({
  resolve: { tsconfigPaths: true },
  plugins: [nitro(), tailwindcss(), tanstackStart(), viteReact()],
})
