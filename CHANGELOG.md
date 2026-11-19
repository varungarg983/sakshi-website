# Sakshi Aggarwal Website — Project Timeline

A running log of all changes made to the website.

---

## 2026-11-20

### Vendor page — sliding review cards
- The reviews section is now a strip of review cards in different colours that slides from right to left as you scroll, with the cards tilting as they pass (inspired by wisprflow.ai)
- Each card fills the screen as it reaches the middle, with large quote text, one review at a time
- Shows the 5 strongest reviews; reviews from owners in a similar position come first. All reviews are still in full below
- Reviews can now have an optional photo (`photo` in `reviews.ts`, file in `vendor-app/public/photos/reviews/`); photo cards show the picture with the quote over it
- People who turn off motion on their device get a simple sideways-scrolling row instead

## 2026-11-18

### Link maker — voice notes, AI drafting and recent links
- Notes box with a Speak button (browser speech-to-text, NZ English): Sakshi talks or types her rough notes about the meeting
- "Draft with AI" sends the notes to the NVIDIA model (same key as the review page, new `vendor-draft` function, passcode-protected) and fills in name, business, type, reason for selling, extra documents (e.g. franchise, liquor licence), the message opening and the page note; everything stays editable
- Checks stop the AI writing about the owner in the third person or adding people the notes don't mention; it never writes the document list or commission wording
- Message now follows the one Sakshi actually sends (opening, link paragraph, documents "as soon as possible", commission, sign-off), with Text, WhatsApp (bold headings) and Email versions, editable before copying
- Recent links list (stored with the links in Netlify Blobs) to reopen any vendor and copy the message again; links made before this change aren't in the list
- Shared passcode and validation helpers in `netlify/vendor-shared.mjs`

### Vendor page — self-contained messages
- Text message now includes the full document list and the commission wording, so it works even if the vendor never opens the link
- Email includes the commission wording by default (can still be unticked); both say everything is written out in case the link doesn't open

### Vendor page — follow-up messages and commission wording
- Link maker now writes two ready-to-copy messages: a text message, and a detailed email with subject line, the exact documents picked, and Sakshi's signature
- Email can optionally include Clyth MacLeod's commission wording word for word; "Open in email app" starts a draft
- Fee section has a "Read the full commission wording" drop-down with the exact wording
- Names typed in capitals (e.g. "VARUN GARG") now show as a first name ("Varun") in messages and on the page

### Vendor page — pick documents per vendor
- Link maker now has a document picker: choosing the type of business pre-ticks the usual documents, then Sakshi can tick or untick any, select all or clear, and add her own custom items
- Document library (financials, staff and wages, premises, equipment and stock, licences and agreements) with a short tip for each, in `vendor-app/src/data/documents.ts`
- Chosen documents are saved with the link; the vendor page and the pre-written email show only those, grouped by section
- Sending tips for vendors (photos and PDFs are fine, send large sets over a few emails)
- Fixed quick taps on the checklist not all registering

### Vendor page — fee calculator
- New "How my fee works" section: vendor types a sale price or uses the slider and sees the commission broken down ($800 upfront, 8% of the first $1m, 6% above, minimum $18,750 on those parts), plus GST
- Fee rules live in `FEES` in `vendor-app/src/data/content.ts`

### Vendor page — fewer numbers, new portrait
- Removed review numbering ("2 / 5", "Show all 11 reviews") so no numbers are put in vendors' minds
- Removed the "recent sales" section and the "café sold in one week" claim; Sumit's large quote now uses a sentence without a timeframe (his full review is unchanged)
- New portrait and closing photo from Sakshi's headshot; removed the bar and meeting-room photos

### Vendor page — editorial redesign
- Redesigned to feel less templated, inspired by wisprflow.ai: cream background, EB Garamond headings with italic emphasis, Figtree body text
- Hero ribbon with real review quotes drifting along a curve, and a scrolling strip of proof points
- Reviews now pin in place while the quote changes as you scroll, followed by every review in full
- Confidentiality panel opens out as it scrolls in; honest promises light up word by word; journey and documents use sticky side headings
- Added a short verbatim pull quote to each review for the large display
- Added `.mcp.json` so Claude Code can use the shadcn MCP server
- Added real photos of Sakshi (top of page, recent sales, journey, closing panel) plus a cropped portrait for the avatar; resized with WebP versions in `vendor-app/public/photos/`

### Vendor follow-up page (new, React)
- New page at `/vendor` to send sellers after a first call, built with React, Vite, Tailwind and shadcn/ui in `vendor-app/` (Netlify builds it automatically)
- Personal greeting and note from Sakshi, with reviews from owners in the same industry or situation shown first; filters, "show more" and a link to Google reviews
- Sections on confidentiality, recent sales, honest promises, Sakshi's journey (animated timeline) and licence details
- Document checklist that writes the email for the vendor: ticked items show as "attached", the rest as "I'll send this soon"; also opens in Gmail or copies the list
- Private link maker at `/vendor/#/make` (needs `VENDOR_LINK_PASSCODE` set in Netlify) creates short links like `/v/abc123`, stored with Netlify Blobs
- Reviews, journey, deal stories and the document list are edited in `vendor-app/src/data/`

## 2026-11-17

### Review Page — Rough notes and voice input
- Writing questions now tell clients that rough notes and spelling mistakes are fine
- "Speak" microphone button on each writing box (browser speech-to-text, New Zealand English); hidden in browsers that don't support it, with a friendly message if the microphone is blocked
- Client notes get a quick spelling, grammar and misheard-word fix before reviews are written, so mistakes are never copied into a review
- Reviews that just repeat the client's notes, are very short, or come out as broken fragments are rewritten; place names the client used (e.g. Hamilton) keep their capital letters

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
