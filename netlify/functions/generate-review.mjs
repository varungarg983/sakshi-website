import { getStore } from '@netlify/blobs';
import { generateBatch, HISTORY_LIMIT } from '../review-core.mjs';

// Reviews that clients copied to post on Google are kept here, so new reviews can be steered away from them
const HISTORY_KEY = 'copied-reviews';

const json = (status, body) =>
  new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } });

// Memory is a bonus: if storage is unavailable, reviews are still generated without it
async function loadHistory() {
  try {
    const data = await getStore('review-memory').get(HISTORY_KEY, { type: 'json' });
    return Array.isArray(data) ? data : [];
  } catch (err) {
    console.error('Could not load review history:', err.message);
    return [];
  }
}

async function saveToHistory(review) {
  const store = getStore('review-memory');
  const history = (await store.get(HISTORY_KEY, { type: 'json' })) || [];
  if (history.includes(review)) return;
  history.push(review);
  await store.setJSON(HISTORY_KEY, history.slice(-HISTORY_LIMIT));
}

export default async (req) => {
  if (req.method !== 'POST') return json(405, { error: 'Method not allowed' });

  let body;
  try {
    body = await req.json();
  } catch {
    return json(400, { error: 'Invalid request body' });
  }

  // Called when a client copies a review to post it
  if (body.action === 'save') {
    const review = typeof body.review === 'string' ? body.review.trim() : '';
    if (review.length < 20 || review.length > 1500) return json(400, { error: 'Invalid review' });
    try {
      await saveToHistory(review);
      return json(200, { saved: true });
    } catch (err) {
      console.error('Could not save review:', err.message);
      return json(500, { error: 'Could not save' });
    }
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) return json(500, { error: 'API key not configured' });

  if (!body.quickWords && !body.extra) return json(400, { error: 'Please describe your experience first.' });

  try {
    const history = await loadHistory();
    const reviews = await generateBatch(body, history, apiKey, msg => console.log(msg));
    if (!reviews.length) return json(502, { error: 'No reviews were generated. Please try again.' });
    return json(200, { reviews });
  } catch (err) {
    console.error('Function error:', err);
    return json(500, { error: 'Something went wrong. Please try again.' });
  }
};
