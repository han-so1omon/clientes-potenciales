import { expect, type Page, test } from "@playwright/test";
import { sql } from "./db";

async function fillValidForm(page: Page, phone: string, zip = "33101") {
  await page.getByLabel(/^(First name|Nombre)$/).fill("Rosa");
  await page.getByLabel(/^(Last name|Apellido)$/).fill("Martínez");
  await page.getByLabel(/^(Phone number|Número de teléfono)/).fill(phone);
  await page.locator("select[name=birthMonth]").selectOption("4");
  await page.locator("input[name=birthDay]").fill("12");
  await page.locator("input[name=birthYear]").fill("1957");
  await page.getByLabel(/^(ZIP code|Código postal)/).fill(zip);
  await page.locator("input[name=consentGiven]").check();
}

test("English: submit form → thank-you page → lead and consent snapshot stored", async ({
  page,
}) => {
  await page.goto("/en/long-term-care?c=EXAMPLE-MAILER&utm_source=mail");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Plan ahead for care");
  const consentText = await page.locator("[data-tf-element-role=consent-language]").innerText();

  await fillValidForm(page, "(305) 555-2001");
  await page.getByLabel("What brings you here today?").selectOption("comparing_options");
  await page.getByRole("button", { name: "See My Options" }).click();
  await expect(page).toHaveURL(/\/en\/long-term-care\/thank-you$/);

  const [row] = await sql`
    SELECT l.status, l.state, l.language, l.line, l.interest, l.utm, c.code, s.rendered_text
    FROM leads l
    JOIN consent_snapshots s ON s.lead_id = l.id
    LEFT JOIN campaigns c ON c.id = l.campaign_id
    WHERE l.phone_e164 = '+13055552001'`;
  expect(row).toMatchObject({
    status: "received",
    state: "FL",
    language: "en",
    code: "EXAMPLE-MAILER",
  });
  expect(row?.rendered_text).toBe(consentText);
  expect(row?.utm).toMatchObject({ source: "mail" });
});

test("Spanish: errors are shown in Spanish and entered values are kept", async ({ page }) => {
  await page.goto("/es/long-term-care");
  await fillValidForm(page, "(305) 555-2002", "10001");
  await page.getByRole("button", { name: "Ver mis opciones" }).click();

  await expect(
    page.getByText("Lo sentimos, todavía no atendemos este código postal."),
  ).toBeVisible();
  await expect(page.getByLabel(/^Nombre$/)).toHaveValue("Rosa");
  const [count] = await sql`SELECT count(*)::int AS n FROM leads WHERE phone_e164 = '+13055552002'`;
  expect(count?.n).toBe(0);
});

test("consent checkbox is required", async ({ page }) => {
  await page.goto("/en/long-term-care");
  await fillValidForm(page, "(305) 555-2003");
  await page.locator("input[name=consentGiven]").uncheck();
  await page.getByRole("button", { name: "See My Options" }).click();
  await expect(page.getByText("Please check the box to continue.")).toBeVisible();
});

test("opt-out suppresses existing leads for that phone", async ({ page }) => {
  await page.goto("/en/long-term-care");
  await fillValidForm(page, "(305) 555-2004");
  await page.getByRole("button", { name: "See My Options" }).click();
  await expect(page).toHaveURL(/thank-you$/);

  await page.goto("/en/opt-out");
  await page.getByLabel("Phone number").fill("305-555-2004");
  await page.getByRole("button", { name: "Stop contacting me" }).click();
  await expect(page.getByRole("status")).toContainText("Your request was received");

  const [row] = await sql`SELECT status FROM leads WHERE phone_e164 = '+13055552004'`;
  expect(row?.status).toBe("suppressed");
});

test("language switch keeps tracking parameters", async ({ page }) => {
  await page.goto("/en/long-term-care?c=EXAMPLE-MAILER");
  await page.getByRole("link", { name: "Español" }).click();
  await expect(page).toHaveURL(/\/es\/long-term-care\?c=EXAMPLE-MAILER$/);
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});

test("home page lists switched-on products only", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/en$/);
  await expect(page.getByRole("link", { name: /Long-Term Care Insurance/ })).toBeVisible();
  await expect(page.getByRole("link", { name: /Final Expense/ })).toHaveCount(0);
  const res = await page.goto("/en/final-expense");
  expect(res?.status()).toBe(404);
});

test("each product asks its own question and states the admin's age range", async ({ page }) => {
  await page.goto("/es/dental-vision-hearing");
  await expect(page.getByLabel("¿Qué cobertura desea?")).toBeVisible();
  await expect(page.getByText("Opciones para personas de 50 a 89 años")).toBeVisible();
  await expect(page.locator("[data-tf-element-role=consent-language]")).toContainText(
    "seguro dental, de visión y de audición",
  );
});
