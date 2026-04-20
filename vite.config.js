import { defineConfig } from 'vite'

export default defineConfig({
  root: 'todo_app',
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
