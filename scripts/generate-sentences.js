// Pre-generate example sentences for all words missing them
// Run: node scripts/generate-sentences.js

import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://sudbjoqhzbtfttxqqbej.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const ANTHROPIC_KEY = process.env.ANTHROPIC_KEY;

if (!SUPABASE_SERVICE_KEY || !ANTHROPIC_KEY) {
  console.error('Missing env vars. Run as:');
  console.error('SUPABASE_SERVICE_KEY=xxx ANTHROPIC_KEY=xxx node scripts/generate-sentences.js');
  process.exit(1);
}

const sb = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

async function generateSentence(word, meaning, language) {
  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': ANTHROPIC_KEY,
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

  if (response.status === 429) {
    throw new Error('rate_limit');
  }
  if (!response.ok) {
    throw new Error(`api_error_${response.status}`);
  }

  const data = await response.json();
  const text = data.content?.[0]?.text || '';
  const sentMatch = text.match(/SENTENCE:\s*(.+)/);
  const transMatch = text.match(/TRANSLATION:\s*(.+)/);
  if (!sentMatch) throw new Error('parse_error');

  return {
    sentence: sentMatch[1].trim(),
    translation: transMatch ? transMatch[1].trim() : ''
  };
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function main() {
  // Fetch all words missing sentences
  const { data: words, error } = await sb
    .from('words')
    .select('id, word, meaning, language')
    .is('example_sentence', null)
    .order('created_at');

  if (error) { console.error('DB error:', error.message); process.exit(1); }

  console.log(`Found ${words.length} words without sentences. Generating...`);

  let done = 0, failed = 0;

  for (const w of words) {
    try {
      const { sentence, translation } = await generateSentence(w.word, w.meaning, w.language || 'Dutch');
      await sb.from('words').update({ example_sentence: sentence, example_translation: translation }).eq('id', w.id);
      done++;
      console.log(`[${done}/${words.length}] ✓ ${w.word} → ${sentence}`);
      await sleep(500); // 500ms between calls to avoid rate limiting
    } catch (e) {
      if (e.message === 'rate_limit') {
        console.log('Rate limited — waiting 60s...');
        await sleep(60000);
        // retry
        try {
          const { sentence, translation } = await generateSentence(w.word, w.meaning, w.language || 'Dutch');
          await sb.from('words').update({ example_sentence: sentence, example_translation: translation }).eq('id', w.id);
          done++;
          console.log(`[${done}/${words.length}] ✓ ${w.word} (retry) → ${sentence}`);
        } catch (e2) {
          console.error(`[FAIL] ${w.word}: ${e2.message}`);
          failed++;
        }
      } else {
        console.error(`[FAIL] ${w.word}: ${e.message}`);
        failed++;
      }
      await sleep(500);
    }
  }

  console.log(`\nDone! ✓ ${done} generated, ✗ ${failed} failed`);
}

main();
