"use client";

import { CALL_TIMES, COVERAGE_AMOUNTS, type Language } from "@cp/core";
import { useActionState, useEffect, useState } from "react";
import type { Messages } from "@/lib/messages";
import { type LeadFormState, submitLead } from "./actions";
import { TrustedFormScript } from "./TrustedFormScript";

interface Props {
  t: Messages;
  language: Language;
  consentVersionId: string;
  consentText: string;
  tracking: Record<string, string>;
  trustedFormEnabled: boolean;
}

const initialState: LeadFormState = { errors: {}, values: {} };
const inputClass =
  "mt-1 block w-full rounded-lg border-2 border-gray-400 px-3 py-3 text-lg aria-[invalid=true]:border-red-600";

export function LeadForm({
  t,
  language,
  consentVersionId,
  consentText,
  tracking,
  trustedFormEnabled,
}: Props) {
  const [state, action, pending] = useActionState(submitLead, initialState);
  const [startedAt, setStartedAt] = useState("");
  useEffect(() => setStartedAt(String(Date.now())), []);

  const v = state.values;
  const errorFor = (field: string) => {
    const code = state.errors[field];
    return code ? t.errors[code] : undefined;
  };
  const hasErrors = Object.keys(state.errors).length > 0;

  const field = (name: string, label: string, input: React.ReactNode, hint?: string) => {
    const error = errorFor(name);
    return (
      <div>
        <label htmlFor={name} className="block font-semibold">
          {label}
        </label>
        {hint && <p className="text-base text-gray-600">{hint}</p>}
        {input}
        {error && (
          <p id={`${name}-error`} className="mt-1 font-semibold text-red-700">
            {error}
          </p>
        )}
      </div>
    );
  };
  const aria = (name: string) => ({
    "aria-invalid": Boolean(state.errors[name]),
    "aria-describedby": state.errors[name] ? `${name}-error` : undefined,
  });

  return (
    <form action={action} className="space-y-5" noValidate>
      {hasErrors && (
        <p role="alert" className="rounded-lg bg-red-50 p-3 font-semibold text-red-800">
          {state.errors.form ? t.errors.form : t.errors.summary}
        </p>
      )}
      <input type="hidden" name="line" value="final_expense" />
      <input type="hidden" name="language" value={language} />
      <input type="hidden" name="consentVersionId" value={consentVersionId} />
      <input type="hidden" name="formStartedAt" value={v.formStartedAt ?? startedAt} />
      {Object.entries(tracking).map(([name, value]) => (
        <input key={name} type="hidden" name={name} value={value} />
      ))}
      {/* Honeypot: hidden from people and screen readers; bots often fill it. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" defaultValue="" />
        </label>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "firstName",
          t.fields.firstName,
          <input
            id="firstName"
            name="firstName"
            autoComplete="given-name"
            defaultValue={v.firstName}
            className={inputClass}
            {...aria("firstName")}
          />,
        )}
        {field(
          "lastName",
          t.fields.lastName,
          <input
            id="lastName"
            name="lastName"
            autoComplete="family-name"
            defaultValue={v.lastName}
            className={inputClass}
            {...aria("lastName")}
          />,
        )}
      </div>

      {field(
        "phone",
        t.fields.phone,
        <input
          id="phone"
          name="phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          defaultValue={v.phone}
          className={inputClass}
          {...aria("phone")}
        />,
        t.fields.phoneHint,
      )}

      {field(
        "email",
        t.fields.email,
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          defaultValue={v.email}
          className={inputClass}
          {...aria("email")}
        />,
      )}

      <fieldset>
        <legend className="font-semibold">{t.fields.birthDate}</legend>
        <div className="mt-1 grid grid-cols-3 gap-3">
          <label className="block">
            <span className="text-base text-gray-600">{t.fields.birthMonth}</span>
            <select
              name="birthMonth"
              defaultValue={v.birthMonth ?? ""}
              className={inputClass}
              {...aria("birthMonth")}
            >
              <option value="" disabled>
                —
              </option>
              {t.months.map((month, i) => (
                <option key={month} value={String(i + 1)}>
                  {month}
                </option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-base text-gray-600">{t.fields.birthDay}</span>
            <input
              name="birthDay"
              inputMode="numeric"
              maxLength={2}
              autoComplete="bday-day"
              defaultValue={v.birthDay}
              className={inputClass}
              {...aria("birthDay")}
            />
          </label>
          <label className="block">
            <span className="text-base text-gray-600">{t.fields.birthYear}</span>
            <input
              name="birthYear"
              inputMode="numeric"
              maxLength={4}
              autoComplete="bday-year"
              defaultValue={v.birthYear}
              className={inputClass}
              {...aria("birthYear")}
            />
          </label>
        </div>
        {["birthMonth", "birthDay", "birthYear"].map((name) => {
          const error = errorFor(name);
          return error ? (
            <p key={name} id={`${name}-error`} className="mt-1 font-semibold text-red-700">
              {error}
            </p>
          ) : null;
        })}
      </fieldset>

      {field(
        "zip",
        t.fields.zip,
        <input
          id="zip"
          name="zip"
          inputMode="numeric"
          maxLength={5}
          autoComplete="postal-code"
          defaultValue={v.zip}
          className={inputClass}
          {...aria("zip")}
        />,
      )}

      <div className="grid gap-5 sm:grid-cols-2">
        {field(
          "coverageAmount",
          t.fields.coverageAmount,
          <select
            id="coverageAmount"
            name="coverageAmount"
            defaultValue={v.coverageAmount ?? "10000"}
            className={inputClass}
            {...aria("coverageAmount")}
          >
            {COVERAGE_AMOUNTS.map((amount) => (
              <option key={amount} value={amount}>
                ${Number(amount).toLocaleString("en-US")}
                {amount === "50000" ? "+" : ""}
              </option>
            ))}
          </select>,
        )}
        {field(
          "bestTimeToCall",
          t.fields.bestTimeToCall,
          <select
            id="bestTimeToCall"
            name="bestTimeToCall"
            defaultValue={v.bestTimeToCall ?? "any"}
            className={inputClass}
            {...aria("bestTimeToCall")}
          >
            {CALL_TIMES.map((time) => (
              <option key={time} value={time}>
                {t.callTimes[time]}
              </option>
            ))}
          </select>,
        )}
      </div>

      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <label className="flex items-start gap-3 font-semibold">
          <input
            type="checkbox"
            name="consentGiven"
            value="yes"
            defaultChecked={v.consentGiven === "yes"}
            className="mt-1 h-7 w-7 shrink-0"
            {...aria("consentGiven")}
          />
          <span>{t.fields.consent}</span>
        </label>
        {errorFor("consentGiven") && (
          <p id="consentGiven-error" className="mt-1 font-semibold text-red-700">
            {errorFor("consentGiven")}
          </p>
        )}
        {/* Exact text stored in the consent snapshot. data-tf-element-role marks it for TrustedForm. */}
        <p className="mt-3 text-base text-gray-800" data-tf-element-role="consent-language">
          {consentText}
        </p>
      </div>

      <button
        type="submit"
        disabled={pending}
        data-tf-element-role="submit"
        className="w-full rounded-lg bg-brand px-6 py-4 text-xl font-bold text-white hover:bg-brand-dark disabled:opacity-60"
      >
        {pending ? t.finalExpense.submitting : t.finalExpense.submit}
      </button>
      {trustedFormEnabled && <TrustedFormScript />}
    </form>
  );
}
