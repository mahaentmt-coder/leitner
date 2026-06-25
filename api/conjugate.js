export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { word } = req.body || {};
  if (!word) return res.status(400).json({ error: 'Missing word' });

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

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
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: `Is "${word}" a Dutch verb? If yes, provide conjugations in JSON. If no, reply with {"is_verb": false}.

If it is a verb, reply with ONLY this JSON (no extra text):
{
  "is_verb": true,
  "infinitive": "<infinitive form>",
  "present":         {"ik": "", "jij": "", "hij/zij": "", "wij": "", "jullie": "", "zij": ""},
  "past":            {"ik": "", "jij": "", "hij/zij": "", "wij": "", "jullie": "", "zij": ""},
  "present_perfect": {"ik": "", "jij": "", "hij/zij": "", "wij": "", "jullie": "", "zij": ""},
  "future":          {"ik": "", "jij": "", "hij/zij": "", "wij": "", "jullie": "", "zij": ""}
}`
        }]
      })
    });

    if (!response.ok) return res.status(500).json({ error: 'api_error' });

    const data = await response.json();
    const text = data.content?.[0]?.text || '';

    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return res.status(500).json({ error: 'parse_error' });

    const conjugations = JSON.parse(jsonMatch[0]);

    // Save to DB if word_id provided
    const { word_id } = req.body;
    if (word_id && conjugations.is_verb) {
      const { createClient } = await import('@supabase/supabase-js');
      const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);
      await sb.from('words').update({ conjugations }).eq('id', word_id);
    }

    return res.status(200).json(conjugations);
  } catch (e) {
    return res.status(500).json({ error: 'network', detail: e.message });
  }
}
