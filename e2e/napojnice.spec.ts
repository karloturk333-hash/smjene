import { test, expect } from "@playwright/test";
import { login, DEMO } from "./helpers";

// describe = "kutija" koja grupira povezane testove pod jednim imenom.
test.describe("Napojnice — dashboard", () => {
  // Svaki test() dobije svjež "page" = nova prazna kartica browsera.

  // Dashboard je sada iza prijave → prvo se logiramo kao seed demo korisnik
  // (koji ima 14 zasijanih smjena). Tek onda testovi vide podatke.
  test.beforeEach(async ({ page }) => {
    await login(page, DEMO.email, DEMO.password);
  });

  test("dashboard se učita: naslov + kartice + lista", async ({ page }) => {
    await page.goto("/"); // baseURL + "/" → http://localhost:5173/
    // getByRole = nađi po ULOZI + imenu (isto što vidi čitač ekrana).
    await expect(page.getByRole("heading", { name: "Pregled" })).toBeVisible();
    // getByText = nađi po vidljivom tekstu (oznaka stat-kartice).
    await expect(page.getByText("Po satu")).toBeVisible();
    // "Uredi" je POVEZNICA (vodi na detalj), ne gumb → role: "link".
    // Ako postoji bar jedan → postoji bar jedna smjena u listi.
    await expect(page.getByRole("link", { name: "Uredi" }).first()).toBeVisible();
  });

  test("period toggle: klik 'Sve' odabere taj tab", async ({ page }) => {
    await page.goto("/");
    const tjedan = page.getByRole("tab", { name: "Tjedan" });
    const sve = page.getByRole("tab", { name: "Sve" });
    // Po defaultu je "Tjedan" odabran (aria-selected="true").
    await expect(tjedan).toHaveAttribute("aria-selected", "true");
    await sve.click(); // klikni tab "Sve"
    // Sad je "Sve" odabran, a "Tjedan" nije.
    await expect(sve).toHaveAttribute("aria-selected", "true");
    await expect(tjedan).toHaveAttribute("aria-selected", "false");
  });

  test("forma ima sva polja (uklj. Broj gostiju)", async ({ page }) => {
    await page.goto("/smjene/nova");
    await expect(page.getByRole("heading", { name: "Nova smjena" })).toBeVisible();
    // getByLabel = nađi polje po tekstu njegove <label> oznake.
    await expect(page.getByLabel("Datum")).toBeVisible();
    await expect(page.getByLabel("Broj gostiju")).toBeVisible(); // naše novo polje
    await expect(page.getByLabel("Lokal")).toBeVisible();
    await expect(page.getByRole("button", { name: "Spremi smjenu" })).toBeVisible();
  });

  test("dodaj smjenu → pojavi se → obriši → nestane", async ({ page }, testInfo) => {
    // Jedinstven naziv da se testovi (desktop+mobile) ne sudaraju u istoj bazi.
    const venue = `QA-${testInfo.project.name}-${Date.now()}`;

    await page.goto("/smjene/nova");
    await page.getByLabel("Lokal").fill(venue);
    await page.getByLabel("Napojnice — gotovina (€)").fill("50");
    await page.getByLabel("Broj gostiju").fill("30");
    await page.getByRole("button", { name: "Spremi smjenu" }).click();

    // Nakon spremanja app nas vrati na dashboard; nova smjena mora biti tu.
    const row = page.locator(".shift").filter({ hasText: venue });
    await expect(row).toBeVisible();

    // Obriši baš tu smjenu (njezin gumb "Obriši" unutar tog retka).
    await row.getByRole("button", { name: "Obriši" }).click();
    // I provjeri da je nestala (čistimo za sobom).
    await expect(page.getByText(venue)).toHaveCount(0);
  });
});
