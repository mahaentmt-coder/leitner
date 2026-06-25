-- Dutch words for Hadi (profile_id: 5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3)
-- Lesson: misc vocabulary (batch 4)

INSERT INTO public.words (profile_id, word, meaning, example_sentence, example_translation, section, done, language, pronunciation, next_review)
VALUES
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'Ik ga rusten.', 'I''m going to rest.', 'Ik ga rusten, ik ben erg moe.', 'I''m going to rest, I am very tired.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'Ik heb gewerkt.', 'I worked.', 'Ik heb vandaag acht uur gewerkt.', 'I worked eight hours today.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'shoppen / winkelen', 'to shop', 'Ik ga winkelen in het centrum.', 'I am going shopping in the centre.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'de winkel / de zaak', 'shop / store', 'De winkel sluit om zes uur.', 'The shop closes at six o''clock.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'Je moet deze soep eens proeven!', 'You must try this soup!', 'Je moet deze soep eens proeven, hij is heerlijk!', 'You must try this soup, it is delicious!', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'het raam', 'window', 'Kun jij het raam even openen?', 'Can you open the window for a moment?', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'de room', 'cream', 'Ik doe room in mijn koffie.', 'I put cream in my coffee.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'de slagroom', 'whipped cream', 'Wil je slagroom op je taart?', 'Do you want whipped cream on your cake?', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'iets', 'something', 'Wil je iets drinken?', 'Do you want something to drink?', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'niets', 'nothing', 'Ik wil niets eten, ik heb geen honger.', 'I want nothing to eat, I am not hungry.', 1, false, 'nl-NL', null, CURRENT_DATE)
ON CONFLICT DO NOTHING;
