# DataKollecta Web - Implementation Plan

## Executive Summary

This document outlines the comprehensive plan to complete the DataKollecta web platform - a data management system for creating surveys, managing field data collection teams, and viewing/exporting collected data from an associated mobile app.

---

## Current State Analysis

### What's Working
- **Authentication**: User signup/login with Supabase Auth
- **Project Creation**: Users can create projects with unique slugs (project codes)
- **Survey Upload**: ZIP file upload with manifest parsing works
- **Survey Designer**: Basic functionality for creating surveys with questions
- **Field Credentials**: Creating app_credentials for field workers
- **Mobile Integration**: Mobile app can download surveys and upload submissions
- **Basic Data View**: Listing submissions with search/filter

### What Needs Work
- **Navigation/UX**: Disjointed experience, too many clicks, redundant pages
- **Data Viewing**: Cannot view actual data (only submission metadata)
- **Project Members**: No UI for adding/managing project members (owners, editors, viewers)
- **Field Teams**: Better integration within project context
- **Settings Page**: Mostly placeholder content
- **Statistics/Dashboard**: No data visualization or statistics
- **Role-Based Access**: RLS exists but UI doesn't enforce/display roles properly

---

## Terminology Decision

Based on your requirements, here's the recommended terminology:

| Concept | Recommended Term | Notes |
|---------|------------------|-------|
| Survey ZIP Package | **Survey** | The overall study design |
| Individual XML forms | **Form** | Generic term that works for questionnaires, CRFs, etc. |
| Alternative display | **CRF** or **Questionnaire** | Context-dependent label in UI |
| Data records | **Submissions** or **Records** | Keep "Submissions" for sync context, "Records" for data view |
| Website users | **Project Members** | Users who access the web platform |
| Mobile app users | **Field Team** | Data collectors using the mobile app |

---

## Phase 1: Navigation & Information Architecture Redesign

### 1.1 New Sidebar Navigation

Replace the current 4-tab sidebar with a cleaner structure:

```
SIDEBAR:
- Projects (main entry point)
- Data (replaces "Submissions")
- My Account (replaces "Settings")
- [User email]
- Sign Out
```

**Remove**: "Field Teams" as a top-level item (move into project context)

### 1.2 Project-Centric Navigation

When a user clicks on a project, the project detail page becomes the hub for all project-related activities:

```
PROJECT DETAIL PAGE:
├── Overview (stats, quick actions)
├── Surveys (list, create, edit, upload)
├── Data (view/export data for this project)
├── Project Members (owners, editors, viewers)
├── Field Team (app credentials)
└── Settings (project-specific settings)
```

### 1.3 Routes Restructure

```
/app/projects                         - List all projects
/app/projects/:slug                   - Project overview (dashboard)
/app/projects/:slug/surveys           - Survey list
/app/projects/:slug/surveys/new       - Create survey (designer)
/app/projects/:slug/surveys/:id       - Edit survey (designer)
/app/projects/:slug/surveys/:id/data  - View data for specific survey
/app/projects/:slug/data              - View all project data
/app/projects/:slug/members           - Project members management
/app/projects/:slug/team              - Field team credentials
/app/projects/:slug/settings          - Project settings

/app/data                             - Cross-project data view (optional)
/app/account                          - User account settings
```

---

## Phase 2: Project Detail Page Redesign

### 2.1 Overview Tab (Default Landing)

**Stats Dashboard:**
- Total surveys count
- Total records collected
- Records by form type (pie chart)
- Collection activity over time (line chart)
- Active field team members
- Last sync timestamp

**Quick Actions:**
- Create New Survey
- Upload Survey ZIP
- View Recent Data
- Add Team Member

### 2.2 Surveys Tab

**Features:**
- List all surveys with:
  - Survey name (display_name)
  - Version date
  - Status (draft/active/archived)
  - Forms count
  - Records count
- Actions per survey:
  - Edit (opens designer)
  - Download ZIP
  - View Data
  - Publish/Archive
  - Delete (with confirmation)
- Expandable row to show forms within each survey

### 2.3 Data Tab (NEW - Critical)

This is currently broken. Implement proper data viewing:

**Data View Features:**
1. **Form Selector**: Dropdown to select which form to view
2. **Data Table**: Display actual field data (not just metadata)
   - Column headers = field names from the form
   - Rows = individual records
   - Sortable, filterable columns
