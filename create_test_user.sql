-- ============================================================================
-- HELPER SCRIPT: Create Test Mobile User
-- Usage: Copy this and run it in the Supabase Dashboard -> SQL Editor
-- ============================================================================

-- 1. Enable pgcrypto extension for password hashing (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. INSERT TEST USER
-- Replace 'YOUR-PROJECT-CODE' with your actual Project Code (e.g., 'r21-study')
-- Replace 'testuser' and 'password123' if you wish.

WITH target_project AS (
    SELECT id FROM public.projects 
    WHERE slug = 'r21-neg'  -- <--- ENTER YOUR PROJECT CODE HERE
    LIMIT 1
)
INSERT INTO public.app_credentials (
    project_id,
    username,
    password_hash,
    description,
    is_active
)
SELECT 
    id,
    'testuser',                        -- <--- USERNAME
    crypt('password123', gen_salt('bf')), -- <--- PASSWORD
    'Test Surveyor created via SQL',
    true
FROM target_project
ON CONFLICT (project_id, username) 
DO UPDATE SET 
    password_hash = EXCLUDED.password_hash;

-- 3. VERIFY
SELECT username, project_id, is_active FROM public.app_credentials WHERE username = 'testuser';
