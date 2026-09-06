// Fill missing meanings for words with null meaning
// Usage: node scripts/fill_meanings.mjs
//
// Set these env vars before running:
//   SUPABASE_URL=https://xxxx.supabase.co
//   SUPABASE_SERVICE_KEY=your-service-key
//   ANTHROPIC_KEY=sk-ant-...
//   PROFILE_ID=5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3   (optional, omit for all profiles)

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;
const PROFILE_ID = process.env.PROFILE_ID; // optional

if (!SUPABASE_URL || !SUPABASE_KEY || !ANTHROPIC_KEY) {
  console.error('Missing env vars: SUPABASE_URL, SUPABASE_SERVICE_KEY, ANTHROPIC_KEY');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getMeaning(word, language = 'nl-NL') {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
      'anthropic-version': '2023-06-01'
    },
    body: JSON.stringify({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 60,
      messages: [{
        role: 'user',
        content: `Give all English meanings of the ${language} word or phrase "${word}" separated by " / ". Reply with ONLY the meanings, nothing else. Example: "to put / to set / to place"`
      }]
    })
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  const data = await res.json();
  const meaning = data.content?.[0]?.text?.trim() || '';
  // Reject error responses
  if (!meaning || meaning.toLowerCase().startsWith('i cannot') || meaning.length > 120) return null;
  return meaning;
}

async function main() {
  // Fetch words with null meaning
  let query = sb.from('words').select('id, word, language').is('meaning', null);
  if (PROFILE_ID) query = query.eq('profile_id', PROFILE_ID);
  const { data: words, error } = await query;

  if (error) { console.error('Fetch error:', error.message); process.exit(1); }
  console.log(`Found ${words.length} words with null meaning`);

  let updated = 0, skipped = 0;

  for (const w of words) {
    try {
      const meaning = await getMeaning(w.word, w.language || 'nl-NL');
      if (meaning) {
        await sb.from('words').update({ meaning }).eq('id', w.id);
        console.log(`✓ ${w.word} → ${meaning}`);
        updated++;
      } else {
        console.log(`⚠ ${w.word} → skipped (no valid meaning)`);
        skipped++;
      }
      // Rate limit: 1 request per second
      await new Promise(r => setTimeout(r, 1000));
    } catch (e) {
      console.error(`✗ ${w.word}: ${e.message}`);
      skipped++;
    }
  }

  console.log(`\nDone: ${updated} updated, ${skipped} skipped`);
}

main();
