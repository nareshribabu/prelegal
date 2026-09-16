# Manual Test Plan: Mutual NDA Creator

Run this checklist in a real browser against `npm run dev` before shipping a
change to this app. It covers what the automated test suite can't: visual
layout, actual PDF file inspection, and real-browser download behavior.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:3000`.

## 1. Initial load

- [ ] Page loads with no console errors.
- [ ] Form (left) and live preview (right) are both visible.
- [ ] Effective Date defaults to today's date.
- [ ] Purpose defaults to "Evaluating whether to enter into a business relationship between the parties."
- [ ] Preview shows `[Party 1 name]`, `[Party 2 name]`, `[Governing Law]`, `[Jurisdiction]` placeholders for the fields that start blank.

## 2. Form → preview live sync

- [ ] Typing in Party 1 "Company name" updates the preview's Party 1 name immediately (no page reload, no lag).
- [ ] Typing in Party 2 "Company name" updates only Party 2 in the preview (Party 1 unaffected).
- [ ] Editing "Purpose" updates every place Purpose appears in the Standard Terms preview (clauses 1 and 2), not just the cover page.
- [ ] Changing "Effective date" updates the header ("Effective as of …") and clause 5.
- [ ] Changing "Governing law" and "Jurisdiction" updates both the cover page fields and clause 9's inline text.

## 3. MNDA term / confidentiality term controls

- [ ] With "MNDA term" set to "Expires after a set number of years", a year-count number input appears; changing it updates the cover page and clause 5 text.
- [ ] Switching "MNDA term" to "Continues until terminated" hides the year input and updates the cover page text.
- [ ] Same two checks for "Term of confidentiality" ("years" vs. "In perpetuity").
- [ ] Using the number input's up/down spinner arrows (mouse, not keyboard) can't push the value below 1 or above 99 — this native browser behavior isn't exercised by `fireEvent.change` in the automated tests.

## 4. Accessibility / usability spot check

- [ ] Tab through the form with keyboard only — focus order is logical (top to bottom, left to right).
- [ ] Click each `<label>` in the form (e.g. "Purpose", "Governing law (state)") and confirm it focuses the associated field.
- [ ] Zoom to 200% — form and preview remain usable (preview should scroll independently on smaller viewports).

## 5. PDF download — golden path

- [ ] Fill in both parties' full details, a purpose, and governing law/jurisdiction.
- [ ] Click "Download PDF". Button should show "Preparing PDF…" and become disabled while generating.
- [ ] A PDF file downloads with a filename derived from Party 1's company name (e.g. `acme-inc.pdf`).
- [ ] Open the downloaded PDF:
  - [ ] It has a title page header "Mutual Non-Disclosure Agreement" and the correct effective date.
  - [ ] Cover Page section shows both parties' details, Purpose, MNDA Term, Term of Confidentiality, Governing Law & Jurisdiction — matching what's in the on-screen preview.
  - [ ] All 11 Standard Terms clauses are present, in order, with their numbered headings.
  - [ ] Defined terms (MNDA, Disclosing Party, Receiving Party, Confidential Information, Cover Page) are bold.
  - [ ] Footer attribution to Common Paper / CC BY 4.0 is present.
  - [ ] Text is selectable (confirms it's a real text-based PDF, not an image).

## 6. PDF download — edge cases

The filename-slugging logic itself (blank names, punctuation, leading/trailing
hyphens) is covered by automated tests in `components/MndaCreator.test.tsx` —
don't re-verify the slug logic here. Instead confirm what only a real browser
can show:

- [ ] The browser's own download indicator (download tray/bar) shows the
      expected filename — automated tests only check the `download` attribute
      value, not what the browser actually does with it.
- [ ] Download with "MNDA term" = "Continues until terminated" and "Term of
      confidentiality" = "In perpetuity" → open the PDF and confirm clause 5
      reads sensibly (this is about visually reading real PDF output, not the
      text values, which are unit-tested).
- [ ] Download with a very long Purpose (a full paragraph) → open the PDF and
      confirm it does not clip or overlap text; content flows onto additional
      pages if needed.
- [ ] Click "Download PDF" twice in a row (or rapidly) → does not produce
      duplicate downloads or a stuck "Preparing PDF…" state.
- [ ] Temporarily force a failure (e.g. throw inside `MndaPdfDocument`) and
      confirm the red error banner is legible in both light and dark mode, and
      that a subsequent successful download clears it.

## 7. Cross-browser / responsive check

- [ ] Chrome, Firefox, and Safari (or Edge) each successfully generate and download a PDF.
- [ ] Narrow viewport (mobile width): form and preview stack vertically and remain usable.

## 8. Regression checklist (things that broke before)

- [ ] Reloading the page after downloading gives a fresh, blank form (Party 1 / Party 2 fields are not pre-filled with a previous session's data) — regression check for a shared-default-object bug.
- [ ] Every `<label>` in the form is announced correctly by a screen reader when its field receives focus — regression check for a missing `htmlFor`/`id` pairing bug.
