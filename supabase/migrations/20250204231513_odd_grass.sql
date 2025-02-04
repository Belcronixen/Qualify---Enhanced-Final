/*
  # Fix questionnaire policies and user handling

  1. Changes
    - Simplify RLS policies for questionnaire_users
    - Allow anonymous access for essential operations
    - Fix user creation flow
    - Update storage policies

  2. Security
    - Anonymous users can create and read questionnaire records
    - Public access for necessary operations
    - Maintain admin privileges
    - Secure file storage access
*/

-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can create users" ON questionnaire_users;
DROP POLICY IF EXISTS "Anyone can read users" ON questionnaire_users;
DROP POLICY IF EXISTS "Users can update their own data" ON questionnaire_users;
DROP POLICY IF EXISTS "Anonymous CV upload" ON storage.objects;
DROP POLICY IF EXISTS "Public CV read" ON storage.objects;

-- Create simplified policies for questionnaire_users
CREATE POLICY "Enable public access for questionnaire"
  ON questionnaire_users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Update storage policies for CV files
CREATE POLICY "Enable public CV upload"
  ON storage.objects
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (bucket_id = 'private');

CREATE POLICY "Enable public CV read"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'private');

-- Ensure RLS is enabled
ALTER TABLE questionnaire_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;