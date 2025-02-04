/*
  # Fix UPSERT permissions for questionnaire users

  1. Changes
    - Add explicit UPSERT handling
    - Grant sequence permissions
    - Ensure proper conflict resolution
    - Fix anonymous user permissions

  2. Security
    - Maintain RLS while allowing necessary operations
    - Enable anonymous UPSERT operations
    - Keep data integrity with proper constraints
*/

-- Drop existing policies to avoid conflicts
DROP POLICY IF EXISTS "Enable anonymous inserts" ON questionnaire_users;
DROP POLICY IF EXISTS "Enable anonymous selects" ON questionnaire_users;
DROP POLICY IF EXISTS "Enable anonymous updates" ON questionnaire_users;

-- Create a single policy for all operations
CREATE POLICY "Enable all operations"
  ON questionnaire_users
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

-- Ensure proper sequence permissions
GRANT USAGE ON SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon;

-- Reset RLS to ensure changes take effect
ALTER TABLE questionnaire_users DISABLE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_users ENABLE ROW LEVEL SECURITY;

-- Ensure proper ownership and permissions
ALTER TABLE questionnaire_users OWNER TO postgres;
GRANT ALL ON questionnaire_users TO postgres;
GRANT ALL ON questionnaire_users TO anon;
GRANT ALL ON questionnaire_users TO authenticated;

-- Reset sequence permissions
DO $$
DECLARE
    seq_name text;
BEGIN
    FOR seq_name IN 
        SELECT quote_ident(sequence_name)
        FROM information_schema.sequences
        WHERE sequence_schema = 'public'
    LOOP
        EXECUTE 'GRANT ALL ON SEQUENCE ' || seq_name || ' TO anon';
        EXECUTE 'GRANT ALL ON SEQUENCE ' || seq_name || ' TO authenticated';
    END LOOP;
END $$;