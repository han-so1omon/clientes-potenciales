> **DRAFT — FOR ATTORNEY REVIEW. NOT LEGAL ADVICE. DO NOT USE LIVE UNTIL APPROVED.**
> Version: draft-0.1 (2026-10-13)

# Lead Purchase Agreement

**Agreement version:** `buyer-agreement-v0.1-draft` (the version identifier accepted by each buyer is
stored with a timestamp; see Section 20).

This Lead Purchase Agreement (the "**Agreement**") is between **{{COMPANY_LEGAL_NAME}}**, a
{{STATE_OF_FORMATION}} limited liability company doing business as {{BRAND_NAME}}, with its address
at {{MAILING_ADDRESS}} ("**Company**," "**we**," "**us**"), and the person or entity that accepts this
Agreement through the Company's buyer portal ("**Buyer**," "**you**").

> Counsel note: bracketed text marked **[COUNSEL]** is a drafting question or option, not agreement
> text. Remove before use.

---

## 1. Definitions

- **Lead** — information about a consumer who asked to be contacted about an insurance product, as
  delivered by Company, including contact details, the Consent Record, and related metadata.
- **Consent Record** — the record Company keeps of the consumer's consent: the exact disclosure text
  shown, consent version, date/time, IP address, user agent, page URL, language and the
  TrustedForm (or similar) certificate link.
- **Line** — the insurance product the consumer asked about (initially final expense insurance).
- **Exclusive Lead** — a Lead sold in real time to one buyer only (Section 4.2).
- **Shared Lead** — a Lead sold in real time to no more than three (3) buyers (Section 4.3).
- **Aged Lead** — a Lead that is at least thirty (30) days old at the time of sale (Section 4.4).
- **Campaign** — the filters, caps, schedule, product type and price per lead that Buyer sets up in the
  portal.
- **Wallet** — Buyer's prepaid account balance with Company, as shown in the portal ledger.
- **Delivery** — the moment Company sends a Lead to Buyer by webhook, email, portal or other agreed
  method. The Delivery timestamp in Company's system controls.
- **Suppression Notice** — a notice from Company that a consumer has opted out, asked for deletion, or
  must not be contacted for another reason.
- **Applicable Law** — all laws, rules and regulations that apply to a party's activities under this
  Agreement, including the Telephone Consumer Protection Act (47 U.S.C. § 227) and FCC rules, the
  Telemarketing Sales Rule (16 C.F.R. Part 310), CAN-SPAM, state telemarketing and telephone
  solicitation laws (including the Florida Telephone Solicitation Act), state insurance laws and
  regulations, and privacy and data security laws.
- **Personal Information** — any information in a Lead that identifies or could reasonably identify a
  consumer.

## 2. Relationship; Company's role

2.1 Company is a **marketing and lead generation company**. Company is **not an insurance company**
and does not sell, solicit, negotiate or advise on insurance. **[COUNSEL: update this sentence if/when
the owner becomes licensed; see README question on licensure.]**

2.2 Buyer is solely responsible for all insurance sales activity, including suitability, quotes,
applications, and all communications with consumers.

2.3 The parties are independent contractors. Nothing in this Agreement creates an agency, partnership,
joint venture, employment or appointment relationship. Company is not Buyer's agent or sub-producer,
and Buyer is not Company's agent.

## 3. Buyer eligibility

3.1 **Licensing.** Buyer represents and warrants that Buyer (and every person who contacts consumers
for Buyer) holds and will keep an active insurance producer license, in good standing, for the
applicable Line in **every state in which Buyer buys Leads**.

3.2 **License information.** Buyer will provide its National Producer Number (NPN), and the NPN of any
agency and licensed individuals who will work Leads, plus the list of states and lines of authority.
Company may verify licenses (for example, through NIPR or state insurance department look-ups) and
may refuse to deliver Leads for any state until verification is complete.

3.3 **Changes.** Buyer will notify Company within **two (2) business days** if any license lapses, is
suspended, revoked or restricted, or if Buyer becomes the subject of a regulatory action or lawsuit
relating to telemarketing or insurance sales. Company may immediately pause delivery in that state.

3.4 **Routing.** Company will not knowingly deliver a Lead to Buyer for a state where Buyer has no
verified license on file. This does not relieve Buyer of its duty under Section 3.1.

3.5 **Acceptance of partner listing.** Buyer agrees that Company may list Buyer's legal and/or trade
name on Company's consumer-facing partner list so that consumers can see who may contact them. Buyer
may receive Shared and Aged Leads only if Buyer was included in the disclosure the consumer agreed to.
**[COUNSEL: confirm whether named listing is required or categories suffice — see README.]**

