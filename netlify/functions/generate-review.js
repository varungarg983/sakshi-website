exports.handler = async function (event) {
  // Only allow POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  const apiKey = process.env.NVIDIA_API_KEY;
  if (!apiKey) {
    return { statusCode: 500, body: JSON.stringify({ error: 'API key not configured' }) };
  }

  let body;
  try {
    body = JSON.parse(event.body);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Invalid request body' }) };
  }

  const { rating, businessName, role, highlights, extra, quickWords } = body;

  let prompt;

  if (quickWords) {
    // Quick mode — build from free-form words
    prompt = `You are helping a client write a genuine Google review for Sakshi Aggarwal, a Business Broker at Clyth McLeod in Auckland, New Zealand.

The client has given you these words and phrases to describe their experience:
"${quickWords.trim()}"

Write a Google review for Sakshi based on these words. Follow these rules exactly:
1. Write in first person as the client
2. Keep it 3–4 sentences — warm, natural, and specific
3. Weave in the client's words naturally — don't just list them
4. End with a genuine recommendation
5. Output ONLY the review text, with no intro, no explanation, no quotation marks`;
  } else {
    // Guided mode — build from structured answers
    const highlightText =
      Array.isArray(highlights) && highlights.length > 0
        ? highlights.join(', ')
        : 'professionalism and communication';

    const businessRef = businessName
      ? `a business called "${businessName}"`
      : 'a business (name not disclosed)';

    prompt = `You are helping a satisfied client write a genuine Google review for Sakshi Aggarwal, a Business Broker at Clyth McLeod in Auckland, New Zealand.

Client's answers:
- Star rating: ${rating || 5} out of 5
- Business involved: ${businessRef}
- Their role in the transaction: ${role || 'client'}
- What they appreciated most: ${highlightText}
- Any extra comments: ${extra ? extra.trim() : 'None provided'}

Write a Google review for Sakshi based on these answers. Follow these rules exactly:
1. Write in first person as the client
2. Keep it 3–4 sentences — not too short, not too long
3. Sound like a real person wrote it — warm, natural, and specific
4. If a business name was provided, mention it naturally in the review
5. If no business name was provided, refer to it generically (e.g. "my business", "the business")
6. Reference the client's role (buying or selling)
7. Mention 1–2 of the things they appreciated, worked naturally into the text
8. If extra comments were provided, incorporate the sentiment
9. End with a genuine recommendation — vary the phrasing, don't always use "I highly recommend"
10. Output ONLY the review text, with no intro, no explanation, no quotation marks`;
  }

  try {
    const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'meta/llama-3.1-8b-instruct',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('NVIDIA API error:', response.status, err);
      return { statusCode: 502, body: JSON.stringify({ error: 'AI service error. Please try again.' }) };
    }

    const data = await response.json();
    console.log('API response:', JSON.stringify(data));
    const review = data.choices?.[0]?.message?.content?.trim();

    if (!review) {
      console.error('Empty review. finish_reason:', data.choices?.[0]?.finish_reason);
      return { statusCode: 502, body: JSON.stringify({ error: 'No review generated. Please try again.' }) };
    }

    return {
      statusCode: 200,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ review }),
    };
  } catch (err) {
    console.error('Function error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: 'Something went wrong. Please try again.' }) };
  }
};
