-- ============================================================================
-- HELPER SCRIPT: Create Test Survey Package
-- Usage: Copy this and run it in the Supabase Dashboard -> SQL Editor
-- ============================================================================

-- Replace 'YOUR-PROJECT-CODE' with your actual Project Code (e.g., 'r21-study')

WITH target_project AS (
    SELECT id FROM public.projects 
    WHERE slug = 'r21-neg'  -- <--- Updated to your project code
    LIMIT 1
)
INSERT INTO public.survey_packages (
    project_id,
    name,
    display_name,
    version_date,
    description,
    zip_file_path,  -- IMPORTANT: This file must exist in your Storage Bucket 'surveys'
    status,
    manifest
)
SELECT 
    id,
    'test_survey_pkg_1',
    'Test Survey Package 1',
    NOW(),
    'A dummy package for testing mobile download',
    'surveys/test_survey.zip',  -- Path detected from your URL
    'active',            -- Status MUST be 'active' to be visible to the app
    '{"debug": true}'::jsonb
FROM target_project
ON CONFLICT (project_id, name)
DO UPDATE SET
    zip_file_path = EXCLUDED.zip_file_path,
    display_name = EXCLUDED.display_name,
    version_date = EXCLUDED.version_date,
    updated_at = NOW();

-- Verify
SELECT name, status, zip_file_path FROM public.survey_packages;
