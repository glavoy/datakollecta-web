-- ============================================================================
-- HELPER SCRIPT: RPC to create App Credential (Surveyor)
-- Usage: Run this in Supabase SQL Editor once. Then call via supabase.rpc()
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE OR REPLACE FUNCTION public.create_app_credential(
    p_project_id UUID,
    p_username TEXT,
    p_password TEXT,
    p_description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER -- Runs with elevated privileges (needed to hash password)
SET search_path = public
AS $$
DECLARE
    v_credential_id UUID;
    v_result JSONB;
BEGIN
    -- Check uniqueness manually (optional, but good for error message)
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
        crypt(p_password, gen_salt('bf')), -- Hash the password
        p_description,
        true
    )
    RETURNING id INTO v_credential_id;

    -- Return the created record (excluding hash)
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
    -- Propagate error
    RAISE;
END;
$$;
