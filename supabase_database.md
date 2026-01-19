# System Architecture & Database Schema

## Table Descriptions

Here is the breakdown of what each table does in your system:

### 1. Hierarchy & Access

* **profiles**: Website Users. This is YOU (and your colleagues). It stores your name/email extensions.
* **projects**: The main folder. Everything belongs to a project.
* **project_members**: The Access List. It links a Profile to a Project. If you aren't in this table for Project X, you can't see Project X.

### 2. The Survey Definitions
* **survey_packages**: The Zip File/Bundle. When you upload a survey design, it creates a row here. It represents "Version 1 of the Malaria Survey".
* **crfs**: The Forms. If your survey package has 3 parts (Household, Person, Blood Sample), you will have 3 rows here describing the structure of each form.

### 3. The Field App (Data Collectors)
* **app_credentials**: Field Worker Accounts. These are the simple login codes (e.g., surveyor1) that data collectors type into the Android app. They are distinct from website users.
* **app_sessions**: Active Devices. When a phone logs in, it creates a session here.

### 4. The Data
* **submissions**: The Answers. Every time a form is completed and synced, it lands here. The actual data (answers) is stored in a JSON column.
* **submission_history**: The Audit Trail. If you edit a submission on the website, the old version is saved here so you never lose data.

---


### General flow
- create new login
- create a new project
    - after creating a new project, there are records in two tables: `projects`, `project_members`
- in the new project - upload a 'survey' zip file
    - this creates records in the tables: `survey_packages`, `crfs`
- create a 'team member' - under add credentials ion teh team member tab - this creats a record in the table: `app_credentials`
- team member enters credentials on the phone and checks for surveys - writes record to the `app_sessions` table
- fgg



## Technical Schema

### 1. Database Column Schema

**Query:**
```sql
SELECT table_name, ordinal_position, column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public'
ORDER BY table_name, ordinal_position;
```

| table_name      | ordinal_position | column_name          | data_type                |
| --------------- | ---------------- | -------------------- | ------------------------ |
| app_credentials | 1                | id                   | uuid                     |
| app_credentials | 2                | project_id           | uuid                     |
| app_credentials | 3                | username             | text                     |
| app_credentials | 4                | password_hash        | text                     |
| app_credentials | 5                | description          | text                     |
| app_credentials | 6                | is_active            | boolean                  |
| app_credentials | 7                | created_by           | uuid                     |
| app_credentials | 8                | created_at           | timestamp with time zone |
| app_credentials | 9                | last_used_at         | timestamp with time zone |
| app_sessions    | 1                | id                   | uuid                     |
| app_sessions    | 2                | credential_id        | uuid                     |
| app_sessions    | 3                | project_id           | uuid                     |
| app_sessions    | 4                | token                | text                     |
| app_sessions    | 5                | device_id            | text                     |
| app_sessions    | 6                | device_info          | jsonb                    |
| app_sessions    | 7                | created_at           | timestamp with time zone |
| app_sessions    | 8                | expires_at           | timestamp with time zone |
| app_sessions    | 9                | last_activity_at     | timestamp with time zone |
| crfs            | 1                | id                   | uuid                     |
| crfs            | 2                | survey_package_id    | uuid                     |
| crfs            | 3                | project_id           | uuid                     |
| crfs            | 4                | table_name           | text                     |
| crfs            | 5                | display_name         | text                     |
| crfs            | 6                | display_order        | integer                  |
| crfs            | 7                | is_base              | boolean                  |
| crfs            | 8                | primary_key          | text                     |
| crfs            | 9                | linking_field        | text                     |
| crfs            | 10               | parent_table         | text                     |
| crfs            | 11               | fields               | jsonb                    |
| crfs            | 12               | id_config            | jsonb                    |
| crfs            | 13               | display_fields       | text                     |
| crfs            | 14               | auto_start_repeat    | boolean                  |
| crfs            | 15               | repeat_enforce_count | integer                  |
| crfs            | 16               | created_at           | timestamp with time zone |
| formchanges     | 1                | id                   | uuid                     |
| formchanges     | 2                | formchanges_uuid     | text                     |
| formchanges     | 3                | project_id           | uuid                     |
| formchanges     | 4                | record_uuid          | text                     |
| formchanges     | 5                | tablename            | text                     |
| formchanges     | 6                | fieldname            | text                     |
| formchanges     | 7                | oldvalue             | text                     |
| formchanges     | 8                | newvalue             | text                     |
| formchanges     | 9                | surveyor_id          | text                     |
| formchanges     | 10               | changed_at           | timestamp with time zone |
| formchanges     | 11               | synced_at            | timestamp with time zone |
| profiles        | 1                | id                   | uuid                     |
| profiles        | 2                | email                | text                     |
| profiles        | 3                | full_name            | text                     |
| profiles        | 5                | role                 | text                     |
| profiles        | 6                | created_at           | timestamp with time zone |
| profiles        | 7                | updated_at           | timestamp with time zone |
| project_members | 1                | id                   | uuid                     |
| project_members | 2                | project_id           | uuid                     |
| project_members | 3                | user_id              | uuid                     |
| project_members | 4                | role                 | USER-DEFINED             |
| project_members | 5                | invited_by           | uuid                     |
| project_members | 6                | invited_at           | timestamp with time zone |
| project_members | 7                | accepted_at          | timestamp with time zone |
| projects        | 1                | id                   | uuid                     |
| projects        | 2                | name                 | text                     |
| projects        | 3                | description          | text                     |
| projects        | 4                | slug                 | text                     |
| projects        | 5                | status               | text                     |
| projects        | 6                | created_by           | uuid                     |
| projects        | 7                | created_at           | timestamp with time zone |
| projects        | 8                | updated_at           | timestamp with time zone |
| projects        | 9                | is_active            | boolean                  |
| submissions     | 1                | id                   | uuid                     |
| submissions     | 2                | project_id           | uuid                     |
| submissions     | 3                | survey_package_id    | uuid                     |
| submissions     | 4                | crf_id               | uuid                     |
| submissions     | 5                | table_name           | text                     |
| submissions     | 6                | record_id            | text                     |
| submissions     | 7                | local_unique_id      | text                     |
| submissions     | 8                | data                 | jsonb                    |
| submissions     | 9                | version              | integer                  |
| submissions     | 10               | parent_table         | text                     |
| submissions     | 11               | parent_record_id     | text                     |
| submissions     | 12               | device_id            | text                     |
| submissions     | 13               | surveyor_id          | text                     |
| submissions     | 14               | app_version          | text                     |
| submissions     | 15               | collected_at         | timestamp with time zone |
| submissions     | 16               | submitted_at         | timestamp with time zone |
| submissions     | 17               | updated_at           | timestamp with time zone |
| survey_packages | 1                | id                   | uuid                     |
| survey_packages | 2                | project_id           | uuid                     |
| survey_packages | 3                | name                 | text                     |
| survey_packages | 4                | display_name         | text                     |
| survey_packages | 5                | version_date         | date                     |
| survey_packages | 6                | description          | text                     |
| survey_packages | 7                | zip_file_path        | text                     |
| survey_packages | 8                | manifest             | jsonb                    |
| survey_packages | 9                | status               | USER-DEFINED             |
| survey_packages | 10               | created_by           | uuid                     |
| survey_packages | 11               | created_at           | timestamp with time zone |
| survey_packages | 12               | updated_at           | timestamp with time zone |
| survey_packages | 13               | published_at         | timestamp with time zone |

