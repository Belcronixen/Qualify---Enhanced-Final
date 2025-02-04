/*
  # Fix questionnaire response policies

  1. Changes
    - Add missing policies for user_responses table
    - Allow anonymous users to create responses
    - Fix policy conflicts
    - Maintain existing questionnaire access

  2. Security
    - Anonymous users can create responses
    - Public access for necessary operations
    - Maintain data integrity
*/

-- Drop conflicting policies for user_responses
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON user_responses;
DROP POLICY IF EXISTS "Users can view own responses" ON user_responses;
DROP POLICY IF EXISTS "Users can update own responses" ON user_responses;

-- Create new policies for user_responses
CREATE POLICY "Allow anonymous response creation"
  ON user_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public response viewing"
  ON user_responses
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Allow response updates"
  ON user_responses
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure RLS is enabled
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;