import { expect, test } from "@playwright/test";
import { E2E_ENV } from "../playwright.config";

test("admin pages require sign-in", async ({ page, request }) => {
  await page.goto("/admin/leads");
  await expect(page).toHaveURL(/\/admin\/login$/);
  const res = await request.get("/admin/leads/export");
  expect(res.status()).toBe(401);
});

test("wrong password is rejected", async ({ page }) => {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill("wrong-password");
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByText("Incorrect password.")).toBeVisible();
});

test("owner sees leads, lead detail shows draft-consent blocker, export excludes it", async ({
  page,
}) => {
  await page.goto("/en/final-expense");
  await page.getByLabel("First name").fill("Admin");
  await page.getByLabel("Last name").fill("Check");
  await page.getByLabel(/^Phone number/).fill("(305) 555-2099");
  await page.locator("select[name=birthMonth]").selectOption("1");
  await page.locator("input[name=birthDay]").fill("5");
  await page.locator("input[name=birthYear]").fill("1955");
  await page.getByLabel(/^ZIP code/).fill("30301");
  await page.locator("input[name=consentGiven]").check();
  await page.getByRole("button", { name: "See My Options" }).click();
  await expect(page).toHaveURL(/thank-you$/);

  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(E2E_ENV.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/leads$/);
  await expect(page.getByRole("cell", { name: "+13055552099" })).toBeVisible();

  await page
    .getByRole("row", { name: /\+13055552099/ })
    .getByRole("link")
    .click();
  await expect(page.getByText("Consent text not yet approved by counsel")).toBeVisible();
  await expect(page.getByText("Consent record (immutable)")).toBeVisible();

  const res = await page.request.get("/admin/leads/export");
  expect(res.status()).toBe(200);
  const body = await res.text();
  expect(body.trim().split("\r\n")).toHaveLength(1); // header only: draft consent is not sellable
});
