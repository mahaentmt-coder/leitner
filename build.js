// Build script: downloads CDN libs locally and copies web assets to www/
import { mkdirSync, copyFileSync, readdirSync, existsSync, writeFileSync } from 'fs';
import { join } from 'path';

async function downloadIfMissing(url, dest) {
  if (existsSync(dest)) { console.log('  cached', dest); return; }
  console.log('  downloading', url);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Failed to download ${url}: ${res.status}`);
  const buf = await res.arrayBuffer();
  writeFileSync(dest, Buffer.from(buf));
}

// 1. Download CDN libs to root libs/
mkdirSync('libs', { recursive: true });
await downloadIfMissing(
  'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.js',
  'libs/supabase.js'
);
await downloadIfMissing(
  'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js',
  'libs/xlsx.js'
);

// 2. Build www/ for Capacitor
mkdirSync('www', { recursive: true });
mkdirSync('www/icon', { recursive: true });
mkdirSync('www/libs', { recursive: true });

const files = ['index.html', 'sw.js', 'manifest.json'];
files.forEach(f => { copyFileSync(f, join('www', f)); console.log('  copied', f); });

readdirSync('icon').forEach(f => {
  copyFileSync(join('icon', f), join('www/icon', f));
});

['supabase.js', 'xlsx.js'].forEach(f => {
  copyFileSync(join('libs', f), join('www/libs', f));
  console.log('  copied libs/' + f);
});

console.log('Build complete → www/');
