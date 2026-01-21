# To Do




- Force all users to use MFA
- ensure the invited_by column in the project_members table gets populated when adding someone to a project
- 'Teams' actually refers to field data collectors - change wording on the website - and maybe just set up one set of credentials per project - maybe a unique user for each interviewer/surveyor
- have to go to 'Add credential' in the 'Field teams' tab to add a field user - rethink this- can - upload a zip file works, but need to test creating a survey from scratch to see if it saves properly
- there is no way to change the password of a field user - need to delete and recreate
- round the corners of the question cards
- add a 'whitelist' of email addresses that can log in/create a user account on the website
- on the login page, add option of viewing the password
- when createing a form, don't allow 'keywords' - formerly automatic variables - starttime, etc.
- 'View history' not working properly - should only show changed records from current record - uuid == uuid
- On  the 'Field Teams' tab, when you click 'Revoke Access' for a user, it removes them immediately - need to have a confirmation dialog box


## To delete a user
### Option 1: Cascade Delete (Delete user and all their data)
This will delete the user **AND** all their projects, surveys, teams, etc., automatically.

```sql
-- Update the foreign key to CASCADE
ALTER TABLE projects 
DROP CONSTRAINT projects_created_by_fkey;

ALTER TABLE projects
ADD CONSTRAINT projects_created_by_fkey 
FOREIGN KEY (created_by) 
REFERENCES profiles(id) 
ON DELETE CASCADE;
```

*Then, when you delete a user from the profiles table, all their related projects are automatically removed.*

---

### Option 2: Reassign or Soft Delete (Recommended for Production)
This is a better approach for maintaining data integrity and audit trails.

#### **A. Soft Delete Approach**
Add a `deleted_at` column to track deletion without actually removing the data from the database.

```sql
-- Add a deleted_at column to both tables
ALTER TABLE auth.users ADD COLUMN deleted_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN deleted_at TIMESTAMPTZ;

-- "Delete" users by setting the timestamp
UPDATE profiles SET deleted_at = NOW() WHERE id = 'user-id';
UPDATE auth.users SET deleted_at = NOW() WHERE id = 'user-id';
```

> **Note:** You must update your **RLS (Row Level Security)** policies to exclude deleted users (e.g., add `WHERE deleted_at IS NULL` to your queries).

#### **B. Reassign Projects**
Transfer ownership of projects to another admin before deleting the user.

```sql
-- Before deleting user, reassign their projects to another admin
UPDATE projects 
SET created_by = 'new-owner-id' 
WHERE created_by = 'user-to-delete-id';

-- Then you can safely delete the user
DELETE FROM auth.users WHERE id = 'user-to-delete-id';
```

---

### Immediate Solution (Manual Cleanup)
Since you only have a few test users right now and want to clean up manually, follow these steps:

1. **Delete all projects for a specific user:**
   ```sql
   DELETE FROM projects WHERE created_by = 'fd93198d-08ee-45e4-a3f7-bc4d1131894e';
   ```

2. **Then delete the user:**
   ```sql
   DELETE FROM auth.users WHERE email = 'glavoy@pm.me';
   ```