-- Dutch words for Hadi (profile_id: 5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3)
-- Lesson date: 2025-06-18 (batch 2)

INSERT INTO public.words (profile_id, word, meaning, section, done, language, pronunciation, next_review)
VALUES
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'duur', 'expensive', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'goedkoop', 'cheap', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'een halve kilo', 'half a kilo', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'Wat kost …?', 'How much does … cost?', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'Hoeveel kost …?', 'How much does … cost?', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'Mag ik pinnen?', 'Can I pay by card?', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'op de markt', 'at the market', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'in / bij de supermarkt', 'in / at the supermarket', 1, false, 'nl-NL', null, CURRENT_DATE)
ON CONFLICT DO NOTHING;
