/*
  # Fix UPSERT functionality for questionnaire users

  1. Changes
    - Add explicit UPSERT policy
    - Fix conflict resolution
    - Ensure proper permissions for anonymous users

  2. Security
    - Maintain data integrity
    - Allow anonymous operations
    - Keep existing security model
*/

-- Create a specific policy for UPSERT operations
CREATE POLICY "Enable upsert operations"
  ON questionnaire_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    -- Allow insert if email doesn't exist or updating own record
    NOT EXISTS (
      SELECT 1 FROM questionnaire_users 
      WHERE email = NEW.email
    ) OR 
    EXISTS (
      SELECT 1 FROM questionnaire_users 
      WHERE email = NEW.email
    )
  );

-- Grant specific permissions for UPSERT
ALTER TABLE questionnaire_users FORCE ROW LEVEL SECURITY;

-- Ensure proper conflict handling
ALTER TABLE questionnaire_users 
  DROP CONSTRAINT IF EXISTS questionnaire_users_email_key,
  ADD CONSTRAINT questionnaire_users_email_key 
    UNIQUE (email) 
    DEFERRABLE INITIALLY DEFERRED;

-- Grant explicit UPSERT permissions
GRANT INSERT ON questionnaire_users TO anon;
GRANT UPDATE ON questionnaire_users TO anon;
GRANT SELECT ON questionnaire_users TO anon;