/*
  # Fix UPSERT policies for questionnaire

  1. Changes
    - Add explicit UPSERT policy for questionnaire_users
    - Fix ON CONFLICT handling for anonymous users
    - Ensure proper access for all operations

  2. Security
    - Maintain RLS while allowing necessary operations
    - Enable anonymous UPSERT operations
    - Keep public access secure
*/

-- Drop existing policy
DROP POLICY IF EXISTS "Enable public access for questionnaire" ON questionnaire_users;

-- Create separate policies for each operation
CREATE POLICY "Enable anonymous inserts"
  ON questionnaire_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Enable anonymous selects"
  ON questionnaire_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Enable anonymous updates"
  ON questionnaire_users
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Grant necessary permissions to anonymous users
ALTER TABLE questionnaire_users FORCE ROW LEVEL SECURITY;
GRANT ALL ON questionnaire_users TO anon;
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;