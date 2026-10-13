"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { type DraftResult, draftEmailAction, markEmailSentAction } from "../actions";

interface Props {
  prospectId: string;
  email: string | null;
  defaultLanguage: "en" | "es";
  touch: number;
  aiEnabled: boolean;
  missingSettings: string[];
}

const input = "mt-1 block w-full rounded border-2 border-gray-300 px-2 py-1";

/**
 * Draft → review/edit → send from your own email app → log it.
 * Emails are never sent automatically.
 */
export function OutreachComposer({
  prospectId,
  email,
  defaultLanguage,
  touch,
  aiEnabled,
  missingSettings,
}: Props) {
  const router = useRouter();
  const [language, setLanguage] = useState(defaultLanguage);
  const [draft, setDraft] = useState<DraftResult | null>(null);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const fullBody = draft?.footer ? `${body}\n\n${draft.footer}` : body;
  const mailto = email
    ? `mailto:${encodeURIComponent(email)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(fullBody)}`
    : undefined;

  const generate = () =>
    startTransition(async () => {
      setStatus(null);
      const result = await draftEmailAction(prospectId, language);
      setDraft(result);
      if (result.status === "drafted") {
        setSubject(result.subject ?? "");
        setBody(result.body ?? "");
      }
    });

  const markSent = () =>
    startTransition(async () => {
      const result = await markEmailSentAction(prospectId, { subject, body: fullBody });
      setStatus(result.message);
      if (result.status === "recorded") {
        setDraft(null);
        router.refresh();
      }
    });

  return (
    <div className="space-y-3">
      {missingSettings.length > 0 && (
        <p className="rounded bg-amber-100 p-2 text-sm text-amber-950">
          Set {missingSettings.join(", ")} in the server settings so emails show your real name and
          the postal address required by law (CAN-SPAM).
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <span className="font-semibold">Email #{touch}</span>
        <label className="flex items-center gap-2">
          Language
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value === "es" ? "es" : "en")}
            className="rounded border-2 border-gray-300 px-2 py-1"
          >
            <option value="en">English</option>
            <option value="es">Spanish</option>
          </select>
        </label>
        <button
          type="button"
          onClick={generate}
          disabled={pending}
          className="rounded bg-brand px-3 py-1 font-semibold text-white"
        >
          {pending && !draft ? "Drafting…" : draft ? "Redraft" : "Draft email"}
        </button>
        <span className="text-sm text-gray-600">
          {aiEnabled
            ? "Drafted by Claude; review before sending."
            : "Template draft (add an AI key for personalized drafts)."}
        </span>
      </div>

      {draft?.status === "error" && <p className="text-red-700">{draft.message}</p>}
      {draft?.warning && <p className="text-sm text-amber-800">{draft.warning}</p>}

      {draft?.status === "drafted" && (
        <div className="space-y-2">
          <label className="block">
            <span className="font-semibold">Subject</span>
            <input value={subject} onChange={(e) => setSubject(e.target.value)} className={input} />
          </label>
          <label className="block">
            <span className="font-semibold">Message</span>
            <textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={10}
              className={input}
            />
          </label>
          <pre className="whitespace-pre-wrap rounded bg-gray-100 p-2 text-sm text-gray-700">
            {draft.footer}
          </pre>
          <div className="flex flex-wrap gap-3">
            {mailto ? (
              <a
                href={mailto}
                className="rounded border-2 border-brand px-3 py-1 font-semibold text-brand"
              >
                Open in my email app
              </a>
            ) : (
              <span className="text-sm text-gray-600">No email address on file.</span>
            )}
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(`Subject: ${subject}\n\n${fullBody}`)}
              className="rounded border-2 border-gray-400 px-3 py-1 font-semibold"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={markSent}
              disabled={pending}
              className="rounded bg-green-700 px-3 py-1 font-semibold text-white"
            >
              I sent it — log it
            </button>
          </div>
        </div>
      )}
      {status && (
        <p role="status" className="font-semibold text-green-800">
          {status}
        </p>
      )}
    </div>
  );
}
