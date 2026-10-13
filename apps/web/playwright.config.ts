import { defineConfig, devices } from "@playwright/test";

/** E2E tests run against a production build using a dedicated database. */
export const E2E_DATABASE_URL =
  process.env.E2E_DATABASE_URL ?? "postgres://postgres:postgres@localhost:5432/clientes_e2e";
const PORT = 3100;

export const E2E_ENV = {
  DATABASE_URL: E2E_DATABASE_URL,
  PII_HASH_SECRET: "e2e-hash-secret-0123456789",
  ADMIN_PASSWORD: "e2e-admin-pass",
  ADMIN_SESSION_SECRET: "e2e-session-secret-0123456789",
  NEXT_PUBLIC_TRUSTEDFORM_ENABLED: "false",
};

export default defineConfig({
  testDir: "./e2e",
  globalSetup: "./e2e/globalSetup.ts",
  fullyParallel: false,
  workers: 1,
  retries: 0,
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: "retain-on-failure",
    // Use a preinstalled Chromium when provided (e.g. cloud dev containers).
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_PATH }
      : {},
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `pnpm next start -p ${PORT}`,
    port: PORT,
    env: E2E_ENV,
    reuseExistingServer: false,
    timeout: 60_000,
  },
});
