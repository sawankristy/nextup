import { defineConfig, devices } from '@playwright/test';

// end-to-end tests (Session 22): a real browser on the whole app
export default defineConfig({
  testDir: '.', // nextup.spec.js is right here
  use: {
    baseURL: 'http://localhost:4173', // so page.goto('/lists') opens http://localhost:4173/lists
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } }, // Chromium only
  ],
  // Playwright starts these 2 servers before the tests, waits for their url, and stops them at the end
  webServer: [
    {
      // 1. our API on 3001, with an in-memory MongoDB
      command: 'node start-api.js',
      url: 'http://localhost:3001/api/health',
      timeout: 120_000, // the very first time, MongoDB can take a while to start
    },
    {
      // 2. the BUILT client on 4173 (never test npm run dev), talking to the API above
      command: 'npm run build && npm run preview -- --port 4173',
      cwd: '../client',
      url: 'http://localhost:4173',
      env: { VITE_API_URL: 'http://localhost:3001' },
      timeout: 120_000,
    },
  ],
});
