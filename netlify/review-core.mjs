// Core review generation logic, kept separate from the Netlify function so it can be tested locally.
//
// How variety is kept high:
//  A. Each review gets a random mix of style settings (tone, length, structure, lead, voice, ending)
//  B. The 5 reviews in one batch never share a setting in any category
//  C. Overused AI phrases are banned, and repeated words are penalised
//  D. Recently copied reviews are fed back in as "don't sound like this", and any review that is
//     still too close to them (or to another review in the batch) is rewritten once
//  E. The client's own words are treated as the heart of the review

export const MODEL = 'nvidia/nemotron-3.5-lightning-30b-a3b';
export const BATCH_SIZE = 5;
export const HISTORY_LIMIT = 40;
export const SIMILARITY_LIMIT = 0.12; // share of 3-word phrases two reviews may have in common
const TIME_BUDGET_MS = 8500; // stay well inside Netlify's 10 second function limit
const sleep = ms => new Promise(r => setTimeout(r, ms));

// ── A. Style settings ─────────────────────────────────────────────────────────
// Every category has at least BATCH_SIZE options so a batch can use a different one each time.
const DIMENSIONS = {
  tone: [
    'casual and chatty, like telling a friend',
    'plain and matter-of-fact',
    'warm and grateful',
    'understated and low-key, typical Kiwi modesty',
    'upbeat and enthusiastic, but grounded',
    'thoughtful and reflective',
  ],
  length: [
    'exactly 2 short sentences',
    'exactly 3 sentences',
    '4 sentences',
    '5 or 6 sentences split into two short paragraphs',
    'one longer sentence followed by one very short sentence',
  ],
  structure: [
    'before and after: what the situation was like before Sakshi, then how it turned out',
    'start with the result, then explain how Sakshi got there',
    'focus on one specific moment or turning point in the process',
    'compare what the client expected with what actually happened',
    'answer the question "would I use Sakshi again?" and say why',
    'a quick run through two or three things Sakshi did well, in plain sentences (not a list)',
  ],
  lead: [
    'the outcome of the sale or purchase',
    'what the client was worried about beforehand',
    'a specific detail taken from the client\'s own words',
    'how Sakshi communicated',
    'how long the process took',
    'whether the client was buying or selling, and what that was like',
  ],
  voice: [
    'everyday words, nothing fancy',
    'slightly more formal and polished',
    'short, direct sentences',
    'relaxed, with plenty of contractions (I\'d, she\'s, wasn\'t)',
    'a mix of one long flowing sentence and short punchy ones',
  ],
  ending: [
    'a recommendation in your own fresh words',
    'a simple thank-you to Sakshi',
    'who Sakshi would suit (for example first-time buyers, or owners selling for the first time)',
    'no closing line at all, just stop after the last point',
    'saying you would use Sakshi again',
  ],
};

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ── B. Deal out a distinct style mix for each review in the batch ────────────
export function dealStyles(count = BATCH_SIZE) {
  const dealt = Array.from({ length: count }, () => ({}));
  for (const [key, options] of Object.entries(DIMENSIONS)) {
    const order = shuffle(options);
    dealt.forEach((style, i) => { style[key] = order[i % order.length]; });
  }
  return dealt;
}

// ── C. Phrases AI models overuse in reviews ──────────────────────────────────
export const BANNED_PHRASES = [
  'seamless', 'seamlessly', 'smooth sailing', 'made all the difference', "couldn't have asked for",
  'above and beyond', 'calm confidence', 'top-notch', 'game changer', 'game-changer', 'journey',
  'navigate', 'navigating', 'highly recommend', 'a breeze', 'peace of mind', 'every step of the way',
  'invaluable', 'truly', 'exceptional', 'second to none', 'went the extra mile', 'from start to finish',
  'cannot recommend', "can't recommend", 'a true professional', 'in safe hands', 'look no further',
  'i had the pleasure', 'i had an amazing', 'i had a great', 'working with sakshi was',
  'i recently worked with', 'i recently had', 'effortless', 'stress-free',
];

