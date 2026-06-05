import { type Page, expect } from "@playwright/test";

/** Seed demo račun (vidi apps/api/prisma/seed.ts). */
export const DEMO = { email: "demo@napojnice.hr", password: "demo12345" };

/** Prijavi se kroz UI i pričekaj da smo na dashboardu. */
export async function login(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Lozinka").fill(password);
  await page.getByRole("button", { name: "Prijavi se" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.getByRole("heading", { name: "Pregled" })).toBeVisible();
}

/** Registriraj novog korisnika kroz UI; nakon toga smo automatski prijavljeni. */
export async function register(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/register");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Lozinka").fill(password);
  await page.getByRole("button", { name: "Registriraj se" }).click();
  await page.waitForURL((url) => url.pathname === "/");
  await expect(page.getByRole("heading", { name: "Pregled" })).toBeVisible();
}

/** Jedinstven email po projektu (desktop/mobile) i vremenu da se testovi ne sudaraju. */
export function uniqueEmail(prefix: string, projectName: string): string {
  return `${prefix}-${projectName}-${Date.now()}@napojnice.test`;
}
