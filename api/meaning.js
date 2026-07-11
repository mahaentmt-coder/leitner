export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { word, language } = req.body || {};
  if (!word) return res.status(400).json({ error: 'Missing word' });

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) return res.status(500).json({ error: 'no_key' });

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
        max_tokens: 60,
        messages: [{
          role: 'user',
          content: `Give all English meanings of the ${language || 'Dutch'} word "${word}" separated by " / ". Reply with ONLY the meanings, nothing else. Example: "to put / to set / to place"`
        }]
      })
    });

    if (!response.ok) return res.status(500).json({ error: 'api_error' });

    const data = await response.json();
    const meaning = data.content?.[0]?.text?.trim() || '';
    return res.status(200).json({ meaning });
  } catch (e) {
    return res.status(500).json({ error: 'network', detail: e.message });
  }
}
