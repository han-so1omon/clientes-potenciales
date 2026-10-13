# Runbook: finding lead buyers (Admin → Buyer finder)

## Who to look for
- **Independent agents and small agencies** licensed in our service states that sell the products we
  have switched on (long-term care, critical illness, hospital indemnity, etc.). Fast to start, small volume.
- **Agencies and call centers** that buy steady volume. Best first customers.
- **FMOs / IMOs** (marketing organizations that support many agents). One relationship can reach many buyers.
- **Spanish-speaking agents** — they value Spanish-speaking leads, which are harder to find.

## Where to find them
- State insurance department licensee lookups (e.g. Florida DFS, Georgia OCI, and the other service
  states). Some offer downloadable lists. **Check each site's terms of use before importing or emailing.**
- FMO/IMO websites and their agent events.
- Senior-market agent groups (Facebook, LinkedIn) and industry conferences.
- Record where each prospect came from in **source**; the pipeline then shows which sources produce paying buyers.

## Working the pipeline
1. Add prospects one at a time or **Import CSV** (template on the import page). Duplicates (same email
   or NPN) are skipped automatically.
2. Open a prospect → **Draft email**. With `ANTHROPIC_API_KEY` set, Claude writes a personalized
   draft; otherwise a template is used. **Always read and edit before sending.**
3. Send it from your own email (**Open in my email app** or **Copy**), then click **I sent it — log it**.
   The prospect moves to *Contacted* and a follow-up is scheduled 4 days out.
4. Each morning, filter **Follow-up due**. Send at most 2–3 follow-ups, then mark *Lost* or wait.
5. When they reply, set the stage to *Replied*; when you send free/discount leads, log a
   **Trial leads sent** activity and set *Trial sent*; when they pay, set *Paying*.

## Rules (CAN-SPAM and good practice)
- Every email carries your business name, postal address, and an opt-out line (added automatically;
  set `BUSINESS_NAME`, `BUSINESS_MAILING_ADDRESS`, `OUTREACH_SENDER_NAME` on the server).
- If anyone asks to stop, click **Mark do not contact** the same day. Outreach is then disabled.
- Subject lines must be honest; never imply a prior relationship that doesn't exist.
- Email and LinkedIn only — no automated cold calls or texts to prospects.
- Never promise volumes, contact rates, or prices you haven't set; the AI is instructed not to invent numbers.
