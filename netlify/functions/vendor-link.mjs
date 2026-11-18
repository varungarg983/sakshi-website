import { getStore } from '@netlify/blobs';
import { randomBytes, timingSafeEqual } from 'node:crypto';

// Personal vendor links: Sakshi makes one after a call, the vendor opens /v/<id>
const INDUSTRIES = ['cafe', 'hospitality', 'cleaning', 'retail', 'service', 'other'];
const SITUATIONS = ['retiring', 'moving-on', 'health', 'relocating', 'first-sale'];
const ID_RE = /^[A-Za-z0-9]{6,20}$/;
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';

const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });

const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function newId() {
  return [...randomBytes(10)].map(b => ALPHABET[b % ALPHABET.length]).join('');
}

function passcodeOk(given) {
  const expected = process.env.VENDOR_LINK_PASSCODE;
  if (!expected || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export default async (req) => {
  const store = getStore('vendor-links');

  if (req.method === 'GET') {
    const id = new URL(req.url).searchParams.get('id') || '';
    if (!ID_RE.test(id)) return json(400, { error: 'Invalid link' });
    try {
      const vendor = await store.get(id, { type: 'json' });
      if (!vendor) return json(404, { error: 'Link not found' });
      const { firstName, business, industry, situation, note } = vendor;
      return json(200, { firstName, business, industry, situation, note });
    } catch (err) {
      console.error('Could not load vendor link:', err.message);
      return json(500, { error: 'Could not load' });
    }
  }

  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request' });
  }

  if (!process.env.VENDOR_LINK_PASSCODE) return json(500, { error: 'Link maker is not set up yet (no passcode in Netlify).' });
  if (!passcodeOk(body.passcode)) return json(401, { error: 'That passcode is not right.' });

  const firstName = text(body.firstName, 40);
  if (!firstName) return json(400, { error: 'Please add their first name.' });

  const vendor = {
    firstName,
    business: text(body.business, 80),
    industry: INDUSTRIES.includes(body.industry) ? body.industry : undefined,
    situation: SITUATIONS.includes(body.situation) ? body.situation : undefined,
    note: text(body.note, 800),
    created: new Date().toISOString(),
  };

  try {
    const id = newId();
    await store.setJSON(id, vendor);
    return json(200, { id });
  } catch (err) {
    console.error('Could not save vendor link:', err.message);
    return json(500, { error: 'Could not save the link. Please try again.' });
  }
};
