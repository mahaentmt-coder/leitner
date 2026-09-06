-- Update pronoun reference tables to use arrays (JSONB preserves array order, not object key order)
-- Order: Ik, Jij, Hij, Wij, Jullie, Zij, U

-- Subject + Object pronouns card (Ik/Jij/Hij/Wij/Jullie/Zij/U)
-- The word cards that show the full pronoun reference table
-- Affects all cards where conjugations.type = 'table' and has subject/object columns

UPDATE words
SET conjugations = jsonb_build_object(
  'type', 'table',
  'tenses', jsonb_build_array(
    jsonb_build_array('subject', 'Subject Pronouns'),
    jsonb_build_array('object', 'Object Pronouns')
  ),
  'subject', jsonb_build_array(
    jsonb_build_array('Ik',     'I'),
    jsonb_build_array('Jij',    'You'),
    jsonb_build_array('Hij',    'He'),
    jsonb_build_array('Wij',    'We'),
    jsonb_build_array('Jullie', 'You (plural)'),
    jsonb_build_array('Zij',    'They'),
    jsonb_build_array('U',      'You (formal)')
  ),
  'object', jsonb_build_array(
    jsonb_build_array('Mij/me',  'me'),
    jsonb_build_array('Jou/je',  'you'),
    jsonb_build_array('Hem',     'him'),
    jsonb_build_array('Haar',    'her'),
    jsonb_build_array('Ons',     'us'),
    jsonb_build_array('Jullie',  'you (plural)'),
    jsonb_build_array('Hen/ze',  'them'),
    jsonb_build_array('U',       'you (formal)')
  )
)
WHERE conjugations->>'type' = 'table'
  AND conjugations ? 'subject'
  AND conjugations ? 'object';
