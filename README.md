# Datakollecta Web

Datakollecta is a comprehensive platform designed for research projects, field surveys, and clinical trials. It enables organizations to design complex surveys, manage field teams, and ensure data integrity across both offline and online environments.

## Key Features

### 🚀 Survey Design Engine
*   **Visual Builder:** intuitive interface for creating and managing survey forms.
*   **Complex Logic:** Support for skip logic, validation rules, and specialized question types (text, date, single/multi-select, etc.).
*   **Form Management:** Version control, form duplication, and lifecycle management.

### 📊 Data Management & Dashboard
*   **Real-time Stats:** Interactive dashboards visualizing data collection progress.
*   **Flexible Storage:** JSONB-based storage to accommodate varying survey structures without schema migrations.
*   **Export & Analysis:** Export submissions to CSV, Excel, or JSON formats for external analysis.
*   **Row-Level Security:** Strict data isolation ensures users only access data they are authorized to see.

### 👥 Team & Field Management
*   **Worker Credentials:** Manage dedicated credentials for field workers.
*   **Session Tracking:** Monitor active sessions and data collection activity.
*   **Offline-First:** Built-in support for offline data collection with robust synchronization and conflict resolution when connectivity is restored.





## Project Structure

*   `src/components`: Reusable UI components and feature-specific widgets.
    *   `src/components/survey-designer`: Core logic for the survey builder.
    *   `src/components/dashboard`: Dashboard widgets and layout.
    *   `src/components/ui`: Shadcn UI primitives.
*   `src/pages`: Top-level route components (Dashboard, Login, SurveyDesigner, etc.).
*   `src/lib`: Utility functions, Supabase client setup, and XML generation logic.
*   `src/types`: TypeScript definitions for surveys, forms, and data structures.
*   `src/hooks`: Custom React hooks (e.g., authentication, mobile detection).