---

### 2. Foreign Key Constraints

**Query:**
```sql
  kcu.table_schema || '.' || kcu.table_name AS foreign_table,
  kcu.column_name AS fk_column,
  '->' AS rel,
  ccu.table_schema || '.' || ccu.table_name AS primary_table,
  ccu.column_name AS pk_column
FROM information_schema.key_column_usage kcu
JOIN information_schema.constraint_column_usage ccu
  ON kcu.constraint_name = ccu.constraint_name
  AND kcu.constraint_schema = ccu.constraint_schema
WHERE kcu.constraint_schema = 'public'
  AND kcu.ordinal_position IS NOT NULL
ORDER BY foreign_table, kcu.ordinal_position;
```

| foreign_table          | fk_column         | rel | primary_table          | pk_column         |
| ---------------------- | ----------------- | --- | ---------------------- | ----------------- |
| public.app_credentials | project_id        | ->  | public.app_credentials | project_id        |
| public.app_credentials | created_by        | ->  | public.profiles        | id                |
| public.app_credentials | project_id        | ->  | public.projects        | id                |
| public.app_credentials | project_id        | ->  | public.app_credentials | username          |
| public.app_credentials | id                | ->  | public.app_credentials | id                |
| public.app_credentials | username          | ->  | public.app_credentials | username          |
| public.app_credentials | username          | ->  | public.app_credentials | project_id        |
| public.app_sessions    | project_id        | ->  | public.projects        | id                |
| public.app_sessions    | credential_id     | ->  | public.app_credentials | id                |
| public.app_sessions    | token             | ->  | public.app_sessions    | token             |
| public.app_sessions    | id                | ->  | public.app_sessions    | id                |
| public.crfs            | survey_package_id | ->  | public.crfs            | survey_package_id |
| public.crfs            | project_id        | ->  | public.projects        | id                |
| public.crfs            | survey_package_id | ->  | public.survey_packages | id                |
| public.crfs            | survey_package_id | ->  | public.crfs            | table_name        |
| public.crfs            | id                | ->  | public.crfs            | id                |
| public.crfs            | table_name        | ->  | public.crfs            | table_name        |
| public.crfs            | table_name        | ->  | public.crfs            | survey_package_id |
| public.formchanges     | project_id        | ->  | public.projects        | id                |
| public.formchanges     | id                | ->  | public.formchanges     | id                |
| public.formchanges     | formchanges_uuid  | ->  | public.formchanges     | formchanges_uuid  |
| public.formchanges     | project_id        | ->  | public.projects        | id                |
| public.profiles        | id                | ->  | public.profiles        | id                |
| public.project_members | id                | ->  | public.project_members | id                |
| public.project_members | project_id        | ->  | public.project_members | project_id        |
| public.project_members | project_id        | ->  | public.project_members | user_id           |
| public.project_members | invited_by        | ->  | public.profiles        | id                |
| public.project_members | project_id        | ->  | public.projects        | id                |
| public.project_members | user_id           | ->  | public.profiles        | id                |
| public.project_members | user_id           | ->  | public.project_members | project_id        |
| public.project_members | user_id           | ->  | public.project_members | user_id           |
| public.projects        | created_by        | ->  | public.projects        | created_by        |
| public.projects        | created_by        | ->  | public.profiles        | id                |
| public.projects        | id                | ->  | public.projects        | id                |
| public.projects        | created_by        | ->  | public.projects        | slug              |
| public.projects        | slug              | ->  | public.projects        | slug              |
| public.projects        | slug              | ->  | public.projects        | created_by        |
| public.submissions     | project_id        | ->  | public.projects        | id                |
| public.submissions     | id                | ->  | public.submissions     | id                |
| public.submissions     | crf_id            | ->  | public.crfs            | id                |
| public.submissions     | survey_package_id | ->  | public.survey_packages | id                |
| public.survey_packages | created_by        | ->  | public.profiles        | id                |
| public.survey_packages | project_id        | ->  | public.survey_packages | project_id        |
| public.survey_packages | project_id        | ->  | public.survey_packages | name              |
| public.survey_packages | id                | ->  | public.survey_packages | id                |
| public.survey_packages | project_id        | ->  | public.projects        | id                |
| public.survey_packages | name              | ->  | public.survey_packages | project_id        |
| public.survey_packages | name              | ->  | public.survey_packages | name              |
---