## 4. Lead products

4.1 **General.** Company will deliver Leads that match Buyer's active Campaign filters (for example,
Line, states, ZIP codes/counties, age range, language), within Buyer's caps and schedule, while
Buyer's Wallet balance covers the price.

4.2 **Exclusive Leads.** Company will not sell or deliver the same Lead to any other buyer, whether as
an Exclusive, Shared or Aged Lead. If the same consumer separately submits a new request at a later
date, that new request is a new Lead.

4.3 **Shared Leads.** A Shared Lead may be sold to **no more than three (3) buyers in total**. Buyer
understands other buyers may contact the same consumer. Company does not guarantee Buyer will be the
first to receive or contact the consumer.

4.4 **Aged Leads.** An Aged Lead is at least thirty (30) days old, may have previously been sold as a
Shared Lead, and may be sold to more than one buyer. Aged Leads are sold "as is" and are **not
returnable** except for the reasons marked as applying to Aged Leads in Section 9.2.
**[COUNSEL: please confirm (a) how long consumer consent stays usable for calls/texts, (b) whether
Aged Lead sales must be limited to buyers named in the original disclosure, and (c) whether aged
leads already sold to 3 shared buyers may be sold again.]**

4.5 **Lead quality.** Company will use commercially reasonable efforts to validate Leads (for
example, phone checks, duplicate checks, fraud screening and suppression checks). Except as stated in
this Agreement, Company makes **no promise** that any consumer will answer, qualify for coverage,
or buy a policy.

## 5. Pricing and the prepaid Wallet

5.1 **Price per lead.** Buyer pays a **flat price per Lead**, as shown in the portal for the
applicable Line, tier and product at the time of Delivery. Prices may change for future Leads under
Section 20; a price change never applies to Leads already delivered.

5.2 **Prepayment.** Buyer must fund its Wallet before receiving Leads. Each Lead's price is
deducted from the Wallet at Delivery. Company does not extend credit unless agreed in a separate
signed writing.

5.3 **Funding.** Wallet top-ups are processed by Company's payment processor (currently Stripe).
Buyer may enable automatic recharge. Buyer authorizes Company to charge Buyer's payment method for
top-ups and auto-recharges Buyer sets up.

