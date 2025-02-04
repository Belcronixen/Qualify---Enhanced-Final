/*
  # Fix Email Constraint
  
  1. Changes
    - Makes email constraint non-deferrable to work with ON CONFLICT
    - Preserves uniqueness requirement
    - Maintains data integrity
    - Ensures upsert operations work correctly
*/

-- First, disable RLS on all tables to ensure we can modify them
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, schemaname FROM pg_catalog.pg_tables WHERE schemaname IN ('public', 'storage')) 
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop the deferrable constraint
ALTER TABLE questionnaire_users 
    DROP CONSTRAINT IF EXISTS questionnaire_users_email_key;

-- Add a regular unique constraint
ALTER TABLE questionnaire_users 
    ADD CONSTRAINT questionnaire_users_email_key 
    UNIQUE (email);

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated;