import { getStore } from '@netlify/blobs';
import { randomBytes } from 'node:crypto';
import { DOC_ID_RE, INDUSTRIES, SITUATIONS, json, passcodeOk, text } from '../vendor-shared.mjs';

// Personal vendor links: Sakshi makes one after a meeting, the vendor opens /v/<id>
const ID_RE = /^[A-Za-z0-9]{6,20}$/;
const CUSTOM_PREFIX = 'custom:';
const ALPHABET = 'abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789';
// List of Sakshi's recent links. The underscore means a vendor link id can never match it.
const INDEX_KEY = '_recent';
const INDEX_LIMIT = 100;

// Library documents are short ids; Sakshi's own ones are "custom:<text>"
function cleanDocs(list) {
  if (!Array.isArray(list)) return undefined;
  const out = [];
  let custom = 0;
  for (const item of list.slice(0, 60)) {
    if (typeof item !== 'string') continue;
    if (item.startsWith(CUSTOM_PREFIX)) {
      const t = item.slice(CUSTOM_PREFIX.length).replace(/\s+/g, ' ').trim().slice(0, 80);
      if (t && custom < 10) { out.push(CUSTOM_PREFIX + t); custom++; }
    } else if (DOC_ID_RE.test(item)) {
      out.push(item);
    }
  }
  return [...new Set(out)];
}

function newId() {
  return [...randomBytes(10)].map(b => ALPHABET[b % ALPHABET.length]).join('');
}

async function loadIndex(store) {
  try {
    const list = await store.get(INDEX_KEY, { type: 'json' });
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export default async (req) => {
  const store = getStore('vendor-links');

  // What the vendor's page loads. The message opening is Sakshi's, so it isn't sent here.
  if (req.method === 'GET') {
    const id = new URL(req.url).searchParams.get('id') || '';
    if (!ID_RE.test(id)) return json(400, { error: 'Invalid link' });
    try {
      const vendor = await store.get(id, { type: 'json' });
      if (!vendor) return json(404, { error: 'Link not found' });
      const { firstName, business, industry, situation, note, docs } = vendor;
      return json(200, { firstName, business, industry, situation, note, docs });
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

  // Sakshi's recent links, newest first
  if (body.action === 'recent') {
    return json(200, { links: (await loadIndex(store)).slice(0, 50) });
  }

  const firstName = text(body.firstName, 40);
  if (!firstName) return json(400, { error: 'Please add their first name.' });

  const vendor = {
    firstName,
    business: text(body.business, 80),
    industry: INDUSTRIES.includes(body.industry) ? body.industry : undefined,
    situation: SITUATIONS.includes(body.situation) ? body.situation : undefined,
    note: text(body.note, 800),
    opening: text(body.opening, 500),
    docs: cleanDocs(body.docs),
    created: new Date().toISOString(),
  };

  try {
    const id = newId();
    await store.setJSON(id, vendor);
    // The recent list is a bonus: if it can't be updated, the link still works
    try {
      const index = await loadIndex(store);
      index.unshift({ id, ...vendor });
      await store.setJSON(INDEX_KEY, index.slice(0, INDEX_LIMIT));
    } catch (err) {
      console.error('Could not update recent links:', err.message);
    }
    return json(200, { id });
  } catch (err) {
    console.error('Could not save vendor link:', err.message);
    return json(500, { error: 'Could not save the link. Please try again.' });
  }
};