5.4 **Nature of the Wallet.** The Wallet is a prepayment for Leads only. It is not a bank account or
deposit, does not earn interest, cannot be transferred to another person, and may only be used to buy
Leads from Company. **[COUNSEL: confirm the Wallet does not raise money transmitter, stored-value or
unclaimed-property issues in Company's state of formation or Buyer states.]**

5.5 **Promotional Leads and credits.** Free or discounted trial Leads and promotional credits are
offered at Company's discretion, have no cash value, are not refundable, and may expire as stated
when offered.

5.6 **Chargebacks.** If Buyer disputes or reverses a top-up payment, Company may suspend Buyer and
deduct the reversed amount from the Wallet. A negative balance is a debt Buyer owes Company.

5.7 **Taxes.** Prices exclude taxes. Buyer is responsible for any applicable taxes other than taxes on
Company's income.

## 6. No commission sharing

6.1 The price per Lead is a **fixed fee for marketing services and information**. It is the same
whether or not the consumer buys a policy.

6.2 Company will **not** accept, and Buyer will **not** pay or offer, any commission, override,
bonus, share of premium, per-policy fee, or any other payment that depends on whether a policy is
sold, issued, or kept in force.

6.3 Buyer will not ask Company to (and Company will not) discuss policy terms, rates or coverage with
consumers on Buyer's behalf.

> [COUNSEL: please confirm this structure keeps Company outside the definition of "transacting
> insurance" and outside state anti-rebating / unlicensed-compensation rules in each target state.]

## 7. Delivery

7.1 Leads are delivered by the method(s) Buyer selects in the portal (for example, signed webhook,
email, SMS alert, or portal). Delivery includes the Consent Record (or a link to it), the consumer's
state and local time zone, and the language of the consent.

7.2 Buyer is responsible for keeping its delivery endpoint working. A Lead is considered delivered
when Company sends it as configured, even if Buyer's system fails to receive it, provided Company
also makes the Lead available in the portal.

7.3 Company may pause delivery at any time for compliance, quality, fraud, payment or technical
reasons.

## 8. Buyer compliance duties

Buyer is solely responsible for how it, its employees, agents, vendors and any dialer or texting
platform it uses contact consumers. Buyer will:

8.1 **Follow all Applicable Law**, including the TCPA and FCC rules, the Telemarketing Sales Rule,
state telemarketing and "mini-TCPA" laws (including the Florida Telephone Solicitation Act), state
insurance marketing rules, and any rules for any Line Buyer sells.

8.2 **Calling hours and frequency.** Call and text only within the **stricter** of federal and state
allowed hours **in the consumer's local time zone**, and within any state limits on the number or
frequency of calls (for example, Florida limits under the FTSA). Company may provide a state rules
table as a courtesy; it is **not legal advice**, may be incomplete, and does not reduce Buyer's
duties.

8.3 **Scope of consent.** Contact each consumer only about the Line shown in the Consent Record and
only on behalf of Buyer (not other companies).

8.4 **Do Not Call.** Maintain and honor its own internal do-not-call list and comply with
national and state Do Not Call registry rules, to the extent the consumer's consent does not
cover a call or the consent has been revoked.

8.5 **Opt-outs.** Honor any opt-out or revocation of consent the consumer gives Buyer, by any
reasonable means, **as soon as practicable and no later than the time required by Applicable Law**,
and notify Company of the opt-out within **one (1) business day** (through the portal or API) so
Company can add the consumer to its suppression list.

8.6 **Suppression Notices.** Stop all calls, texts and emails to a consumer within **twenty-four
(24) hours** after Company sends a Suppression Notice, or sooner if Applicable Law requires.
**[COUNSEL: confirm 24 hours is appropriate against the FCC revocation rules and state laws.]**

8.7 **Call recording.** If Buyer records calls, give any disclosure and obtain any consent required
by Applicable Law, including in states that require consent of all parties to a call
**[COUNSEL: confirm which target states require all-party consent; we believe Florida does]**.

8.8 **Identification.** At the start of each call, identify the caller, Buyer's business, and the
purpose of the call, and follow any state rules on caller ID and identification.

8.9 **Truthful marketing.** Not mislead consumers, including about who Buyer is, Buyer's
relationship with Company or any government agency, or the products offered. Never imply affiliation
with Medicare, Social Security or any government program.

8.10 **No resale or sharing.** Not sell, resell, rent, share, transfer, or disclose any Lead (or any
part of it) to any third party, and not let any other company contact the consumer, except
Buyer's own licensed employees or agents who work under Buyer's supervision and who are bound by
obligations at least as protective as this Agreement. Buyer will not upload Leads to a shared
data pool, co-op or list-building service.

8.11 **Permitted use.** Use Leads only to contact the consumer about the Line the consumer asked
about, and for Buyer's own related recordkeeping.

8.12 **Data security.** Protect Personal Information using reasonable administrative, technical and
physical safeguards (including access controls, encryption in transit, and limiting access to
people who need it); not store Leads on personal devices or accounts without such safeguards; and
notify Company within **seventy-two (72) hours** of discovering any unauthorized access to Leads.
Buyer will comply with applicable breach notification laws.

8.13 **Retention and deletion.** Keep Leads only as long as needed for the permitted use and legal
recordkeeping, and delete a consumer's data when Company forwards a valid deletion request, unless
Buyer must keep it by law (in which case Buyer will not use it for marketing).

8.14 **Records and cooperation.** Keep call, text and consent-related records for at least
**five (5) years** **[COUNSEL: confirm period]**, and, on reasonable request, give Company
information needed to respond to a consumer complaint, regulator inquiry, or claim.

8.15 **Complaints.** Notify Company within **two (2) business days** of any consumer complaint,
attorney demand letter, regulatory inquiry or lawsuit relating to a Lead.

## 9. Returns

9.1 **Window.** Buyer may request a return within **seventy-two (72) hours after Delivery** through
the portal. Requests after that time will be denied.

9.2 **Allowed reasons.** A Lead may be returned only for one of these reasons:

| Reason code | Description | Applies to Aged Leads? |
|---|---|---|
| `disconnected_wrong_number` | The phone number is disconnected, not in service, or belongs to someone other than the consumer. | Yes |
| `duplicate` | Buyer received the same consumer from Company within the previous 90 days. | Yes |
| `out_of_filters` | The Lead does not match Buyer's Campaign filters in effect at Delivery (for example, wrong state or age). | Yes |
| `consumer_denies_request` | The consumer clearly states they never asked to be contacted. | **[COUNSEL/OWNER: decide]** |
| `fraud` | The Lead appears fake or fraudulent (for example, fictitious name or bot submission). | Yes |

"Not interested," "could not reach," "already has coverage," "did not qualify," "price too high,"
and similar outcomes are **not** valid return reasons.

9.3 **Process and evidence.** Buyer must select a reason code and give reasonable supporting detail
(for example, date/time of call attempts, a short description of what the consumer said, or a
call recording where lawful). Company may re-run automated checks (such as a phone line check)
and may approve objective reasons automatically. Other requests are reviewed by Company, which
will decide in good faith, normally within five (5) business days.

9.4 **Consumer denies request.** If a consumer denies asking to be contacted, Buyer must stop
contacting the consumer and treat it as an opt-out (Section 8.5). Company will review the Consent
Record and may add the consumer to the suppression list.

9.5 **Credit only.** Approved returns are credited **to the Wallet only**, in the amount Buyer paid
for that Lead. Returns are never paid in cash or to a card, except as part of a refund of unused
balance under Section 10.

9.6 **Returned Leads.** After a return is approved, Buyer will stop using the Lead and delete it
(unless keeping it is required by law). Company may re-sell a returned Lead only if the return
reason does not affect the Lead's validity and the consumer's consent allows it.

9.7 **Abuse.** Company may limit, review or suspend return privileges if Buyer's return rate is
unusually high compared with other buyers or Buyer submits returns that are not supported.

## 10. Refunds of unused balance

10.1 Buyer may ask for a refund of its **unused, paid Wallet balance** at any time by written request
(email to {{CONTACT_EMAIL}}), which ends future deliveries unless Buyer says otherwise.

10.2 Company will refund the unused paid balance, less (a) promotional credits, (b) amounts under
open return reviews until decided, and (c) any amounts Buyer owes Company, within
**thirty (30) days**, to the original payment method where possible.
**[COUNSEL/OWNER: decide whether payment processor fees are deducted.]**

10.3 If Company terminates this Agreement without cause, Company will refund the unused paid balance
as in Section 10.2. If Company terminates for Buyer's material breach, Company may hold the balance
to cover amounts Buyer owes under this Agreement, including indemnification, and will refund any
remainder.

## 11. Company duties

Company will:

11.1 Capture consumer consent using disclosure language reviewed by Company's counsel, and keep the
Consent Record for each Lead for at least **five (5) years** **[COUNSEL: confirm]**.

11.2 Provide Buyer access to the Consent Record and certificate for each Lead.

11.3 Maintain a suppression list and send Suppression Notices to buyers who received the affected
consumer.

11.4 Not knowingly deliver a Lead without a Consent Record, or for a consumer on Company's suppression
list at the time of Delivery.

11.5 Comply with Applicable Law in its own lead generation activities.

## 12. Representations and warranties

12.1 Each party represents that it has authority to enter into this Agreement and that doing so does
not violate any other agreement.

12.2 **Disclaimer.** Except as expressly stated in this Agreement, Leads and the portal are provided
"as is." Company disclaims all other warranties, express or implied, including merchantability,
fitness for a particular purpose, and any warranty about sales results, contact rates or conversion.

## 13. Indemnification

13.1 **By Buyer.** Buyer will defend, indemnify and hold harmless Company and its owners, officers,
employees and contractors from third-party claims, fines, penalties, and related reasonable costs
and attorneys' fees, to the extent arising from: (a) the manner in which Buyer or anyone acting for
Buyer contacts consumers (including calling hours, call frequency, Do Not Call rules, caller
identification, call recording, and failure to honor opt-outs or Suppression Notices); (b) Buyer's
resale, sharing or misuse of Leads; (c) Buyer's insurance sales activity, including any
misrepresentation to consumers; (d) Buyer's lack of a required license; (e) Buyer's data security
incident; or (f) Buyer's breach of this Agreement or Applicable Law.

13.2 **By Company.** Company will defend, indemnify and hold harmless Buyer and its owners, officers
and employees from third-party claims, fines, penalties, and related reasonable costs and attorneys'
fees, to the extent arising from: (a) Company's failure to obtain consent consistent with the
Consent Record delivered with the Lead (for example, the consent was not actually given by the
consumer through Company's form, where the Lead originated from Company's own form);
(b) Company's own calls, texts or emails to consumers; or (c) Company's data security incident.
Company's obligations under this Section 13.2 do **not** apply to any claim that arises from
Buyer's conduct described in Section 13.1, or from Buyer's contact with a consumer after an
opt-out, a Suppression Notice, or outside the scope of consent.

> [COUNSEL: please calibrate 13.2. Considerations: (i) affiliate-sourced Leads (Phase 2) where Company
> relies on a third party's consent capture; (ii) whether to cap Company's indemnity; (iii) whether
> Company can obtain insurance for TCPA exposure (often excluded).]

13.3 **Procedure.** The party seeking indemnity must give prompt written notice, let the indemnifying
party control the defense and settlement (except that no settlement may admit fault of, or impose
non-monetary obligations on, the indemnified party without its consent), and reasonably cooperate at
the indemnifying party's expense.

## 14. Limitation of liability

14.1 Neither party is liable for indirect, incidental, special, consequential or punitive damages,
or lost profits or commissions, even if advised they are possible.

14.2 Each party's total liability under this Agreement is limited to the **amounts Buyer paid Company
for Leads in the three (3) months before the event giving rise to the claim**.

14.3 Sections 14.1 and 14.2 do **not** limit: (a) indemnification obligations under Section 13;
(b) breach of Section 8.10 (no resale or sharing) or Section 15 (confidentiality); (c) Buyer's payment
obligations; or (d) liability for fraud, gross negligence or willful misconduct.

## 15. Confidentiality

15.1 Each party will keep the other's non-public business information (including pricing, Lead
volumes, buyer lists, supplier and source information, and the terms of this Agreement) confidential
and use it only to perform this Agreement.

15.2 Personal Information in Leads is governed by Section 8 and Applicable Law, in addition to this
Section.

15.3 These obligations survive for **three (3) years** after termination, and for Personal
Information and trade secrets, for as long as the information remains protected by law.

## 16. Term and termination

16.1 This Agreement starts when Buyer accepts it and continues until terminated.

16.2 Either party may terminate for convenience on **five (5) business days'** written notice
(including notice through the portal or by email).

16.3 Company may suspend delivery or terminate **immediately** if Buyer: breaches Section 3
(licensing), Section 6 (no commission sharing) or Section 8 (compliance); is the subject of a
consumer complaint, regulatory action or lawsuit that Company reasonably believes creates legal
risk; fails to pay; or engages in fraud.

16.4 On termination, deliveries stop; Buyer remains responsible for Leads already delivered; Buyer's
duties regarding opt-outs, Suppression Notices, data security, retention/deletion and records
continue for as long as Buyer holds any Lead data; and refunds are handled under Section 10.

16.5 Sections 5.6, 6, 8, 9.6, 10, 12.2, 13, 14, 15, 16.4, 17 and 18 survive termination.

## 17. Governing law and disputes

17.1 This Agreement is governed by the laws of the State of **{{GOVERNING_LAW_STATE}}**, without
regard to its conflict of law rules.

17.2 Exclusive venue for any dispute is the state or federal courts located in
**{{VENUE_COUNTY}}, {{GOVERNING_LAW_STATE}}**, and each party consents to personal jurisdiction there.

> [COUNSEL: consider binding arbitration, class waiver for B2B, prevailing-party fees, and whether
> to choose the owner's home state.]

## 18. General

18.1 **Notices.** Notices to Company go to {{CONTACT_EMAIL}} and {{MAILING_ADDRESS}}. Notices to
Buyer go to the email address on Buyer's portal account. Email notice is effective when sent.

18.2 **Assignment.** Buyer may not assign this Agreement without Company's written consent. Company
may assign it to a successor of its business.

18.3 **Force majeure.** Neither party is liable for delay caused by events beyond its reasonable
control (other than payment obligations).

18.4 **Entire agreement.** This Agreement (in the version Buyer has accepted) and portal settings are
the entire agreement on this subject. If there is a conflict, this Agreement controls over portal
content.

18.5 **Severability; waiver.** If a provision is unenforceable, the rest remains in effect. Failure to
enforce a provision is not a waiver.

## 19. Electronic acceptance

19.1 Buyer accepts this Agreement electronically by checking the acceptance box and clicking the
acceptance button in the portal. Buyer agrees that this is Buyer's electronic signature, with the
same effect as a handwritten signature, under the federal E-SIGN Act and applicable state law.

19.2 The person accepting represents that they are authorized to bind Buyer.

19.3 Company records the agreement version, date and time, user account, and IP address of each
acceptance. Buyer may download the accepted version from the portal at any time.

## 20. Amendments by version

20.1 Company may update this Agreement by publishing a new version in the portal and emailing Buyer
at least **fifteen (15) days** before it takes effect, except that changes required by law or to
address a compliance risk may take effect sooner.

20.2 Each version has a unique version identifier. Buyer must accept the new version in the portal
to keep receiving Leads after its effective date. Leads delivered before then remain governed by
the version in effect at Delivery.

20.3 Prices and Campaign settings shown in the portal may change for future Leads without amending
this Agreement, with notice in the portal.

20.4 Any other amendment must be in a writing signed (including electronically) by both parties.

---

**Accepted electronically by Buyer** — recorded in Company's system:
Buyer legal name · NPN(s) · authorized user · agreement version · date/time (UTC) · IP address.
