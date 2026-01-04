# Product Requirement Document: DataKollecta Platform

## 1. System Overview
**DataKollecta** is a comprehensive data collection and management platform designed for research projects, field surveys, and clinical trials. The system consists of two main components:
1.  **Central Web Portal:** A management dashboard for administrators to design surveys, manage teams, and view collected data.
2.  **Data Collection Interface (API/Mobile Support):** A mechanism for field workers to download surveys, collect data (often offline), and synchronize it back to the central server.

The goal is to build a robust, scalable system that handles complex data structures (Case Report Forms - CRFs), manages diverse field teams, and ensures data integrity across offline and online environments.

---

## 2. User Roles & Personas

The system must support two distinct types of authentication and user interaction:

### A. Web Portal Users (Administrative)
These are individual users who access the web dashboard to manage projects.
*   **Owner:** Creator of a project. Has full access, including deletion.
*   **Admin:** Can manage team members, credentials, and project settings.
*   **Editor:** Can upload and publish survey designs and view data.
*   **Data Analyst:** Read-only access to view and export data/reports.
*   **Viewer:** Basic read-only access.

### B. Field Workers (Data Collectors)
These users do *not* access the web portal. They use a separate mobile or desktop client to collect data.
*   **Authentication:** They log in using a simplified "Project Code" + "Username" + "Password" combination.
*   **Workflow:** They download assigned surveys, collect data offline, and sync when online.
*   **Identity:** Often share credentials (e.g., "Team A", "Nurse 1") rather than personal email accounts.

---

## 3. Core Functional Modules

### 3.1 Authentication & Multi-Tenancy
*   **Web Auth:** Secure email/password registration and login for portal users.
*   **Organization/Project Scoping:** Users can belong to multiple projects. All data (surveys, members, submissions) must be strictly isolated by Project ID.
*   **App Auth API:** A dedicated API endpoint to authenticate field workers using a Project Slug (unique code), Username, and Password.

### 3.2 Project Workspace
*   **Dashboard:** A high-level view of project activity (recent submissions, active field teams).
*   **Settings:** Manage project metadata (Name, Description, Unique "Slug" for app login).

### 3.3 Survey Configuration Engine
The system must support a "Configuration-Driven" survey design, likely ingesting definitions from Excel or standard XML formats (e.g., ODK XForms).
*   **Survey Packages:** A container for a set of forms (CRFs).
    *   *Inputs:* Excel definition files or XML.
    *   *Outputs:* A versioned "Package" (often a ZIP file) containing the machine-readable definitions for the mobile app.
*   **Versioning:** Surveys must be versioned. Changing a survey should not break existing data.
*   **Lifecycle:** Draft -> Processing -> Ready (Published) -> Archived.
*   **CRF Definition:** The system should parse uploaded definitions to understand the schema of the data to be collected (field names, types, validation rules) and store this metadata.

### 3.4 Field Team Management
*   **App Credentials:** A dedicated management screen to create/revoke usernames and passwords for field workers.
*   **Session Tracking:** (Optional) Ability to monitor active field devices or sync sessions.

### 3.5 Data Aggregation & Submission Handling
*   **Submission API:** An endpoint to receive JSON-based data payloads from field apps.
*   **Data Storage:** Data should be stored in a flexible format (e.g., JSONB) to accommodate varying survey structures without requiring database schema changes for every new question.
*   **Deduplication:** The system must handle duplicate uploads (idempotency) based on unique record IDs generated in the field.
*   **Audit Trail:** Track version history of submissions (e.g., if a record is edited in the field and re-synced).

### 3.6 Data Visualization & Export
*   **Data Grid:** A tabular view to browse submissions, filterable by Survey/Form type.
*   **Export:** Ability to export data to standard formats (CSV, Excel, JSON) for external analysis.

---

## 4. Data Domain Model (Database Design)

The database should be relational but leverage JSON capabilities for flexibility.

### Core Entities

1.  **Profiles (Users):**
    *   `id` (PK), `email`, `full_name`.
2.  **Projects:**
    *   `id` (PK), `name`, `slug` (Unique, used for App Login), `created_by`.
3.  **ProjectMembers:**
    *   Link table between `Profiles` and `Projects` with a `role` (Owner, Admin, Editor, etc.).
4.  **AppCredentials:**
    *   `id` (PK), `project_id` (FK), `username`, `password_hash`.
    *   *Note:* These are separate from "Profiles".
5.  **SurveyPackages:**
    *   `id` (PK), `project_id` (FK), `name`, `version`, `status` (Draft, Ready).
    *   `storage_path`: Reference to the physical file (ZIP/XML) stored in file storage.
    *   `manifest`: JSON blob describing the forms inside this package.
6.  **CRFs (Case Report Forms):**
    *   `id` (PK), `survey_package_id` (FK), `table_name`, `display_name`.
    *   Stores metadata about specific forms within a package.
7.  **Submissions:**
    *   `id` (PK), `project_id` (FK), `survey_package_id` (FK).
    *   `table_name`: Which form does this data belong to?
    *   `data`: **JSON/JSONB** column containing the actual answers.
    *   `local_unique_id`: The ID generated by the mobile app (for deduplication).
    *   `surveyor_id`: Which AppCredential uploaded this?
    *   `created_at`, `updated_at`.

### Storage Requirements
*   A file storage solution (Blob Storage) is required to hold:
    *   Raw Excel/CSV upload files.
    *   Generated Survey Packages (ZIPs) for mobile download.

---

## 5. API Requirements (Client-Server Contract)

The system needs to expose specific endpoints for the data collection client:

1.  **`POST /api/app-login`:**
    *   Input: `project_code`, `username`, `password`.
    *   Output: Auth Token, Project Details, List of Available Surveys (with download URLs).
2.  **`POST /api/app-sync`:**
    *   Input: Batch of submission records (JSON).
    *   Logic: Upsert (Insert or Update) records based on `local_unique_id`.
    *   Output: List of successfully synced IDs and any errors.
3.  **`GET /api/surveys/:id/download`:**
    *   Secure endpoint to download the survey configuration package (ZIP).

---

## 6. Non-Functional Requirements

1.  **Offline-First Architecture:** The backend must assume that data is collected offline and may arrive in batches days later. Timestamps should reflect "Collection Time" vs "Submission Time".
2.  **Scalability:** The `Submissions` table will grow rapidly. Indexing on `project_id` and `data` (JSON keys) is critical.
3.  **Security:**
    *   Row Level Security (RLS) is highly recommended.
    *   Web users must only see projects they are members of.
    *   App users (AppCredentials) must only be able to sync data to their specific Project.