3. **Record Detail View**: Click a row to see full record with all fields
4. **Export Options**:
   - Export single form to CSV
   - Export single form to Excel
   - Export all forms (ZIP with multiple CSVs)
5. **Data Editing**: (Future) Allow editing records with audit trail
6. **Filters**:
   - Date range
   - Surveyor
   - Form type
   - Custom field filters

### 2.4 Project Members Tab (NEW)

**Features:**
- List current members with roles
- Invite new members by email
- Change member roles
- Remove members
- Role explanations:
  - **Owner**: Full access, can delete project, manage all members
  - **Editor**: Can create/edit surveys, manage field team, view data
  - **Viewer**: Read-only access to data

**Implementation:**
```typescript
// Add to project_members table operations
- inviteProjectMember(projectId, email, role)
- updateMemberRole(memberId, newRole)
- removeMember(memberId)
```

### 2.5 Field Team Tab

Move field team management INTO the project context:

**Features:**
- List credentials for THIS project only
- Add new credential
- Edit credential (change password, description)
- Deactivate/Reactivate
- Show last used, device info
- Show active sessions

### 2.6 Project Settings Tab

**Features:**
- Edit project name, description
- Change project status (active/inactive)
- Transfer ownership
- Delete project (with safeguards)
- Export all project data

---

## Phase 3: Data Viewing System

### 3.1 Architecture

The submissions table stores data as JSONB. To display it properly:

1. **Fetch form definition** from `crfs.fields` to get column headers
2. **Fetch submissions** filtered by project_id and table_name
3. **Render dynamic table** with columns based on form fields
4. **Handle nested data** (parent-child relationships)

### 3.2 Components to Build

```
src/components/data/
├── DataTable.tsx          - Generic data table with dynamic columns
├── RecordDetailDialog.tsx - Full record view in a modal
├── DataExporter.tsx       - Export functionality
├── DataFilters.tsx        - Filter panel
├── FormSelector.tsx       - Form/survey selector dropdown
└── FieldRenderer.tsx      - Render different field types appropriately
```

### 3.3 Data Flow

```
1. User selects project → load project data
2. User selects survey → load crfs for that survey
3. User selects form → load submissions for that form
4. Display table with:
   - Columns from crfs.fields
   - Rows from submissions.data
5. Allow sorting, filtering, pagination
6. Export selected/all data
```

### 3.4 Handling Form Relationships

For hierarchical data (parent-child forms):
- Show base form records by default
- Allow drill-down to child records
- Show parent info in child record view
- Export with relationship intact

---

## Phase 4: Survey Designer Improvements

### 4.1 Current Issues to Fix
- Ensure all question types render properly
- Fix any XML generation bugs
- Improve drag-and-drop reliability
- Better validation before save

### 4.2 Enhancements
- Preview mode (simulate mobile experience)
- Copy questions between forms
- Import questions from existing survey
- Version control for surveys

---

## Phase 5: My Account Page

Replace "Settings" with "My Account":

### 5.1 Profile Section
- View/edit name
- View email (read-only)
- Change password

### 5.2 Activity
- Recent activity log
- Projects I'm a member of

### 5.3 Preferences
- Theme (light/dark)
- Date format preference
- Export format preference

**Remove:**
- API Keys section (unless actually needed)
- Notifications (unless implemented)

---

## Phase 6: Global Data View (Optional)

The `/app/data` route could show:
- Cross-project data search
- Quick access to recent submissions across all projects
- Aggregate statistics

---

## Phase 7: Statistics & Dashboard

### 7.1 Project Dashboard Stats
- Collection rate over time
- Records by surveyor
- Records by form type
- Geographic distribution (if GPS data exists)
- Data quality metrics

### 7.2 Implementation
Use Recharts (already installed) to create:
- Line charts for time series
- Pie charts for distributions
- Bar charts for comparisons

---

## Implementation Priority Order

### Sprint 1: Core UX Fixes
1. Restructure sidebar navigation
2. Redesign project detail page with tabs
3. Move field team into project context
4. Rename "Submissions" to "Data"

### Sprint 2: Data Viewing
5. Build dynamic data table component
6. Implement form selector
7. Show actual data with proper columns
8. Basic export (CSV)

### Sprint 3: Project Members
9. Add project members tab
10. Invite members by email
11. Role management UI

### Sprint 4: Polish & Stats
12. My Account page cleanup
13. Basic statistics/charts
14. Data export improvements (Excel, ZIP)

### Sprint 5: Survey Designer Fixes
15. Test and fix survey designer issues
16. Add preview mode
17. Version management

