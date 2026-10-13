import { describe, expect, it } from "vitest";
import {
  addDays,
  isFollowUpDue,
  linesToPitch,
  type OutreachContext,
  outreachDraftSchema,
  outreachFooter,
  parseProspectCsv,
  prospectInputSchema,
  templateOutreachDraft,
} from "./prospects";

describe("prospectInputSchema", () => {
  it("normalizes lists and casing", () => {
    const parsed = prospectInputSchema.parse({
      name: " Ana Ruiz ",
      email: "Ana@Agency.COM",
      state: "fl",
      licensedStates: "fl; GA, ga",
      lines: "long-term-care; critical_illness",
      languages: "EN|es",
      npn: "1234567",
    });
    expect(parsed).toMatchObject({
      name: "Ana Ruiz",
      type: "agent",
      email: "ana@agency.com",
      state: "FL",
      licensedStates: ["FL", "GA"],
      lines: ["long_term_care", "critical_illness"],
      languages: ["en", "es"],
      npn: "1234567",
    });
  });

  it("defaults empty lists", () => {
    expect(prospectInputSchema.parse({ name: "X" })).toMatchObject({
      licensedStates: [],
      lines: [],
      languages: [],
    });
  });

  it.each([
    [{ name: "" }, "name"],
    [{ name: "X", email: "nope" }, "email"],
    [{ name: "X", licensedStates: "FL;ZZ" }, "licensedStates"],
    [{ name: "X", lines: "pet_insurance" }, "lines"],
    [{ name: "X", npn: "12ab" }, "npn"],
    [{ name: "X", phone: "123" }, "phone"],
    [{ name: "X", type: "robot" }, "type"],
  ])("rejects %o (%s)", (input, field) => {
    const result = prospectInputSchema.safeParse(input);
    expect(result.success).toBe(false);
    expect(result.error?.issues[0]?.path[0]).toBe(field);
  });
});

describe("parseProspectCsv", () => {
  it("imports valid rows and reports invalid ones with spreadsheet row numbers", () => {
    const csv = [
      "Name,Company,Type,Email,Licensed States,Lines,Languages,Favorite Color",
      "Ana Ruiz,Ruiz Agency,agency,ana@ruiz.com,FL;GA,long_term_care,en;es,blue",
      ",No Name Co,agency,,,,,",
      "Bob Lee,,agent,not-an-email,,,,",
    ].join("\n");
    const result = parseProspectCsv(csv);
    expect(result.prospects).toHaveLength(1);
    expect(result.prospects[0]).toMatchObject({
      row: 2,
      input: {
        name: "Ana Ruiz",
        type: "agency",
        licensedStates: ["FL", "GA"],
        languages: ["en", "es"],
      },
    });
    expect(result.errors.map((e) => e.row)).toEqual([3, 4]);
    expect(result.errors[1]?.messages[0]).toMatch(/^email/);
    expect(result.unknownColumns).toEqual(["favorite_color"]);
  });

  it("requires a name column", () => {
    expect(parseProspectCsv("company\nAcme").errors[0]?.messages[0]).toMatch(/name/);
  });

  it("handles an empty file", () => {
    expect(parseProspectCsv("").errors).toHaveLength(1);
  });
});

describe("follow-ups", () => {
  const today = new Date("2026-10-13T20:00:00Z");
  it("adds days in UTC", () => {
    expect(addDays(today, 4)).toBe("2026-10-17");
    expect(addDays(new Date("2026-12-30T00:00:00Z"), 3)).toBe("2027-01-02");
  });
  it("is due on or before today", () => {
    expect(isFollowUpDue("2026-10-13", today)).toBe(true);
    expect(isFollowUpDue("2026-10-01", today)).toBe(true);
    expect(isFollowUpDue("2026-10-14", today)).toBe(false);
    expect(isFollowUpDue(null, today)).toBe(false);
  });
});

const ctx: OutreachContext = {
  prospect: {
    name: "Ana Ruiz",
    company: "Ruiz Agency",
    type: "agency",
    licensedStates: ["FL", "TX"],
    lines: ["long_term_care", "medicare_supplement"],
    languages: ["en", "es"],
  },
  offeredLines: ["long_term_care", "critical_illness"],
  serviceStates: ["FL", "GA"],
  senderName: "Sam",
  businessName: "Example Leads LLC",
  touch: 1,
  language: "en",
};

describe("outreach", () => {
  it("pitches only lines we offer that the prospect sells, else all we offer", () => {
    expect(linesToPitch(ctx)).toEqual(["long_term_care"]);
    expect(linesToPitch({ ...ctx, prospect: { ...ctx.prospect, lines: [] } })).toEqual([
      "long_term_care",
      "critical_illness",
    ]);
  });

  it("writes a first-touch template mentioning overlapping states, products, and Spanish leads", () => {
    const draft = templateOutreachDraft(ctx);
    expect(draft.subject).toBe("Long-term care insurance leads in FL");
    expect(draft.body).toContain("Hi Ana,");
    expect(draft.body).toContain("long-term care insurance in FL");
    expect(draft.body).toContain("Spanish-speaking leads");
    expect(outreachDraftSchema.safeParse(draft).success).toBe(true);
  });

  it("writes follow-ups and Spanish drafts", () => {
    expect(templateOutreachDraft({ ...ctx, touch: 2 }).subject).toMatch(/^Following up/);
    const es = templateOutreachDraft({ ...ctx, language: "es" });
    expect(es.body).toContain("Hola Ana:");
    expect(es.body).toContain("seguro de cuidado a largo plazo");
  });

  it("has a CAN-SPAM footer with address and opt-out in both languages", () => {
    const footer = outreachFooter({
      businessName: "Example Leads LLC",
      mailingAddress: "1 Main St",
      language: "en",
    });
    expect(footer).toContain("1 Main St");
    expect(footer).toContain("unsubscribe");
    expect(outreachFooter({ businessName: "X", mailingAddress: "Y", language: "es" })).toContain(
      "no más correos",
    );
  });
});
