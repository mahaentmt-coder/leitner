// Simple build script: copies web assets to www/ for Capacitor
import { mkdirSync, copyFileSync, readdirSync, existsSync } from 'fs';
import { join } from 'path';

mkdirSync('www', { recursive: true });
mkdirSync('www/icon', { recursive: true });

const files = ['index.html', 'sw.js', 'manifest.json'];
files.forEach(f => { copyFileSync(f, join('www', f)); console.log('  copied', f); });

readdirSync('icon').forEach(f => {
  copyFileSync(join('icon', f), join('www/icon', f));
  console.log('  copied icon/' + f);
});

console.log('Build complete → www/');
