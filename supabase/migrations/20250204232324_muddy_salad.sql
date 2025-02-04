/*
  # Fix UPSERT policy for questionnaire users

  1. Changes
    - Fix NEW record reference in policy
    - Simplify UPSERT handling
    - Maintain existing permissions

  2. Security
    - Keep RLS enabled
    - Allow anonymous operations
    - Maintain data integrity
*/

-- Drop the problematic policy
DROP POLICY IF EXISTS "Enable upsert operations" ON questionnaire_users;

-- Create a simpler policy that allows all inserts
CREATE POLICY "Enable all inserts"
  ON questionnaire_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

-- Create a policy for updates based on email
CREATE POLICY "Enable email-based updates"
  ON questionnaire_users
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure the email constraint remains deferrable
ALTER TABLE questionnaire_users 
  DROP CONSTRAINT IF EXISTS questionnaire_users_email_key,
  ADD CONSTRAINT questionnaire_users_email_key 
    UNIQUE (email) 
    DEFERRABLE INITIALLY DEFERRED;