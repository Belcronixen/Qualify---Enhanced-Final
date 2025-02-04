/*
  # Set up RLS policies for questionnaire tables

  1. Security Changes
    - Enable RLS on all tables
    - Add policies for:
      - questionnaire_users
      - user_responses
      - questions
      - categories
    - Ensure public read access where needed
    - Restrict write access appropriately

  2. Policy Details
    - Anonymous users can create their own records
    - Users can read/update their own data
    - Admins have full access
*/

-- Enable RLS on all tables
ALTER TABLE questionnaire_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses ENABLE ROW LEVEL SECURITY;
ALTER TABLE questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Policies for questionnaire_users
CREATE POLICY "Enable insert for anonymous users"
  ON questionnaire_users
  FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Users can view own data"
  ON questionnaire_users
  FOR SELECT
  USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can update own data"
  ON questionnaire_users
  FOR UPDATE
  USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

-- Policies for user_responses
CREATE POLICY "Enable insert for authenticated users"
  ON user_responses
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can view own responses"
  ON user_responses
  FOR SELECT
  USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY "Users can update own responses"
  ON user_responses
  FOR UPDATE
  USING (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin');

-- Policies for questions
CREATE POLICY "Questions are publicly readable"
  ON questions
  FOR SELECT
  TO anon
  USING (NOT is_hidden);

CREATE POLICY "Admins have full access to questions"
  ON questions
  USING (auth.jwt()->>'role' = 'admin');

-- Policies for categories
CREATE POLICY "Categories are publicly readable"
  ON categories
  FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Admins have full access to categories"
  ON categories
  USING (auth.jwt()->>'role' = 'admin');

-- Storage policies for CV files
CREATE POLICY "Anyone can upload CV files"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'private' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Users can read own CV files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (bucket_id = 'private' AND (
    (storage.foldername(name))[1] = auth.uid()::text
    OR auth.jwt()->>'role' = 'admin'
  ));