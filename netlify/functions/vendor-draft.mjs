import { DOC_ID_RE, INDUSTRIES, SITUATIONS, json, passcodeOk, text } from '../vendor-shared.mjs';

// Turns Sakshi's rough (often spoken) notes after a meeting into the personal parts of a vendor link:
// the form fields, the opening of her message, and the note at the top of the vendor's page.
// The document list and commission wording are never written here; they come from fixed text.

const MODEL = 'nvidia/nemotron-3.5-lightning-30b-a3b';
const TIME_BUDGET_MS = 8500; // Netlify stops functions at 10 seconds

const DOCS = {
  'bank-statements': 'Business bank statements',
  'tax-returns': 'Income tax returns',
  'pos-reports': 'POS sales reports',
  'employment-agreements': 'Employment agreements for key staff',
  outgoings: 'Rent and outgoings breakdown',
  'council-consents': 'Council permits or consents',
  stock: 'Stock on hand',
  vehicles: 'Vehicles used in the business',
  'finance-agreements': 'Finance or hire purchase agreements',
  franchise: 'Franchise agreement',
  'liquor-licence': 'Liquor licence',
  'food-licence': 'Food licence or food control plan',
  'supplier-agreements': 'Key supplier agreements',
  'client-contracts': 'Client contracts',
  insurance: 'Business insurance policy',
};

function buildPrompt(notes) {
  return `You help Sakshi Aggarwal, a business broker at Clyth MacLeod Business Sales in New Zealand, follow up after meeting a business owner who may sell their business.

Below are Sakshi's rough notes about the meeting. They may be spoken, so fix misheard words and spelling. Use only facts in the notes. Never invent names, places, dates, people or details.

Return ONLY a JSON object with these keys:
- "firstName": the main contact's first name, or "".
- "business": the business name exactly as it would be written, or "".
- "industry": one of ${INDUSTRIES.map(i => `"${i}"`).join(', ')}, or "". Use "cafe" for cafés, "hospitality" for restaurants and takeaways (including chicken shops), "cleaning", "retail" for shops and dairies, "service" for trades and services.
- "situation": one of "retiring", "moving-on" (ready for something new), "health" (health or family reasons), "relocating" (moving away, including overseas), "first-sale" (first time selling), or "" if not mentioned.
- "extraDocs": document ids to add ONLY when the notes clearly mention something that needs them, chosen from: ${Object.entries(DOCS).map(([id, l]) => `"${id}" (${l})`).join(', ')}. A franchise means "franchise"; selling alcohol, beer or wine means "liquor-licence"; food means "food-licence"; vans or cars mean "vehicles"; regular contracts mean "client-contracts". Otherwise [].
- "meeting": how they met, exactly as the notes say: "in person", "phone", "video call" or "unknown".
- "people": who Sakshi met or spoke with, written as Sakshi would say it to the owner, e.g. "you and your husband", or "".
- "opening": one or two sentences that Sakshi says TO the owner, matching "meeting" and "people", usually starting "It was lovely meeting you" or "Thank you for" (the greeting is added separately). Describe the meeting exactly as the notes say: in person or on the phone, today or yesterday, where, and who was there. Never add a place, day or person the notes don't mention.
- "pageNote": two or three sentences for the top of a web page made for this owner. Speak directly to the owner as "you". Thank them for their time, mention their business by name, and say the page has what they need to look through. Keep it warm and general.

Examples of the style (the facts here are made up and must not be reused). Use the one that matches "meeting":
- In person: "It was lovely meeting you, your husband, and your husband's business partner yesterday at your premises, Harbour Street Bakery."
- Phone: "Thank you for taking the time to speak with me on the phone today about Westside Laundromat."
- Page note: "Thank you for your time today, and for telling me about Riverside Florist. I've put this page together so you can see how I work and what I'll need from you. Have a look through it when you have a moment."

Rules for "opening" and "pageNote":
- Write as Sakshi in the first person singular: "I", never "we".
- Never describe the owner in the third person ("she", "he", "they mentioned").
- Leave out private details such as health, family matters, feelings, plans to move overseas or reasons for selling. The page may be seen by others.
- New Zealand English. Plain, friendly and professional.
- No promises or guarantees, such as "no rush", "I'll get you the best price" or "your sale will be confidential".
- No numbers about price, value, profit, turnover or how long a sale might take.
- No em dashes. No exclamation marks. No greeting ("Hi …") and no sign-off.

Notes:
"""
${notes}
"""`;
}

