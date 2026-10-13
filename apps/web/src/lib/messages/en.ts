import type { Line } from "@cp/core";

/** Copy for one product line's landing page. */
export interface LineCopy {
  /** Short title used in cards, page titles, and admin. */
  title: string;
  headline: string;
  subhead: string;
  /** Two product-specific points; age range and language points are added automatically. */
  points: [string, string];
  question: string;
  /** Labels for LINE_CATALOG[line].interestOptions (keys must match; tested). */
  options: Record<string, string>;
}

/**
 * English copy. `es.ts` must provide the same keys (enforced by the `Messages` type).
 * Senior-friendly writing: short sentences, plain words, no pressure tactics,
 * no claims of government affiliation, no price promises, no health questions.
 * Placeholders like {min} are filled with `fill()` from ../format.
 */
export const en = {
  languageName: "English",
  switchLanguage: "Español",
  draftBanner: "DRAFT — consent text is pending legal review. Do not send live traffic.",
  home: {
    metaTitle: "Insurance Options for Ages 50 and Up",
    headline: "Insurance that helps while you are living",
    subhead:
      "Choose a topic below. A licensed insurance agent can explain your options at no cost to talk.",
    learnMore: "See options",
    none: "No coverage options are available right now. Please check back soon.",
  },
  landing: {
    formTitle: "See your options",
    submit: "See My Options",
    submitting: "Sending…",
    freeToTalk: "No cost to talk with a licensed agent",
    ageRange: "Options for ages {min} to {max}",
    bilingual: "Help in English or Spanish",
    otherOptions: "Other coverage options",
  },
  lines: {
    long_term_care: {
      title: "Long-Term Care Insurance",
      headline: "Plan ahead for care as you age",
      subhead:
        "Long-term care insurance can help pay for care at home, in assisted living, or in a nursing home. Tell us a little about yourself and a licensed agent can go over your options.",
      points: ["Can help protect your savings from care costs", "Can help pay for care at home"],
      question: "What brings you here today?",
      options: {
        planning_ahead: "Planning ahead",
        comparing_options: "Comparing options",
        for_me_and_spouse: "Coverage for me and my spouse",
      },
    },
    home_health_care: {
      title: "Home Health Care Insurance",
      headline: "Help paying for care at home",
      subhead:
        "Home health care insurance can help pay for care in your home, like nurse visits, therapy, or help with daily activities. A licensed agent can go over your options.",
      points: ["Stay at home while you get care", "Can help with costs Medicare may not cover"],
      question: "What brings you here today?",
      options: {
        planning_ahead: "Planning ahead",
        comparing_options: "Comparing options",
        for_me_and_spouse: "Coverage for me and my spouse",
      },
    },
    critical_illness: {
      title: "Critical Illness Insurance",
      headline: "Cash when a serious illness happens",
      subhead:
        "Critical illness insurance can pay a lump sum of cash if you are diagnosed with a covered illness, like a heart attack, stroke, or cancer. You decide how to use the money.",
      points: [
        "Money is paid to you, not the hospital",
        "Use it for bills, travel, or everyday costs",
      ],
      question: "About how much coverage?",
      options: { "10000": "$10,000", "25000": "$25,000", "50000": "$50,000", "100000": "$100,000" },
    },
    hospital_indemnity: {
      title: "Hospital Indemnity Insurance",
      headline: "Cash for hospital stays",
      subhead:
        "Hospital indemnity insurance can pay you cash for covered hospital stays. It can help with deductibles, copays, and other costs your health plan does not pay.",
      points: ["Benefits are paid to you", "Can work alongside Medicare or other coverage"],
      question: "What matters most to you?",
      options: {
        high_out_of_pocket_costs: "Lowering out-of-pocket costs",
        planning_ahead: "Planning ahead",
        not_sure: "Not sure yet",
      },
    },
    life_living_benefits: {
      title: "Life Insurance with Living Benefits",
      headline: "Life insurance you may be able to use while living",
      subhead:
        "Some life insurance policies let you use part of the benefit early if you become seriously ill. A licensed agent can explain how living benefits work.",
      points: ["Protection for your family", "Possible access to money during a serious illness"],
      question: "About how much coverage?",
      options: {
        "25000": "$25,000",
        "50000": "$50,000",
        "100000": "$100,000",
        "250000": "$250,000",
      },
    },
    dental_vision_hearing: {
      title: "Dental, Vision & Hearing Insurance",
      headline: "Coverage for your teeth, eyes, and ears",
      subhead:
        "Original Medicare generally does not cover routine dental care, eyeglasses, or hearing aids. Dental, vision, and hearing insurance can help with these costs.",
      points: ["Help with cleanings, fillings, and dentures", "Help with glasses and hearing aids"],
      question: "What coverage do you want?",
      options: {
        dental: "Dental",
        vision: "Vision",
        hearing: "Hearing",
        all_three: "All three",
      },
    },
    medicare_supplement: {
      title: "Medicare Supplement Insurance",
      headline: "Help with costs Original Medicare does not pay",
      subhead:
        "Medicare Supplement (Medigap) insurance can help pay deductibles, copays, and coinsurance. A licensed agent can compare plans with you.",
      points: ["Works with Original Medicare", "Compare plans from different companies"],
      question: "Which describes you?",
      options: { turning_65: "Turning 65 soon", already_on_medicare: "Already on Medicare" },
    },
    final_expense: {
      title: "Final Expense Insurance",
      headline: "Help protect your family from final expenses",
      subhead:
        "Final expense insurance can help pay for funeral costs and final bills. A licensed agent can go over your options.",
      points: ["Small policies made for final costs", "Simple application"],
      question: "About how much coverage?",
      options: {
        "5000": "$5,000",
        "10000": "$10,000",
        "15000": "$15,000",
        "25000": "$25,000",
        "50000": "$50,000+",
      },
    },
  } satisfies Record<Line, LineCopy> as Record<Line, LineCopy>,
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
    age_out_of_range: "This coverage is for people ages {min} to {max}.",
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
      "This website is not connected with or endorsed by the U.S. government, the federal Medicare program, or any government agency. We are not an insurance company. Licensed agents can explain coverage options.",
  },
};

export type Messages = typeof en;