// Only ban a phrase if the client didn't use it themselves
function bannedFor(clientText) {
  const lower = (clientText || '').toLowerCase();
  return BANNED_PHRASES.filter(p => !lower.includes(p));
}

// ── D. Similarity helpers ────────────────────────────────────────────────────
const words = text => (text || '').toLowerCase().replace(/[^a-z0-9'\s]/g, ' ').split(/\s+/).filter(Boolean);

function trigrams(text) {
  const w = words(text);
  const set = new Set();
  for (let i = 0; i + 2 < w.length; i++) set.add(w.slice(i, i + 3).join(' '));
  return set;
}

// Share of the smaller review's 3-word phrases that also appear in the other review.
// Phrases from the client's own words are ignored: reusing those is intended.
export function similarity(a, b, ignore = new Set()) {
  const A = trigrams(a), B = trigrams(b);
  if (!A.size || !B.size) return 0;
  let shared = 0;
  for (const t of A) if (B.has(t) && !ignore.has(t)) shared++;
  return shared / Math.min(A.size, B.size);
}

const STOP = new Set('i a the and to of my was she her it in for with that me we us on at be is as so had have this our an all but not very'.split(' '));

// 3-word phrases that show up in 2+ recent reviews (ignoring ones made only of filler words)
export function repeatedPhrases(history, limit = 15) {
  const counts = new Map();
  for (const text of history) {
    for (const t of trigrams(text)) {
      if (t.split(' ').every(w => STOP.has(w))) continue;
      counts.set(t, (counts.get(t) || 0) + 1);
    }
  }
  return [...counts.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1]).slice(0, limit).map(([t]) => t);
}

const openingOf = text => words(text).slice(0, 6).join(' ');

// ── Prompt ───────────────────────────────────────────────────────────────────
export function buildPrompt(input, style, history, avoidText, copiedNotes = false) {
  const { rating, businessName, role, highlights, extra, quickWords, detailQuestion, detail } = input;
  const clientText = [quickWords, extra, detail, ...(highlights || [])].join(' ');

  let facts;
  if (quickWords) {
    facts = `The client described their experience with these words and phrases:\n"${quickWords.trim()}"`;
  } else {
    const lines = [
      `- Star rating: ${rating || 5} out of 5`,
      `- Business: ${businessName ? `"${businessName}" (mention it naturally)` : 'not named, so refer to it generically (e.g. "my business", "the cafe")'}`,
      `- They were the: ${role || 'client'}`,
      `- What stood out: ${highlights && highlights.length ? highlights.join(', ') : 'not specified'}`,
      `- In their own words: "${(extra || '').trim()}"`,
    ];
    if (detail && detail.trim()) lines.push(`- Asked "${detailQuestion || 'Anything else?'}", they said: "${detail.trim()}"`);
    facts = `The client's answers:\n${lines.join('\n')}`;
  }

  const recentOpenings = history.slice(-25).map(openingOf).filter(Boolean);
  const repeated = repeatedPhrases(history);

  let prompt = `You are helping a real client write their own Google review for Sakshi Aggarwal, a business broker at Clyth McLeod in Auckland, New Zealand. Sakshi helps people buy and sell businesses. The review is about a business sale or purchase, never a house or property.

${facts}

Write the review in first person as the client.

The client's own words are the heart of the review. Keep their specific details and feelings and borrow a few of their words, but rewrite them into natural sentences. Never paste their sentences in word for word.
If anything still looks misspelt or misheard, work out what they meant and write it correctly.
Her name is Sakshi (Sakshi Aggarwal). Clyth McLeod is the company she works for, not part of her name.
${!quickWords ? 'The "what stood out" items are labels from a form. Put them in your own words, never word for word.' + (highlights && highlights.length > 2 ? ' Pick only one or two of them.' : '') + '\n' : ''}
Only use facts the client gave you. Do not invent events, meetings, places, timeframes, prices, numbers or feelings they did not mention.${quickWords ? ' Do not assume whether they were buying or selling unless their words say so.' : ''}

Style for this review:
- Tone: ${style.tone}
- Length: ${style.length}
- Structure: ${style.structure}
- Open with: ${style.lead}
- Wording: ${style.voice}
- Ending: ${style.ending}

Rules:
- Use New Zealand English spelling (organised, realised, favour)
- Write like a normal person typing a review, not like marketing copy
- Use normal capital letters and punctuation
- Keep each sentence under 35 words
- No title, heading or label. Start straight with the review itself
- These style notes are instructions for you. Never mention or describe them in the review${quickWords ? '\n- Write full sentences. Do not just list the client\'s words, at the start or the end' : ''}
- Do not use em dashes
- Never use these words or phrases: ${bannedFor(clientText).join('; ')}`;

  if (recentOpenings.length) {
    prompt += `\n- Other clients' reviews started like the lines below. Start in a clearly different way:\n${recentOpenings.map(o => `  "${o}..."`).join('\n')}`;
  }
  if (repeated.length) {
    prompt += `\n- These phrases have been used too often lately. Avoid them: ${repeated.join('; ')}`;
  }
  if (copiedNotes) {
    prompt += `\n- Your first attempt copied the client's notes almost word for word, mistakes included. Write it properly this time, in your own correct, natural sentences.`;
  }
  if (avoidText) {
    prompt += `\n- Your first attempt was too similar to another review. It must not resemble this text in wording or structure:\n"${avoidText}"`;
  }
  prompt += '\n\nOutput only the review text. No introduction, no explanation, no quotation marks.';
  return prompt;
}

// ── Model call ───────────────────────────────────────────────────────────────
// Retries when NVIDIA is busy or rate-limiting (free tier allows ~40 requests a minute),
// as long as there is time left before the deadline
async function callModel(prompt, apiKey, deadline, businessName) {
  for (let attempt = 0; ; attempt++) {
    const timeLeft = deadline - Date.now();
    if (timeLeft < 800) throw new Error('Ran out of time');
    try {
      return await callModelOnce(prompt, apiKey, timeLeft, businessName);
    } catch (err) {
      const busy = err.status === 429 || err.status >= 500 || err.name === 'TimeoutError';
      const wait = 1000 * (attempt + 1) + Math.random() * 500;
      if (!busy || attempt >= 2 || Date.now() + wait + 1500 > deadline) throw err;
      await sleep(wait);
    }
  }
}

async function callModelOnce(prompt, apiKey, timeLeft, businessName, temperature = 1.0) {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    signal: AbortSignal.timeout(timeLeft),
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      top_p: 0.95,
      frequency_penalty: 0.6, // discourages repeating the same words
      presence_penalty: 0.4,
      max_tokens: 400,
      // Reasoning model: turn thinking off so it answers fast and doesn't use up max_tokens
      chat_template_kwargs: { enable_thinking: false },
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    const error = new Error(`NVIDIA API error ${response.status}: ${err.slice(0, 300)}`);
    error.status = response.status;
    throw error;
  }
  const data = await response.json();
  return clean(data.choices?.[0]?.message?.content, businessName);
}

