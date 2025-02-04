/*
  # Complete removal of ALL security restrictions (Fixed)
  
  1. Changes
    - Use correct schema references
    - Drop ALL policies
    - Disable RLS on ALL tables
    - Remove ALL triggers
    - Grant ALL permissions
    
  2. Security
    - WARNING: Removes ALL security
    - Makes everything publicly accessible
    - Grants maximum permissions
*/

-- First, disable RLS on all tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename, schemaname FROM pg_catalog.pg_tables WHERE schemaname IN ('public', 'storage')) 
    LOOP
        EXECUTE format('ALTER TABLE %I.%I DISABLE ROW LEVEL SECURITY', r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop ALL policies from ALL tables
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename, policyname 
        FROM pg_catalog.pg_policies 
        WHERE schemaname IN ('public', 'storage')
    ) 
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', 
            r.policyname, r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Drop ALL triggers
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT 
            t.tgname AS trigger_name,
            c.relname AS table_name,
            n.nspname AS schema_name
        FROM pg_catalog.pg_trigger t
        JOIN pg_catalog.pg_class c ON t.tgrelid = c.oid
        JOIN pg_catalog.pg_namespace n ON c.relnamespace = n.oid
        WHERE n.nspname IN ('public', 'storage')
    )
    LOOP
        EXECUTE format('DROP TRIGGER IF EXISTS %I ON %I.%I CASCADE', 
            r.trigger_name, r.schema_name, r.table_name);
    END LOOP;
END $$;

-- Grant ALL permissions on ALL objects
DO $$
BEGIN
    -- Grant schema usage
    EXECUTE 'GRANT USAGE ON SCHEMA public TO anon, authenticated';
    EXECUTE 'GRANT USAGE ON SCHEMA storage TO anon, authenticated';
    
    -- Grant table permissions
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO anon, authenticated';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA storage TO anon, authenticated';
    
    -- Grant sequence permissions
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA storage TO anon, authenticated';
    
    -- Grant function permissions
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA public TO anon, authenticated';
    EXECUTE 'GRANT ALL PRIVILEGES ON ALL ROUTINES IN SCHEMA storage TO anon, authenticated';
END $$;

-- Reset ownership of all tables to postgres
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (
        SELECT schemaname, tablename 
        FROM pg_catalog.pg_tables 
        WHERE schemaname IN ('public', 'storage')
    )
    LOOP
        EXECUTE format('ALTER TABLE %I.%I OWNER TO postgres', r.schemaname, r.tablename);
    END LOOP;
END $$;

-- Make email constraint deferrable and non-restrictive
ALTER TABLE questionnaire_users 
    DROP CONSTRAINT IF EXISTS questionnaire_users_email_key CASCADE;
    
ALTER TABLE questionnaire_users 
    ADD CONSTRAINT questionnaire_users_email_key 
    UNIQUE (email) 
    DEFERRABLE INITIALLY DEFERRED;

-- Ensure tables are accessible
ALTER TABLE questionnaire_users FORCE ROW LEVEL SECURITY;
ALTER TABLE questionnaire_users DISABLE ROW LEVEL SECURITY;

-- Final permission grants
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO postgres, anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA storage TO postgres, anon, authenticated;