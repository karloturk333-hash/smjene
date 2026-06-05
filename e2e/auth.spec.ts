import { test, expect } from "@playwright/test";
import { login, register, uniqueEmail } from "./helpers";

test.describe("Auth — prijava, izolacija i zaštita ruta", () => {
  test("registracija → prazan dashboard → kreiraj smjenu → odjava → ponovna prijava → smjena ostaje", async ({
    page,
  }, testInfo) => {
    const email = uniqueEmail("flow", testInfo.project.name);
    const password = "tajna12345";
    const venue = `AUTH-${testInfo.project.name}-${Date.now()}`;

    // Novi korisnik → dashboard je prazan (ne vidi tuđe smjene).
    await register(page, email, password);
    await expect(page.getByText("Još nema unesenih smjena.")).toBeVisible();

    // Kreiraj smjenu.
    await page.getByRole("link", { name: "+ Nova smjena" }).click();
    await page.getByLabel("Lokal").fill(venue);
    await page.getByLabel("Napojnice — gotovina (€)").fill("40");
    await page.getByLabel("Broj gostiju").fill("33");
    await page.getByRole("button", { name: "Spremi smjenu" }).click();
    await expect(page.locator(".shift").filter({ hasText: venue })).toBeVisible();

    // Odjava → vraća nas na /login, a zaglavlje više ne nudi "Odjava".
    await page.getByRole("button", { name: "Odjava" }).click();
    await page.waitForURL((url) => url.pathname === "/login");

    // Ponovna prijava → smjena je i dalje tu (perzistira u bazi, vezana uz usera).
    await login(page, email, password);
    await expect(page.locator(".shift").filter({ hasText: venue })).toBeVisible();
  });

  test("odjavljeni korisnik je preusmjeren sa zaštićene rute na /login", async ({ page }) => {
    await page.context().clearCookies();
    await page.goto("/"); // dashboard je zaštićen
    await page.waitForURL((url) => url.pathname === "/login");
    await expect(page.getByRole("heading", { name: "Prijava" })).toBeVisible();
  });

  test("korisnik A ne vidi smjenu korisnika B (izolacija po useru)", async ({ browser }, testInfo) => {
    const stamp = `${testInfo.project.name}-${Date.now()}`;
    const venueA = `IZOLACIJA-A-${stamp}`;

    // Korisnik A u svom kontekstu (svoji kolačići) kreira smjenu.
    const ctxA = await browser.newContext();
    const pageA = await ctxA.newPage();
    await register(pageA, `a-${stamp}@napojnice.test`, "tajna12345");
    await pageA.getByRole("link", { name: "+ Nova smjena" }).click();
    await pageA.getByLabel("Lokal").fill(venueA);
    await pageA.getByRole("button", { name: "Spremi smjenu" }).click();
    await expect(pageA.locator(".shift").filter({ hasText: venueA })).toBeVisible();

    // Korisnik B u zasebnom kontekstu NE smije vidjeti A-ovu smjenu.
    const ctxB = await browser.newContext();
    const pageB = await ctxB.newPage();
    await register(pageB, `b-${stamp}@napojnice.test`, "tajna12345");
    await expect(pageB.getByText("Još nema unesenih smjena.")).toBeVisible();
    await expect(pageB.getByText(venueA)).toHaveCount(0);

    await ctxA.close();
    await ctxB.close();
  });
});
