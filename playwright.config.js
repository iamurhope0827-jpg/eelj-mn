import { defineConfig, devices } from '@playwright/test';

const port = 4173;

export default defineConfig({
  testDir: 'tests',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://127.0.0.1:${port}`,
    // CI installs Playwright's Chromium; locally the installed Edge is used instead.
    ...devices['Desktop Chrome'],
    channel: process.env.CI ? undefined : 'msedge',
    trace: 'retain-on-failure'
  },
  webServer: {
    command: 'node scripts/serve.mjs',
    env: { PORT: String(port) },
    url: `http://127.0.0.1:${port}/`,
    reuseExistingServer: !process.env.CI
  }
});
