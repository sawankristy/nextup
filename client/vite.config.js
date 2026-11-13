import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // for the tests (vitest): jsdom pretends to be a browser
  test: {
    environment: 'jsdom',
    globals: true, // lets Testing Library clean the page after each test by itself
    setupFiles: './src/setupTests.js', // adds toBeInTheDocument() and friends
  },
})
