-- Dutch words for Hadi (profile_id: 5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3)
-- Lesson: misc vocabulary (batch 3)

INSERT INTO public.words (profile_id, word, meaning, example_sentence, example_translation, section, done, language, pronunciation, next_review)
VALUES
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'de wedstrijd', 'the match / game', 'De wedstrijd begint om acht uur.', 'The match starts at eight o''clock.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'tegen', 'against', 'Nederland speelt tegen Duitsland.', 'The Netherlands plays against Germany.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'het dier', 'animal', 'De olifant is een groot dier.', 'The elephant is a large animal.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'de olifant', 'elephant', 'De olifant drinkt water uit de rivier.', 'The elephant drinks water from the river.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'de blauwe walvis', 'the blue whale', 'De blauwe walvis is het grootste dier ter wereld.', 'The blue whale is the largest animal in the world.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'de paarse lippenstift', 'the purple lipstick', 'Ze draagt een paarse lippenstift.', 'She is wearing purple lipstick.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'lelijk', 'ugly', 'Ik vind dat model erg lelijk.', 'I find that style very ugly.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'gratis', 'free (no cost)', 'Dit T-shirt is gratis bij aankoop.', 'This T-shirt is free with purchase.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'rood licht', 'red light', 'Je mag niet rijden bij rood licht.', 'You must not drive through a red light.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'het verkeerslicht', 'traffic light', 'Het verkeerslicht is groen, je kunt gaan.', 'The traffic light is green, you can go.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'goed gedaan', 'well done', 'Goed gedaan, je hebt de wedstrijd gewonnen!', 'Well done, you won the match!', 1, false, 'nl-NL', null, CURRENT_DATE)
ON CONFLICT DO NOTHING;