async function callModel(prompt, apiKey, deadline) {
  for (let attempt = 0; attempt < 3; attempt++) {
    const timeLeft = deadline - Date.now();
    if (timeLeft < 1500) break;
    try {
      const res = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
        signal: AbortSignal.timeout(timeLeft - 200),
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        body: JSON.stringify({
          model: MODEL,
          messages: [{ role: 'user', content: prompt }],
          temperature: 0.2,
          top_p: 0.9,
          max_tokens: 700,
          chat_template_kwargs: { enable_thinking: false },
        }),
      });
      if (res.status === 429 || res.status >= 500) {
        await new Promise(r => setTimeout(r, 600));
        continue;
      }
      if (!res.ok) throw new Error(`NVIDIA API error ${res.status}: ${(await res.text()).slice(0, 200)}`);
      const data = await res.json();
      return data.choices?.[0]?.message?.content || '';
    } catch (err) {
      if (err.name !== 'TimeoutError' && err.name !== 'AbortError') throw err;
    }
  }
  throw new Error('The AI took too long. Please try again.');
}

// The model sometimes wraps JSON in code fences or adds a sentence; take the first {...} block
function parseJson(raw) {
  const start = raw.indexOf('{');
  const end = raw.lastIndexOf('}');
  if (start < 0 || end <= start) return null;
  try {
    return JSON.parse(raw.slice(start, end + 1));
  } catch {
    return null;
  }
}

// "raj" → "Raj", "four square" → "Four Square"; names typed with capitals are left alone
const capitalise = (v) => (v && v === v.toLowerCase() ? v.replace(/\b\p{L}/gu, c => c.toUpperCase()) : v);

const tidy = (v, max) =>
  text(v, max)
    .replace(/\s*[—–]\s*/g, ', ')
    .replace(/!/g, '.')
    .replace(/\s+/g, ' ')
    .trim();

// People words the AI must not add unless the notes mention them
const PEOPLE_WORDS = ['husband', 'wife', 'partner', 'son', 'daughter', 'brother', 'sister', 'family', 'father', 'mother', 'manager', 'accountant', 'lawyer'];
function addsPeople(out, notes) {
  const lines = `${out.opening ?? ''} ${out.pageNote ?? ''}`.toLowerCase();
  const said = notes.toLowerCase();
  return PEOPLE_WORDS.some(w => new RegExp(`\\b${w}`).test(lines) && !new RegExp(`\\b${w}`).test(said));
}

// True when the personal lines describe the owner ("she mentioned…") rather than speak to them
function talksAboutOwner(out) {
  const lines = `${out.opening ?? ''} ${out.pageNote ?? ''}`;
  const name = typeof out.firstName === 'string' ? out.firstName.trim().split(' ')[0] : '';
  return /\b(she|he|her|his|him)\b/i.test(lines) || (name.length > 1 && new RegExp(`\\b${name.replace(/[^A-Za-z]/g, '')}\\b`, 'i').test(lines));
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  if (!passcodeOk(body.passcode)) return json(401, { error: 'That passcode is not right.' });
  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return json(500, { error: 'The AI is not set up yet (no NVIDIA_API_KEY in Netlify).' });

  const notes = text(body.notes, 3000);
  if (notes.length < 15) return json(400, { error: 'Add a few more words about the meeting first.' });

  try {
    const deadline = Date.now() + TIME_BUDGET_MS;
    const prompt = buildPrompt(notes);
    let out = parseJson(await callModel(prompt, apiKey, deadline));
    if (!out) return json(502, { error: 'The AI gave an unexpected answer. Please try again.' });

    // If it talked about the owner instead of to them, or added people the notes don't mention, ask once more
    if ((talksAboutOwner(out) || addsPeople(out, notes)) && deadline - Date.now() > 3000) {
      try {
        const retry = parseJson(await callModel(`${prompt}\n\nImportant: write "opening" and "pageNote" speaking directly TO the owner as "you". Do not use "she", "he", "her", "his" or their name, and leave out feelings and private details. Only mention people the notes mention.`, apiKey, deadline));
        if (retry && !talksAboutOwner(retry) && !addsPeople(retry, notes)) out = retry;
      } catch {
        /* keep the first answer */
      }
    }

    return json(200, {
      firstName: capitalise(tidy(out.firstName, 40).split(' ')[0] || ''),
      business: capitalise(tidy(out.business, 80)),
      industry: INDUSTRIES.includes(out.industry) ? out.industry : '',
      situation: SITUATIONS.includes(out.situation) ? out.situation : '',
      extraDocs: Array.isArray(out.extraDocs) ? out.extraDocs.filter(d => typeof d === 'string' && DOC_ID_RE.test(d) && d in DOCS).slice(0, 15) : [],
      opening: tidy(out.opening, 500),
      pageNote: tidy(out.pageNote, 800),
    });
  } catch (err) {
    console.error('Draft error:', err.message);
    return json(502, { error: err.message.startsWith('The AI') ? err.message : 'Could not reach the AI. Please try again.' });
  }
};
