import { defineConfig, devices } from '@playwright/test'

const iphoneBase = devices['iPhone 13']
const widths = [
  ['webkit-320', 320, 568],
  ['webkit-375', 375, 667],
  ['webkit-390', 390, 844],
  ['webkit-430', 430, 932],
  ['webkit-480', 480, 844],
]

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: 'test-results',
  timeout: 30_000,
  expect: { timeout: 6_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  maxFailures: 1,
  reporter: [
    ['line'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    browserName: 'webkit',
    actionTimeout: 6_000,
    navigationTimeout: 12_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: widths.map(([name, width, height]) => ({
    name,
    use: {
      ...iphoneBase,
      browserName: 'webkit',
      viewport: { width, height },
      screen: { width, height },
    },
  })),
  webServer: {
    command: 'npm run preview -- --host 127.0.0.1 --port 4173',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: !process.env.CI,
    timeout: 30_000,
  },
})
