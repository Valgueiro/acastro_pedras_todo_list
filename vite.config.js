import { defineConfig } from 'vite'

export default defineConfig({
  root: 'todo_app',
  server: {
    host: "0.0.0.0",
    port: 3000,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
})
