-- Dutch words for Hadi (profile_id: 5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3)
-- Lesson date: 2025-06-18 (batch 3)

INSERT INTO public.words (profile_id, word, meaning, section, done, language, pronunciation, next_review)
VALUES
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'voorlezen', 'to read out loud', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'uitstekend', 'excellent', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'verder', 'continue / further', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'verwijderen', 'to remove', 1, false, 'nl-NL', null, CURRENT_DATE)
ON CONFLICT DO NOTHING;
