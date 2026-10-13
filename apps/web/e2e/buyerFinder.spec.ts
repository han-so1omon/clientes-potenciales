import { expect, type Page, test } from "@playwright/test";
import { E2E_ENV } from "../playwright.config";

async function signIn(page: Page) {
  await page.goto("/admin/login");
  await page.getByLabel("Password").fill(E2E_ENV.ADMIN_PASSWORD);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page).toHaveURL(/\/admin\/leads$/);
}

test("add a prospect, draft outreach, log it as sent", async ({ page }) => {
  await signIn(page);
  await page.getByRole("link", { name: "Buyer finder" }).click();
  await page.getByRole("link", { name: "Add prospect" }).click();

  await page.getByLabel("Name *").fill("Ana Ruiz");
  await page.getByLabel("Company").fill("Ruiz Agency");
  await page.getByLabel("Type").selectOption("agency");
  await page.getByLabel("Email").fill("ana@ruiz.example");
  await page.getByLabel("Licensed in states").fill("fl, ga");
  await page.getByLabel("Long-Term Care Insurance").check();
  await page.getByLabel("English").check();
  await page.getByLabel("Spanish").check();
  await page.getByRole("button", { name: "Add prospect" }).click();

  await expect(page.getByRole("heading", { name: "Ana Ruiz" })).toBeVisible();
  await expect(page.getByText("Licensed in: FL, GA")).toBeVisible();

  await page.getByRole("button", { name: "Draft email" }).click();
  await expect(page.getByLabel("Subject")).toHaveValue(
    "Long-term care insurance leads in FL and GA",
  );
  await expect(page.getByLabel("Message")).toHaveValue(/Hi Ana,[\s\S]*Spanish-speaking leads/);
  await expect(page.getByText("123 Main St, Miami, FL 33101")).toBeVisible();
  await expect(page.getByRole("link", { name: "Open in my email app" })).toHaveAttribute(
    "href",
    /^mailto:ana%40ruiz\.example\?subject=/,
  );

  await page.getByRole("button", { name: "I sent it — log it" }).click();
  await expect(page.getByRole("status")).toContainText("Logged. Next follow-up:");
  await expect(page.getByText("Email #2")).toBeVisible();
  await expect(page.getByLabel("Stage")).toHaveValue("contacted");
  await expect(
    page.getByText("Email sent: Long-term care insurance leads in FL and GA"),
  ).toBeVisible();
});

test("duplicate emails are refused", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/prospects/new");
  await page.getByLabel("Name *").fill("Someone Else");
  await page.getByLabel("Email").fill("ANA@ruiz.example");
  await page.getByRole("button", { name: "Add prospect" }).click();
  await expect(page.getByText(/already exists: Ana Ruiz/)).toBeVisible();
});

test("import a CSV, then filter the pipeline", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/prospects/import");
  const csv = [
    "name,company,type,email,licensed_states,lines,languages",
    "Bob Lee,Lee Insurance,agent,bob@lee.example,TN,critical_illness,en",
    "Ana Again,,agent,ana@ruiz.example,FL,,",
    ",Nameless,agent,,,,",
  ].join("\n");
  await page
    .getByLabel("CSV file")
    .setInputFiles({ name: "list.csv", mimeType: "text/csv", buffer: Buffer.from(csv) });
  await page.getByRole("button", { name: "Import" }).click();
  await expect(page.getByText("Imported 1 prospect.")).toBeVisible();
  await expect(page.getByText(/Skipped 1 already in the list.*row 3 \(Ana Again\)/)).toBeVisible();
  await expect(page.getByText(/Row 4: name/)).toBeVisible();

  await page.goto("/admin/prospects?line=critical_illness");
  await expect(page.getByRole("link", { name: "Bob Lee" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Ana Ruiz" })).toHaveCount(0);
  await page.getByRole("link", { name: /^Contacted \(1\)$/ }).click();
  await expect(page.getByRole("link", { name: "Ana Ruiz" })).toBeVisible();
});

test("do-not-contact turns outreach off", async ({ page }) => {
  await signIn(page);
  await page.goto("/admin/prospects?q=bob");
  await page.getByRole("link", { name: "Bob Lee" }).click();
  await page.getByRole("button", { name: "Mark do not contact" }).click();
  await expect(page.getByText("Outreach is turned off.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Draft email" })).toHaveCount(0);
  await page.getByRole("button", { name: "Allow contact again" }).click();
  await expect(page.getByRole("button", { name: "Draft email" })).toBeVisible();
});