---

## Technical Tasks Checklist

### Navigation & Layout
- [ ] Update AppSidebar.tsx - remove Field Teams, rename Submissions to Data
- [ ] Update routes in App.tsx
- [ ] Create new ProjectDetail layout with sub-tabs
- [ ] Create project sub-navigation component

### Project Detail Redesign
- [ ] Create ProjectOverview component with stats
- [ ] Create ProjectSurveys component (existing, reorganize)
- [ ] Create ProjectData component (new)
- [ ] Create ProjectMembers component (new)
- [ ] Create ProjectFieldTeam component (move from Teams.tsx)
- [ ] Create ProjectSettings component (new)

### Data Viewing System
- [ ] Create DataTable component with dynamic columns
- [ ] Create RecordDetailDialog component
- [ ] Create FormSelector component
- [ ] Implement data fetching with proper column mapping
- [ ] Add sorting, filtering, pagination
- [ ] Implement CSV export
- [ ] Implement Excel export (using xlsx library)
- [ ] Handle parent-child data relationships

### Project Members
- [ ] Create invite member dialog
- [ ] Create member list with role badges
- [ ] Implement role change functionality
- [ ] Implement member removal
- [ ] Add email invitation flow (or username lookup)

### My Account
- [ ] Rename Settings to My Account
- [ ] Implement profile editing
- [ ] Implement password change
- [ ] Remove placeholder content
- [ ] Add activity/project list

### Statistics
- [ ] Create stats cards for project overview
- [ ] Add collection timeline chart
- [ ] Add records by form chart
- [ ] Add surveyor activity chart

### Services/API
- [ ] Create projectMemberService.ts
- [ ] Update submissionService.ts for proper data queries
- [ ] Create dataExportService.ts
- [ ] Add statistics queries

---

## Database Considerations

### Existing RLS Policies
The database already has RLS policies for role-based access:
- Owners: Full CRUD on project and members
- Editors: CRUD on surveys, submissions, crfs
- Viewers: Read-only on submissions

### Needed Additions
- Consider adding `email_invitations` table for pending invites
- Add index on submissions for faster queries

---

## Questions for Clarification

Before proceeding, please confirm:

1. **Member Invitations**: Should inviting a member send an email, or just add them if they already have an account?

2. **Data Editing**: Should users be able to edit submitted data on the web? (Audit trail exists for this)

3. **Geographic Features**: Is GPS data collected? Should we show maps?

4. **Offline Support**: Any plans for offline web functionality?

5. **Notifications**: Do you want email notifications when data is synced?

6. **Multi-language**: Any internationalization requirements?

---

## File Structure After Changes

```
src/
├── pages/
│   ├── Projects.tsx              (updated)
│   ├── ProjectDetail.tsx         (major rewrite with sub-tabs)
│   ├── DataView.tsx              (global data view, optional)
│   ├── Account.tsx               (renamed from SettingsPage)
│   └── ...
├── components/
│   ├── layout/
│   │   ├── AppSidebar.tsx        (updated)
│   │   └── ProjectSubNav.tsx     (new)
│   ├── project/
│   │   ├── ProjectOverview.tsx   (new)
│   │   ├── ProjectSurveys.tsx    (extracted)
│   │   ├── ProjectData.tsx       (new)
│   │   ├── ProjectMembers.tsx    (new)
│   │   ├── ProjectFieldTeam.tsx  (new)
│   │   └── ProjectSettings.tsx   (new)
│   ├── data/
│   │   ├── DataTable.tsx         (new)
│   │   ├── RecordDetail.tsx      (new)
│   │   ├── DataExporter.tsx      (new)
│   │   └── DataFilters.tsx       (new)
│   ├── members/
│   │   ├── InviteMemberDialog.tsx (new)
│   │   └── MemberList.tsx        (new)
│   └── ...
├── services/
│   ├── projectMemberService.ts   (new)
│   ├── dataService.ts            (new or expanded)
│   └── ...
```

---

## Summary

This plan transforms DataKollecta from a collection of disjointed pages into a cohesive, project-centric application. The key changes are:

1. **Simplify navigation** - fewer top-level items, project as the hub
2. **Fix data viewing** - actually show the data, not just metadata
3. **Add project members** - proper team management with roles
4. **Integrate field teams** - move into project context
5. **Clean up account page** - remove placeholders, add real functionality

The result will be a more intuitive user experience where users can manage their entire data collection workflow within a logical project-based structure.
