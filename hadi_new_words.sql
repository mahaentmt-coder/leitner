-- New Dutch words for Hadi (profile_id: 5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3)

INSERT INTO public.words (profile_id, word, meaning, example_sentence, example_translation, section, done, language, pronunciation, next_review)
VALUES
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'stamppot', 'mashed potato dish with vegetables', 'Mijn moeder maakt elke winter een heerlijke stamppot.', 'My mother makes a delicious stamppot every winter.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'andijvie', 'endive', 'Andijviestamppot is een klassiek Nederlands gerecht.', 'Endive mash is a classic Dutch dish.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'slager', 'butcher', 'Ik koop altijd mijn vlees bij de slager op de hoek.', 'I always buy my meat at the butcher on the corner.', 1, false, 'nl-NL', null, CURRENT_DATE),
  ('5a0c7ef6-ea89-4210-aaf0-a7ee9d2924d3', 'komkommers', 'cucumbers', 'Ik snijd de komkommers in plakjes voor de salade.', 'I slice the cucumbers for the salad.', 1, false, 'nl-NL', null, CURRENT_DATE)
ON CONFLICT DO NOTHING;
