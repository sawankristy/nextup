import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // a fake secret only for the tests, so they run without a .env file
    env: { JWT_SECRET: 'test-secret' },
  },
});