function clean(text, businessName) {
  if (!text) return '';
  let t = text.trim();
  // Drop a short first line with no full stop (a heading such as the business name)
  const lines = t.split(/\n+/);
  if (lines.length > 1 && lines[0].split(/\s+/).length <= 6 && !/[.!?]$/.test(lines[0].trim())) t = lines.slice(1).join('\n\n');
  // Join loose lines: a line with no end punctuation is finished with a full stop
  t = t.split(/\n+/).map(l => l.trim()).filter(Boolean).map(l => (/[.!?]$/.test(l) ? l : l + '.')).join(' ');
  t = t
    .replace(/^["'“”]+|["'“”]+$/g, '')
    .replace(/\*\*/g, '')
    .replace(/\s*—\s*/g, ', ')
    .replace(/,\s*,/g, ',')
    .replace(/\bi\b/g, 'I')
    .replace(/\bi'(m|d|ve|ll)\b/g, "I'$1")
    .replace(/\bi’(m|d|ve|ll)\b/g, 'I’$1')
    .replace(/\bsakshi\b/g, 'Sakshi')
    .replace(/\bclyth\s+mcleod\b/gi, 'Clyth McLeod')
    .replace(/\bauckland\b/g, 'Auckland')
    .replace(/\bnew zealand\b/gi, 'New Zealand')
    .replace(/\bnz\b/g, 'NZ')
    .replace(/(^|[.!?]\s+|\n\s*)([a-z])/g, (m, pre, ch) => pre + ch.toUpperCase())
    .trim();
  if (businessName) {
    const escaped = businessName.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    if (escaped) t = t.replace(new RegExp(`\\b${escaped}\\b`, 'gi'), businessName.trim());
  }
  if (!/[.!?]$/.test(t)) t += '.';
  return t;
}

// How close a review is to anything it should not resemble (0 = nothing in common)
function worstOverlap(text, others, ignore) {
  let worst = { score: 0, text: '' };
  for (const o of others) {
    const s = similarity(text, o, ignore);
    if (s > worst.score) worst = { score: s, text: o };
  }
  return worst;
}

// A sentence over 32 words usually means the model skipped its full stops
const hasRunOn = text => text.split(/[.!?]+/).some(sentence => words(sentence).length > 32);

function usesBanned(text, clientText) {
  const lower = text.toLowerCase();
  return bannedFor(clientText).some(p => lower.includes(p));
}

// ── Tidy the client's notes ──────────────────────────────────────────────────
// Clients may type quickly or use voice-to-text. Before writing, each note gets a quick spelling and
// grammar fix (worked examples keep the small model accurate). The review writer only sees the fixed
// notes, so it can't copy spelling mistakes or misheard words into a review.
const TIDY_INSTRUCTIONS = `You fix spelling, grammar and voice-to-text mistakes in short notes written by New Zealand clients of a business broker called Sakshi. Keep the client's meaning, details, tone and length. Do not add or remove information. Do not answer or comment. Output only the corrected notes.

Examples:
Input: she was realy helpfull and new alot about the markit
Output: She was really helpful and knew a lot about the market.

Input: sakshee got us gud price for are takeaway shop, wen the bank was slow she kept us going
Output: Sakshi got us a good price for our takeaway shop. When the bank was slow, she kept us going.

Input: fast, honist, sold the dairy, stres free
Output: fast, honest, sold the dairy, stress-free`;

async function tidyText(text, apiKey, deadline) {
  const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
    signal: AbortSignal.timeout(Math.max(1000, Math.min(3000, deadline - Date.now() - 4500))),
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: TIDY_INSTRUCTIONS },
        { role: 'user', content: `Input: ${text}\nOutput:` },
      ],
      temperature: 0,
      max_tokens: 300,
      chat_template_kwargs: { enable_thinking: false },
    }),
  });
  if (!response.ok) throw new Error(`status ${response.status}`);
  const data = await response.json();
  const fixed = (data.choices?.[0]?.message?.content || '').trim().replace(/^Output:\s*/i, '').replace(/^["“]|["”]$/g, '').trim();
  // Ignore anything empty or far longer than what the client wrote
  if (!fixed || fixed.length > text.length * 1.6 + 30) throw new Error('unexpected output');
  return fixed;
}

