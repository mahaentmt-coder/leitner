# Leitner Flashcards

A cloud-based spaced repetition vocabulary trainer built with vanilla HTML/JS, Supabase, and Vercel. Supports multiple user profiles, Dutch TTS pronunciation, Excel import, and AI-generated example sentences.

---

## Features

- **Spaced repetition** — 6-box Leitner system with automatic date-based scheduling
- **Multiple profiles** — each user has their own word list stored in the cloud
- **19 languages** — built-in Text-to-Speech pronunciation for Dutch, English, German, French, and more
- **Auto-pronunciation** — words are spoken aloud automatically when a card is revealed
- **AI example sentences** — a natural example sentence is generated for each word on reveal
- **Excel import** — bulk import words from `.xlsx` files using a simple template
- **Dark / light mode** — toggle between themes, preference is saved
- **Browser independent** — all data stored in Supabase, accessible from any device

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Database | [Supabase](https://supabase.com) (PostgreSQL) |
| Hosting | [Vercel](https://vercel.com) |
| Sentence AI | Anthropic API (Claude Haiku) via Vercel serverless function |
| Pronunciation | Web Speech API (built-in browser TTS) |
| Excel parsing | [SheetJS (xlsx)](https://sheetjs.com) |

---

## Project Structure

```
├── index.html          # Main app (entire frontend)
├── vercel.json         # Vercel function configuration
├── api/
│   └── sentence.js     # Serverless function — calls Anthropic API securely
└── README.md
```

---

## Setup & Deployment

### 1. Supabase — Database

1. Create a free account at [supabase.com](https://supabase.com)
2. Create a new project
3. Go to **SQL Editor** and run the following:

```sql
-- Profiles table
create table profiles (
  id uuid primary key default gen_random_uuid(),
  username text unique not null,
  pin text not null,
  created_at timestamp default now()
);

-- Words table
create table words (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  word text not null,
  meaning text not null,
  section integer default 1,
  done boolean default false,
  pronunciation text,
  language text default 'nl-NL',
  next_review date default current_date,
  created_at timestamp default now()
);

-- Row Level Security policies
create policy "allow insert profiles" on profiles for insert with check (true);
create policy "allow select profiles" on profiles for select using (true);
create policy "allow insert words" on words for insert with check (true);
create policy "allow select words" on words for select using (true);
create policy "allow update words" on words for update using (true) with check (true);
create policy "allow delete words" on words for delete using (true);
```

4. Go to **Project Settings → API** and copy:
   - Project URL
   - Anon public key

5. Paste both into `index.html`:

```js
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_KEY = 'your-anon-key';
```

---

### 2. Anthropic API — AI Sentences (optional)

1. Create an account at [console.anthropic.com](https://console.anthropic.com)
2. Add credit (minimum $5 — costs ~$0.02/month for typical use)
3. Generate an API key
4. **Do not paste the key into the code** — add it as an environment variable in Vercel (see step 3)

---

### 3. Vercel — Hosting

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. Go to **Settings → Environment Variables** and add:
   - Name: `ANTHROPIC_KEY`
   - Value: `sk-ant-api03-...your key...`
   - Environment: Production
4. Click **Deploy**

Your app will be live at `your-project.vercel.app`.

---

## How the Leitner System Works

Words move through 6 boxes based on your performance. Each box has a longer review interval:

| Box | Sections | Review interval |
|---|---|---|
| Box 1 | §1–2 | 1 day |
| Box 2 | §3–6 | 2 days |
| Box 3 | §7–14 | 4 days |
| Box 4 | §15–29 | 8 days |
| Box 5 | §30–45 | 16 days |
| Box 6 | §46–76 | Retired ✓ |

- **Correct answer** → word moves to the next section, scheduled further in the future
- **Wrong answer** → word resets to Box 1, due again today

---

## Excel Import Format

Download the template from the app, or create a `.xlsx` file with these columns:

| word | meaning | language | pronunciation |
|---|---|---|---|
| hallo | hello | nl-NL | *(optional URL)* |
| wereld | world | nl-NL | |

---

## Login System

Profiles use a simple **username + 4-digit PIN** system. There is no email or password — this is designed for personal/classroom use, not a public-facing authentication system.

---

## Local Development

No build step required. Just open `index.html` in a browser.

For the serverless sentence function to work locally, use the [Vercel CLI](https://vercel.com/docs/cli):

```bash
npm i -g vercel
vercel dev
```

Then open `http://localhost:3000`.

---

## License

MIT — free to use and modify.
