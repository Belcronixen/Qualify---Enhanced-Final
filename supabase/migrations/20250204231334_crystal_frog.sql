/*
  # Fix RLS policies for anonymous access

  1. Changes
    - Remove auth.uid() checks for questionnaire_users table
    - Allow anonymous users to create and read user records
    - Maintain admin access controls
    - Fix storage policies for anonymous uploads

  2. Security
    - Anonymous users can create and read questionnaire_user records
    - Authenticated users retain access to their own data
    - Admins maintain full access
    - Storage policies adjusted for anonymous uploads
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Enable insert for anonymous users" ON questionnaire_users;
DROP POLICY IF EXISTS "Users can view own data" ON questionnaire_users;
DROP POLICY IF EXISTS "Users can update own data" ON questionnaire_users;

-- New policies for questionnaire_users
CREATE POLICY "Anyone can create users"
  ON questionnaire_users
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Anyone can read users"
  ON questionnaire_users
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Users can update their own data"
  ON questionnaire_users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin')
  WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

-- Update storage policies
DROP POLICY IF EXISTS "Anyone can upload CV files" ON storage.objects;
DROP POLICY IF EXISTS "Users can read own CV files" ON storage.objects;

CREATE POLICY "Anonymous CV upload"
  ON storage.objects
  FOR INSERT
  TO anon
  WITH CHECK (bucket_id = 'private');

CREATE POLICY "Public CV read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'private');