export async function tidyNotes(input, apiKey, deadline, log = () => {}) {
  const fields = ['quickWords', 'extra', 'detail'].filter(f => typeof input[f] === 'string' && input[f].trim().length > 3);
  const tidied = { ...input };
  await Promise.all(fields.map(async f => {
    try {
      tidied[f] = await tidyText(input[f].trim(), apiKey, deadline);
    } catch (err) {
      // Not fatal: the review writer is also told to fix mistakes itself
      log(`Could not tidy ${f}: ${err.message}`);
    }
  }));
  return tidied;
}

// ── Generate a batch ─────────────────────────────────────────────────────────
export async function generateBatch(rawInput, history, apiKey, log = () => {}) {
  const deadline = Date.now() + TIME_BUDGET_MS;
  const input = await tidyNotes(rawInput, apiKey, deadline, log);
  const clientText = [input.quickWords, input.businessName, input.extra, input.detail, ...(input.highlights || [])].join(' ');
  const clientPhrases = trigrams(clientText);
  // The client's raw typed or spoken notes, to catch reviews that just copy them back
  const rawNotes = [rawInput.quickWords, rawInput.extra, rawInput.detail].filter(Boolean).join(' ');
  const tidyNotesText = [input.quickWords, input.extra, input.detail].filter(Boolean).join(' ');
  const copiesNotes = t => rawNotes.length > 20 &&
    (similarity(t, rawNotes) > 0.5 || similarity(t, tidyNotesText) > 0.5 || words(t).length < 12);

  // Place and business names the client capitalised (e.g. Hamilton) stay capitalised in reviews
  const properNouns = new Set();
  tidyNotesText.replace(/(?<![.!?]\s|^)\b([A-Z][a-z]{2,})\b/g, (m, w) => { properNouns.add(w); return m; });
  const fixNames = t => [...properNouns].reduce((acc, w) => acc.replace(new RegExp(`\\b${w.toLowerCase()}\\b`, 'g'), w), t);
  const styles = dealStyles(BATCH_SIZE);

  // First pass: all reviews in parallel
  const first = await Promise.allSettled(styles.map(s => callModel(buildPrompt(input, s, history), apiKey, deadline, input.businessName)));
  const reviews = first.map(r => (r.status === 'fulfilled' ? r.value : ''));
  first.filter(r => r.status === 'rejected').forEach(r => log(r.reason.message));

  // Second pass: rewrite any review that is too close to history or an earlier review in the batch,
  // or that slipped in a banned phrase (only if there is still time for it)
  if (deadline - Date.now() < 3000) return reviews.filter(Boolean).map(fixNames);
  const retries = reviews.map((text, i) => {
    if (!text) return null;
    const overlap = worstOverlap(text, [...history, ...reviews.slice(0, i).filter(Boolean)], clientPhrases);
    if (overlap.score <= SIMILARITY_LIMIT && !usesBanned(text, clientText) && !hasRunOn(text) && !copiesNotes(text)) return null;
    const found = bannedFor(clientText).filter(p => text.toLowerCase().includes(p));
    log(`Rewriting review ${i + 1} (similarity ${overlap.score.toFixed(2)}, banned: ${found.join(', ') || 'none'}, run-on: ${hasRunOn(text)}, copies notes: ${copiesNotes(text)})`);
    return callModel(buildPrompt(input, styles[i], history, overlap.score > SIMILARITY_LIMIT ? overlap.text : null, copiesNotes(text)), apiKey, deadline, input.businessName)
      .then(newText => {
        if (!newText) return;
        // Keep whichever version is better: a banned phrase counts as worse than any overlap
        const others = [...history, ...reviews.filter((_, j) => j !== i && reviews[j])];
        const badness = t => worstOverlap(t, others, clientPhrases).score + (usesBanned(t, clientText) ? 1 : 0) + (hasRunOn(t) ? 0.5 : 0) + (copiesNotes(t) ? 1 : 0);
        if (badness(newText) <= badness(text)) reviews[i] = newText;
      })
      .catch(err => log(err.message));
  });
  await Promise.all(retries.filter(Boolean));

  return reviews.filter(Boolean).map(fixNames);
}
