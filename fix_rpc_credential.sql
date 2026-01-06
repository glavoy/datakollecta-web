-- ============================================================================
-- FIX DB SCRIPT: Update create_app_credential to find pgcrypto functions
-- Usage: Run this in Supabase SQL Editor
-- ============================================================================

-- 1. Ensure extensions schema exists and pgcrypto is available
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS pgcrypto SCHEMA extensions;

-- 2. Update the function with corrected search_path
CREATE OR REPLACE FUNCTION public.create_app_credential(
    p_project_id UUID,
    p_username TEXT,
    p_password TEXT,
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
-- IMPORTANT: Include 'extensions' in search_path so gen_salt() is found
SET search_path = public, extensions
AS $$
DECLARE
    v_credential_id UUID;
    v_result JSONB;
BEGIN
    -- Check uniqueness
    IF EXISTS (SELECT 1 FROM public.app_credentials WHERE project_id = p_project_id AND username = p_username) THEN
        RAISE EXCEPTION 'Username already exists for this project';
    END IF;

    -- Insert new credential
    INSERT INTO public.app_credentials (
        project_id,
        username,
        password_hash,
        description,
        is_active
    )
    VALUES (
        p_project_id,
        p_username,
        crypt(p_password, gen_salt('bf')), -- Now gen_salt should be found
        p_description,
        true
    )
    RETURNING id INTO v_credential_id;

    -- Return the created record
    SELECT jsonb_build_object(
        'id', id,
        'username', username,
        'description', description,
        'is_active', is_active,
        'created_at', created_at
    )
    INTO v_result
    FROM public.app_credentials
    WHERE id = v_credential_id;

    RETURN v_result;

EXCEPTION WHEN OTHERS THEN
    RAISE;
END;
$$;
