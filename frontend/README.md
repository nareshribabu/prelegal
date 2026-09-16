# Mutual NDA Creator

Live at: **https://nareshribabu.github.io/prelegal/**

A prototype web app (implementing [PL-3](https://nareshribabunagarsheth.atlassian.net/browse/PL-3)) that lets a user fill in
a form with the Common Paper Mutual NDA's cover page details — both parties,
purpose, effective date, MNDA term, confidentiality term, and governing
law/jurisdiction — and see a live preview of the filled-in agreement. The
completed document can be downloaded as a real, text-based PDF, generated
client-side.

The underlying legal text comes from the Common Paper Mutual NDA Standard
Terms and Cover Page, Version 1.0, at `../templates/Mutual-NDA.md` and
`../templates/Mutual-NDA-coverpage.md` in the repo root.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key files

- `lib/mnda-content.ts` — form data types, default values, and the logic that
  substitutes entered values into the Standard Terms clauses and cover page.
- `components/MndaForm.tsx` — the input form.
- `components/MndaPreview.tsx` — the on-screen HTML preview.
- `components/MndaPdfDocument.tsx` — the `@react-pdf/renderer` document used
  to generate the downloadable PDF (mirrors the preview's content).
- `components/MndaCreator.tsx` — wires the form, preview, and download button
  together.

## Testing

Automated tests (Vitest + React Testing Library) live alongside each source
file as `*.test.ts(x)`:

```bash
npm run test        # run once
npm run test:watch  # watch mode
```

See [`MANUAL_TESTING.md`](./MANUAL_TESTING.md) for the manual QA checklist —
things a real browser needs to verify (visual PDF layout, actual download
behavior, cross-browser checks) that automated tests can't.

## Other scripts

```bash
npm run build   # production build (static export, output/)
npm run lint    # ESLint
```

## Deployment

This app is statically exported (`output: "export"` in `next.config.ts`) and
deployed to GitHub Pages by `.github/workflows/deploy-pages.yml` on every
push to `main` that touches `frontend/`. Since this is a project site (served
from `/prelegal/`, not the domain root), the build sets a `basePath` — but
only when `GITHUB_PAGES=true` is set (as the workflow does), so local
`npm run dev`/`npm run build` are unaffected and still serve from `/`.
