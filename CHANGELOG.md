# Sakshi Aggarwal Website — Project Timeline

A running log of all changes made to the website.

---

## 2026-11-17

### Review Page — Redesign as a standalone, one-question-at-a-time page
- Removed the site menu and footer links so the page is only for leaving a review
- Questions now appear one at a time with large tap targets (built for phones); stars and buying/selling move on automatically
- Short thank-you line from Sakshi at the top; "Quick" mode is now a "Type a few words instead" shortcut
- Result screen shows the review like a Google review card, with swipe or arrows between the 5 versions
- Page set to `noindex` so it doesn't appear in Google search results

### Review Page — Keep reviews varied over time
- One request now returns 5 versions, each given a different mix of tone, length, structure, opening, wording and ending (thousands of combinations instead of 5 tones)
- About 35 overused AI phrases are banned; repeated words are penalised
- Reviews clients copy are saved (Netlify Blobs) and new reviews are steered away from their openings and phrases; any review still too similar is rewritten once
- New optional question that changes each visit (e.g. "Was there a moment you knew it would work out?") for more personal detail
- AI is told to use only facts the client gave, write in NZ English with normal punctuation, and treat every review as about a business (not property)
- Automatic retry when NVIDIA is busy, within a time limit
- Logic moved to `netlify/review-core.mjs`; function is now `generate-review.mjs`; added `package.json` for `@netlify/blobs`

### Review Page — Fix: reviews not generating
- NVIDIA retired `meta/llama-3.1-8b-instruct` (API now returns 410 Gone), so every review request failed
- Switched the Netlify function to `nvidia/nemotron-3.5-lightning-30b-a3b` with thinking turned off (~1s per review)
- New NVIDIA API key required — the old one stopped working

---

## 2026-06-23

### Review Page — Multi-version generation & navigation
- Generate 5 review options in parallel on every submission (both guided and quick modes)
- Added ← / → navigation with "2 of 5" counter so users can browse all versions before picking one
- "Generate 5 new versions" button moved to top of result screen, before copy actions
- Loading message updated to reflect multi-version generation

### Review Page — Regenerate button & mandatory personal input
- Added "↻ Generate 5 new versions" button on the result screen so users can get a fresh batch without starting over
- Made Q5 (personal description field) required — shows red border and auto-scrolls if skipped
- Q5 label updated from "Optional" to "Required" with explanation of why it matters

### Review Page — AI variety improvements
- Raised AI temperature from 0.7 → 0.9 for more creative, less repetitive output
- Added server-side random style picker (5 tones: casual, professional, heartfelt, punchy, narrative) — injected per request so two identical submissions still produce different results
- Added forbidden opener list to prevent the model defaulting to clichéd first lines (e.g. "I had an amazing experience…")
- Added sentence-length variation instruction to break rhythmic sameness

---

## 2026-06-09

### Review Page — Quick tab & UX polish
- Added "Quick" tab: users can type free-form words/phrases and the AI turns them into a full review
- Added word chips (Professional, Smooth process, Knowledgeable, etc.) to seed the quick tab
- Made the generated review editable before copying so users can personalise it
- Replaced business type dropdown with an optional free-text business name input
- Switched AI model to `meta/llama-3.1-8b-instruct` for faster response times
- Added server-side response logging for debugging

### Review Page — Initial launch
- Built `google-review.html` — a guided 5-question form that generates a personalised Google review via AI
- Integrated NVIDIA API (`llama-3.3-nemotron-super-49b-v1.5`) as the AI backend via a Netlify serverless function
- Progress bar tracks answered questions (0–5)
- Result screen includes one-tap copy + direct link to Sakshi's Google review page

---

## 2026-04-01

### Full website redesign
- Applied professional redesign across all pages with updated CSS design system
- Cleaned up repo structure

---

## 2026-03-29

- Refined hero layout and page styling

---

## 2026-03-20

- Fixed contact form submission handling
- Enforced HTTPS security headers via `_headers` config

---

## 2026-03-18

- Updated website colour palette
- Initial website launch