### 3. Row Level Security (RLS) Policies

**Query:**
```sql
SELECT tablename, policyname, roles, cmd, qual, with_check FROM pg_policies WHERE schemaname = 'public';
```

| tablename | policyname | roles | cmd | qual | with_check |
| :--- | :--- | :--- | :--- | :--- | :--- |
| app_credentials | Owners can view credentials | {authenticated} | SELECT | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = 'owner'::project_role)))) | null |
| profiles | Users can view own profile | {public} | SELECT | (auth.uid() = id) | null |
| profiles | Users can update own profile | {public} | UPDATE | (auth.uid() = id) | null |
| projects | Owners can update projects | {authenticated} | UPDATE | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.id) AND (pm.user_id = auth.uid()) AND (pm.role = 'owner'::project_role)))) | null |
| projects | Owners can delete projects | {authenticated} | DELETE | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.id) AND (pm.user_id = auth.uid()) AND (pm.role = 'owner'::project_role)))) | null |
| project_members | Users can view own memberships | {authenticated} | SELECT | (user_id = auth.uid()) | null |
| project_members | Allow member creation | {authenticated} | INSERT | null | (((user_id = auth.uid()) AND (role = 'owner'::project_role)) OR (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = project_members.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = 'owner'::project_role))))) |
| project_members | Owners can update memberships | {authenticated} | UPDATE | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = project_members.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = 'owner'::project_role)))) | null |
| project_members | Owners can delete memberships | {authenticated} | DELETE | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = project_members.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = 'owner'::project_role)))) | null |
| survey_packages | Users can view project surveys | {authenticated} | SELECT | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid())))) | null |
| survey_packages | Editors can manage surveys | {authenticated} | ALL | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = ANY (ARRAY['editor'::project_role, 'owner'::project_role]))))) | null |
| crfs | Users can view project crfs | {authenticated} | SELECT | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid())))) | null |
| crfs | Editors can manage crfs | {authenticated} | ALL | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = ANY (ARRAY['editor'::project_role, 'owner'::project_role]))))) | null |
| submissions | Users can view project submissions | {authenticated} | SELECT | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid())))) | null |
| submissions | Editors can manage submissions | {authenticated} | ALL | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = ANY (ARRAY['editor'::project_role, 'owner'::project_role]))))) | null |
| submission_history | Users can view submission history | {authenticated} | SELECT | (EXISTS (SELECT 1 FROM (submissions s JOIN project_members pm ON ((pm.project_id = s.project_id))) WHERE ((s.id = submission_history.submission_id) AND (pm.user_id = auth.uid())))) | null |
| app_credentials | Owners can manage credentials | {authenticated} | ALL | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = 'owner'::project_role)))) | null |
| app_sessions | Owners can view sessions | {authenticated} | SELECT | (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = pm.project_id) AND (pm.user_id = auth.uid()) AND (pm.role = 'owner'::project_role)))) | null |
| projects | Enable insert for authenticated users only | {public} | INSERT | null | ((SELECT auth.role() AS role) = 'authenticated'::text) |
| projects | Users can view member projects | {public} | SELECT | ((auth.uid() = created_by) OR (EXISTS (SELECT 1 FROM project_members pm WHERE ((pm.project_id = projects.id) AND (pm.user_id = auth.uid()))))) | null |

