import { timingSafeEqual } from 'node:crypto';

// Shared by the vendor link and AI draft functions

export const INDUSTRIES = ['cafe', 'hospitality', 'cleaning', 'retail', 'service', 'other'];
export const SITUATIONS = ['retiring', 'moving-on', 'health', 'relocating', 'first-sale'];
export const DOC_ID_RE = /^[a-z][a-z-]{1,40}$/;

export const json = (status, body) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' },
  });

export const text = (v, max) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

// Sakshi's passcode, set as VENDOR_LINK_PASSCODE in Netlify
export function passcodeOk(given) {
  const expected = process.env.VENDOR_LINK_PASSCODE;
  if (!expected || typeof given !== 'string') return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}
