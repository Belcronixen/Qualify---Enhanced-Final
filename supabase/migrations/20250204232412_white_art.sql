/*
  # Disable all security policies and RLS

  1. Changes
    - Disable RLS on all tables
    - Drop all existing policies
    - Reset permissions to allow all operations
    - Remove all security restrictions

  2. Security
    - WARNING: This removes ALL security restrictions
    - Tables will be publicly accessible
    - No row-level security
*/

-- Disable RLS on all tables
ALTER TABLE questionnaire_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_responses DISABLE ROW LEVEL SECURITY;
ALTER TABLE questions DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Drop all policies from all tables
DROP POLICY IF EXISTS "Enable all inserts" ON questionnaire_users;
DROP POLICY IF EXISTS "Enable email-based updates" ON questionnaire_users;
DROP POLICY IF EXISTS "Allow anonymous response creation" ON user_responses;
DROP POLICY IF EXISTS "Allow public response viewing" ON user_responses;
DROP POLICY IF EXISTS "Allow response updates" ON user_responses;
DROP POLICY IF EXISTS "Questions are publicly readable" ON questions;
DROP POLICY IF EXISTS "Admins have full access to questions" ON questions;
DROP POLICY IF EXISTS "Categories are publicly readable" ON categories;
DROP POLICY IF EXISTS "Admins have full access to categories" ON categories;
DROP POLICY IF EXISTS "Enable public CV upload" ON storage.objects;
DROP POLICY IF EXISTS "Enable public CV read" ON storage.objects;

-- Grant full permissions to all roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO authenticated;

-- Grant storage permissions
GRANT ALL ON ALL TABLES IN SCHEMA storage TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO authenticated;

-- Reset ownership to postgres
ALTER TABLE questionnaire_users OWNER TO postgres;
ALTER TABLE user_responses OWNER TO postgres;
ALTER TABLE questions OWNER TO postgres;
ALTER TABLE categories OWNER TO postgres;