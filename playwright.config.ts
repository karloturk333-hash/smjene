import { defineConfig, devices } from "@playwright/test";

/**
 * Playwright konfiguracija za napojnice (e2e).
 * - testDir: gdje su testovi
 * - projects: svaki test se vrti na DVA ekrana (desktop + mobitel)
 * - webServer: pokrene API (:4000) + web (:5173); reuseExistingServer = ako su
 *   već gore (kao sad), iskoristi ih umjesto da pokreće nove.
 * - baseURL: testovi pišu "/" a Playwright doda http://localhost:5173
 */
export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"], viewport: { width: 1280, height: 800 } } },
    { name: "mobile", use: { ...devices["Pixel 5"] } },
  ],
  webServer: [
    {
      command: "npm run dev:api",
      url: "http://localhost:4000/api/health",
      reuseExistingServer: true,
      timeout: 60_000,
    },
    {
      command: "npm run dev:web",
      url: "http://localhost:5173",
      reuseExistingServer: true,
      timeout: 60_000,
    },
  ],
});
