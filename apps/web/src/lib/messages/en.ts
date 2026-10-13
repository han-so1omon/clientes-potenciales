/**
 * English copy. `es.ts` must provide the same keys (enforced by the `Messages` type).
 * Senior-friendly writing: short sentences, plain words, no pressure tactics,
 * no claims of government affiliation, no price promises.
 */
export const en = {
  languageName: "English",
  switchLanguage: "Español",
  draftBanner: "DRAFT — consent text is pending legal review. Do not send live traffic.",
  finalExpense: {
    metaTitle: "Final Expense Insurance Options",
    headline: "Help protect your family from final expenses",
    subhead:
      "Final expense insurance can help pay for funeral costs and final bills. Tell us a little about yourself and a licensed insurance agent can go over your options.",
    bullets: [
      "No cost to talk with an agent",
      "Coverage options for ages 50 to 85",
      "Help in English or Spanish",
    ],
    formTitle: "See your options",
    submit: "See My Options",
    submitting: "Sending…",
  },
  fields: {
    firstName: "First name",
    lastName: "Last name",
    phone: "Phone number",
    phoneHint: "Example: (305) 555-1234",
    email: "Email (optional)",
    birthDate: "Date of birth",
    birthMonth: "Month",
    birthDay: "Day",
    birthYear: "Year",
    zip: "ZIP code",
    coverageAmount: "About how much coverage?",
    bestTimeToCall: "Best time to call",
    consent: "I have read and agree to the statement below.",
  },
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ],
  callTimes: { morning: "Morning", afternoon: "Afternoon", evening: "Evening", any: "Any time" },
  errors: {
    required: "Please fill in this field.",
    invalid: "Please check this field.",
    invalid_phone: "Please enter a 10-digit U.S. phone number.",
    invalid_date: "Please check the date.",
    age_out_of_range: "This coverage is for people ages 50 to 85.",
    out_of_area: "Sorry, we do not serve this ZIP code yet.",
    consent_required: "Please check the box to continue.",
    form: "Something went wrong. Please try again.",
    summary: "Please fix the items marked below.",
  },
  thankYou: {
    metaTitle: "Thank You",
    headline: "Thank you!",
    body: "We received your request. A licensed insurance agent may call you soon to go over your options.",
    note: "You can stop being contacted at any time.",
    optOutLink: "Stop contact",
  },
  optOut: {
    metaTitle: "Stop Contact",
    headline: "Stop calls, texts, and emails",
    body: "Enter your phone number or email. We will stop selling your information and tell our partners to stop contacting you.",
    phone: "Phone number",
    email: "Email",
    submit: "Stop contacting me",
    needOne: "Please enter a phone number or an email.",
    done: "Done. Your request was received. It may take up to 10 business days for all contact to stop.",
  },
  legalPending: {
    privacyTitle: "Privacy Policy",
    termsTitle: "Terms of Use",
    partnersTitle: "Our Partners",
    body: "This page is being finalized.",
  },
  footer: {
    privacy: "Privacy Policy",
    terms: "Terms of Use",
    partners: "Partners",
    optOut: "Stop contact",
    disclaimer:
      "This website is not connected with or endorsed by the U.S. government or any government agency. We are not an insurance company. Licensed agents can explain coverage options.",
  },
};

export type Messages = typeof en;
