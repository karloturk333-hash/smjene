import { test, expect } from "@playwright/test";
import { register } from "./helpers";

/**
 * Snima ekrane ključnih trenutaka auth toka za izvještaj (shots/). Vrti se samo
 * na "desktop" projektu da ne dupliciramo snimke (mobile preskačemo).
 */
test("snimke: cijeli auth tok", async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "snimke radimo samo na desktopu");

  const email = `demo-shots-${Date.now()}@napojnice.test`;
  const password = "tajna12345";
  const venue = "Konoba More";

  // 1) Neprijavljeni → preusmjeren na login.
  await page.goto("/");
  await page.waitForURL((url) => url.pathname === "/login");
  await expect(page.getByRole("heading", { name: "Prijava" })).toBeVisible();
  await page.screenshot({ path: "shots/auth-1-login.png", fullPage: true });

  // 2) Registracija → prazan dashboard.
  await register(page, email, password);
  await expect(page.getByText("Još nema unesenih smjena.")).toBeVisible();
  await page.screenshot({ path: "shots/auth-2-empty-dashboard.png", fullPage: true });

  // 3) Forma za novu smjenu (popunjena).
  await page.getByRole("link", { name: "+ Nova smjena" }).click();
  await page.getByLabel("Lokal").fill(venue);
  await page.getByLabel("Napojnice — gotovina (€)").fill("45.5");
  await page.getByLabel("Napojnice — kartica (€)").fill("22");
  await page.getByLabel("Broj gostiju").fill("38");
  await page.screenshot({ path: "shots/auth-3-new-shift-form.png", fullPage: true });
  await page.getByRole("button", { name: "Spremi smjenu" }).click();

  // 4) Dashboard sa smjenom + statistikom (email prijavljenog u zaglavlju).
  await expect(page.locator(".shift").filter({ hasText: venue })).toBeVisible();
  await page.screenshot({ path: "shots/auth-4-dashboard-with-shift.png", fullPage: true });

  // 5) Odjava → ponovna prijava → smjena perzistira.
  await page.getByRole("button", { name: "Odjava" }).click();
  await page.waitForURL((url) => url.pathname === "/login");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Lozinka").fill(password);
  await page.getByRole("button", { name: "Prijavi se" }).click();
  await expect(page.locator(".shift").filter({ hasText: venue })).toBeVisible();
  await page.screenshot({ path: "shots/auth-5-after-relogin.png", fullPage: true });
});
