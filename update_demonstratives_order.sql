-- Restructure demonstratives reference table: Singular | Plural columns, no example words in labels
-- Before: Closer/Farther columns with Plural/Singular-de/Singular-het rows
-- After:  Singular | Plural columns with clean labels

UPDATE words
SET conjugations = jsonb_build_object(
  'type', 'table',
  'tenses', jsonb_build_array(
    jsonb_build_array('singular', 'Singular'),
    jsonb_build_array('plural', 'Plural')
  ),
  'singular', jsonb_build_array(
    jsonb_build_array('de-word  (close)', 'deze'),
    jsonb_build_array('de-word  (far)',   'die'),
    jsonb_build_array('het-word (close)', 'dit'),
    jsonb_build_array('het-word (far)',   'dat')
  ),
  'plural', jsonb_build_array(
    jsonb_build_array('close', 'deze'),
    jsonb_build_array('far',   'die')
  )
)
WHERE conjugations->>'type' = 'table'
  AND conjugations ? 'closer'
  AND conjugations ? 'farther';
