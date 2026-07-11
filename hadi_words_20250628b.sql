-- Dutch words for Hadi (profile_id: 5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3)
-- Lesson: comparatives, superlatives and adverbs

INSERT INTO public.words (profile_id, word, meaning, example_sentence, example_translation, section, done, language, pronunciation, next_review)
VALUES
  -- Base forms
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'goed', 'good', 'Hij spreekt goed Nederlands.', 'He speaks Dutch well.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'veel', 'much / many', 'Ik heb veel vrienden in Nederland.', 'I have many friends in the Netherlands.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'weinig', 'little / few', 'Ik heb weinig tijd vandaag.', 'I have little time today.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'graag', 'gladly / with pleasure', 'Ik drink graag koffie.', 'I like drinking coffee.', 1, false, 'nl-NL', null, CURRENT_DATE),

  -- Comparatives (+ dan)
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'beter (dan)', 'better (than)', 'Jij spreekt beter Nederlands dan ik.', 'You speak Dutch better than I do.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'meer (dan)', 'more (than)', 'Hij verdient meer dan zij.', 'He earns more than she does.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'minder (dan)', 'less (than)', 'Ik slaap minder dan acht uur.', 'I sleep less than eight hours.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'liever (dan)', 'rather / prefer (than)', 'Ik drink liever thee dan koffie.', 'I prefer drinking tea rather than coffee.', 1, false, 'nl-NL', null, CURRENT_DATE),

  -- Superlatives (het)
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', '(het) best', 'best', 'Zij zingt het best van iedereen.', 'She sings the best of everyone.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', '(het) meest', 'most', 'Ik hou het meest van de zomer.', 'I like summer the most.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', '(het) minst', 'least', 'De winter vind ik het minst leuk.', 'I like winter the least.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', '(het) liefst', 'most of all / would most like', 'Ik wil het liefst naar het strand gaan.', 'I would most like to go to the beach.', 1, false, 'nl-NL', null, CURRENT_DATE),

  -- Phrase
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'even weinig als', 'as little as', 'Hij werkt even weinig als zijn broer.', 'He works as little as his brother.', 1, false, 'nl-NL', null, CURRENT_DATE)
ON CONFLICT DO NOTHING;
