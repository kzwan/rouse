INSERT INTO games (name, description, enabled)
VALUES 
  ('Anagram', 'Unscramble letters to form words', true)
ON CONFLICT (name) DO NOTHING;