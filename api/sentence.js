export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { word, meaning, language } = req.body || {};

  if (!word || !meaning) {
    return res.status(400).json({ error: 'Missing word or meaning' });
  }

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'API key not configured on server' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        messages: [{
          role: 'user',
          content: `Give one short, natural example sentence in ${language || 'Dutch'} using the word "${word}" (meaning: ${meaning}). Reply in this exact format with nothing else:\nSENTENCE: <the sentence>\nTRANSLATION: <English translation>`
        }]
      })
    });

    // Log status for debugging
    console.log('Anthropic API status:', response.status);

    if (response.status === 401 || response.status === 403) {
      const body = await response.text();
      console.error('Auth error body:', body);
      return res.status(402).json({ error: 'auth', detail: body });
    }
    if (response.status === 429) {
      return res.status(429).json({ error: 'limit' });
    }
    if (!response.ok) {
      const body = await response.text();
      console.error('API error body:', body);
      return res.status(500).json({ error: 'api', detail: body });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const sentMatch = text.match(/SENTENCE:\s*(.+)/);
    const transMatch = text.match(/TRANSLATION:\s*(.+)/);

    if (!sentMatch) {
      return res.status(500).json({ error: 'parse', raw: text });
    }

    return res.status(200).json({
      sentence: sentMatch[1].trim(),
      translation: transMatch ? transMatch[1].trim() : ''
    });

  } catch (e) {
    console.error('Fetch error:', e.message);
    return res.status(500).json({ error: 'network', detail: e.message });
  }
}
