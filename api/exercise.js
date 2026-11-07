// api/exercise.js — generates fill-in-the-blank exercises from a word list
// Uses the same ANTHROPIC_KEY env var as api/sentence.js

const LEVELS = { A1: 'A1 (absolute beginner)', A2: 'A2 (elementary)', B1: 'B1 (intermediate)' };

function cleanWords(raw) {
  if (!Array.isArray(raw)) return [];
  const seen = new Set();
  const out = [];
  for (const w of raw) {
    if (typeof w !== 'string') continue;
    const t = w.trim().replace(/\s+/g, ' ').slice(0, 40);
    if (!t || seen.has(t.toLowerCase())) continue;
    seen.add(t.toLowerCase());
    out.push(t);
    if (out.length >= 120) break;
  }
  return out;
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function extractJson(text) {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try { return JSON.parse(text.slice(start, end + 1)); } catch { return null; }
}

function validate(ex, wordSet) {
  if (!ex || typeof ex !== 'object') return null;
  const str = v => (typeof v === 'string' ? v.trim() : '');
  let sentence = str(ex.sentence).replace(/_{2,}/g, '___');
  const answer = str(ex.answer);
  const base = str(ex.base) || answer;
  if (!sentence || !answer) return null;
  // exactly one blank
  if (sentence.split('___').length !== 2) return null;
  // the base word must come from the user's list
  if (!wordSet.has(base.toLowerCase())) return null;
  const alsoAccept = Array.isArray(ex.also_accept)
    ? ex.also_accept.filter(a => typeof a === 'string' && a.trim()).map(a => a.trim()).slice(0, 4)
    : [];
  return {
    base,
    answer,
    sentence,
    full_sentence: sentence.replace('___', answer),
    word_meaning: str(ex.word_meaning),
    sentence_translation: str(ex.sentence_translation),
    also_accept: alsoAccept
  };
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.ANTHROPIC_KEY;
  if (!apiKey) return res.status(500).json({ error: 'API key not configured' });

  const body = req.body || {};
  const words = cleanWords(body.words);
  const level = LEVELS[body.level] ? body.level : 'A2';
  const count = Math.max(1, Math.min(20, parseInt(body.count, 10) || 10, words.length));

  if (words.length < 2) {
    return res.status(400).json({ error: 'need_words' });
  }

  // Pick which words to test so the model doesn't always choose the same ones
  const targets = shuffle([...words]).slice(0, count);
  const wordSet = new Set(words.map(w => w.toLowerCase()));

  const prompt = `You are an experienced Dutch teacher writing fill-in-the-blank exercises for a learner at CEFR level ${LEVELS[level]}.

Full word list (the learner sees all of these as options):
${words.join(', ')}

Write exactly one exercise for EACH of these target words, in this order:
${targets.join(', ')}

Rules:
- One natural, everyday Dutch sentence or two short sentences, 6–16 words total, suited to level ${level}.
- Replace the target word with exactly "___" (three underscores). Only one blank per exercise.
- The context must make the target word clearly the best fit among the whole word list. Avoid contexts where another list word fits equally well; if one other list word is genuinely also correct, put it in "also_accept".
- Apply correct Dutch grammar to the blanked word (e.g. adjective -e ending: "een ___ huis" vs "de ___ auto" → "grote"). "answer" is the exact form that goes in the blank; "base" is the word exactly as it appears in the list.
- "word_meaning": short English meaning of the base word (1–4 words).
- "sentence_translation": natural English translation of the complete sentence.

Reply with ONLY valid JSON, no markdown, in this shape:
{"exercises":[{"base":"nat","answer":"nat","sentence":"Het regent de hele dag. Alles buiten is ___.","word_meaning":"wet","sentence_translation":"It has been raining all day. Everything outside is wet.","also_accept":[]}]}`;

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
        max_tokens: 4000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (response.status === 401 || response.status === 403) return res.status(402).json({ error: 'auth' });
    if (response.status === 429 || response.status === 529) return res.status(429).json({ error: 'limit' });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error('Anthropic error', response.status, detail.slice(0, 300));
      return res.status(500).json({ error: 'api' });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text || '';
    const parsed = extractJson(text);
    if (!parsed || !Array.isArray(parsed.exercises)) {
      console.error('Parse failure', text.slice(0, 300));
      return res.status(500).json({ error: 'parse' });
    }

    const exercises = parsed.exercises.map(e => validate(e, wordSet)).filter(Boolean);
    if (!exercises.length) return res.status(500).json({ error: 'parse' });

    return res.status(200).json({ exercises, level });
  } catch (e) {
    console.error('Network error', e);
    return res.status(500).json({ error: 'network' });
  }
}
