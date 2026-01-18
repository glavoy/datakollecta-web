# Mobile Data Upload Implementation Instructions

**Objective**: Implement a robust background sync process to upload collected data (`submissions`) and audit logs (`formchanges`) to the Supabase backend.

## 1. Database Schema Updates (Mobile Side)

You need to track which records have been successfully uploaded to avoid duplicates.

*   **Action**: Add a `synced_at` column (TEXT/ISO-8601 or INTEGER/Unix Timestamp, consistent with your app's conventions) to:
    1.  All data tables listed in the `crfs` table (e.g., `households`, `persons`, etc.).
    2.  The `formchanges` table.
*   **Default Value**: `NULL`.

## 2. Upload Logic & Protocol

### A. Batching Strategy
*   **Batch Size**: Upload **10-20 records** per request.
*   **Frequency**: Attempt upload periodically (e.g., every 15 minutes) or manually triggered by the user.
*   **Priority**: Upload `submissions` (current state) first, then `formchanges` (history).

### B. Selecting Data to Upload
Select records where `synced_at` is `NULL`.

```sql
-- Example Selector
SELECT * FROM households WHERE synced_at IS NULL LIMIT 20;
```

### C. JSON Payload Structure
Send a **POST** request to: `[SUPABASE_URL]/functions/v1/app-sync`
**Headers**:
*   `Authorization`: `Bearer [USER_SESSION_TOKEN]`
*   `Content-Type`: `application/json`

**Body**:
```json
{
  "token": "[USER_SESSION_TOKEN]",
  "submissions": [
    {
      "table_name": "households",
      "local_unique_id": "uuid-1234-5678", 
      "data": { 
          "hhal1": "John Doe",
          "hhal2": 45 
          // ... all other column data from the row
      },
      "collected_at": "2023-10-27T10:00:00Z",
      "app_version": "1.0.2",
      "device_id": "device-uuid"
      // ... map other available fields
    }
  ],
  "history": [
    {
      "local_unique_id": "history-uuid-abcd",
      "submission_local_id": "uuid-1234-5678", // The local_unique_id of the record being changed
      "change_type": "edit", // or 'create'
      "changed_fields": { "hhal2": 46 }, // JSON string or object of changes
      "changed_at": "2023-10-27T10:05:00Z",
      "changed_by": "surveyor1",
      "changed_on_device": true
    }
  ]
}
```

## 3. Handling the Response

The server will return a JSON object telling you exactly which records were safely saved.

**Response Format**:
```json
{
  "success": true,
  "synced_count": 1,
  "failed_count": 0,
  "synced": ["uuid-1234-5678", ...],        // IDs from the 'submissions' list
  "history_synced": ["history-uuid-abcd"],  // IDs from the 'history' list
  "failed": [
      { "id": "uuid-9999", "error": "Duplicate key violation" }
  ]
}
```

### D. Updating Local State (CRITICAL)

1.  **Parse** the `synced` array.
2.  **Update** your specific data table (e.g., `households`) for these IDs:
    ```sql
    UPDATE households SET synced_at = '2023-10-27T12:00:00Z' WHERE local_unique_id IN ('uuid-1234-5678', ...);
    ```
3.  **Parse** the `history_synced` array.
4.  **Update** the `formchanges` table:
    ```sql
    UPDATE formchanges SET synced_at = '2023-10-27T12:00:00Z' WHERE local_unique_id IN ('history-uuid-abcd', ...);
    ```
5.  **Do NOT** update records listed in `failed`. Rety them next time.

## 4. Error Handling
*   **401 Unauthorized**: Session expired. Prompt user to log in or refresh token.
*   **500/Network Error**: Do nothing. Retry in next scheduled cycle.
