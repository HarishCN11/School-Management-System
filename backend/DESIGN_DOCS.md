# 📐 System Design & Architecture

This document contains the core design artifacts for the School Management System, as required by the Software Development Project Rubric (Criterion 8).

## 1. Context Diagram
Describes the high-level boundaries of the SMS and its interaction with users.

```mermaid
graph TD
    User((Users))
    SMS[School Management System]
    DB[(MySQL Database)]
    Email[Nodemailer / Email Service]

    User -- Login/Actions --> SMS
    SMS -- Data Queries --> DB
    SMS -- Auth/Reports --> User
    SMS -- Password Recovery --> Email
```

## 2. Use Case Diagram (Proposed System)
Shows the core functionalities available to each role.

```mermaid
graph TD
    subgraph Users
    Admin[Admin]
    Teacher[Teacher]
    Student[Student]
    Principal[Principal]
    end

    subgraph "School Management System"
    UC1(Manage Records Student/Teacher/Inventory)
    UC2(Enter/View Academic Reports)
    UC3(Assignment Submission)
    UC4(Announcements Request/Approve/Publish)
    UC5(Feedback & Resolution)
    UC6(Role-Based Login)
    end

    Admin --> UC1
    Admin --> UC4
    Admin --> UC6

    Teacher --> UC2
    Teacher --> UC4
    Teacher --> UC5
    Teacher --> UC6

    Student --> UC3
    Student --> UC5
    Student --> UC6

    Principal --> UC1
    Principal --> UC2
    Principal --> UC4
    Principal --> UC5
    Principal --> UC6
```

## 3. Sequence Diagram: Report Submission & Review
Illustrates the interaction between a Teacher and the Principal for academic reports.

```mermaid
sequenceDiagram
    participant T as Teacher
    participant API as Backend API
    participant DB as Database
    participant P as Principal

    T->>API: POST /api/academic/marks (Submit Marks)
    API->>DB: INSERT INTO academic_records
    DB-->>API: Success
    API-->>T: Report Submitted Successfully

    P->>API: GET /api/academic/marks/class/:classId
    API->>DB: SELECT * FROM academic_records
    DB-->>API: Result Set
    API-->>P: Render Report (Totals/Averages/Rank)
```

## 4. Activity Diagram: Announcement Workflow
Shows the approval-driven process for school announcements.

```mermaid
graph TD
    Start((Start)) --> Create[Teacher Creates Request]
    Create --> Review{Principal Review}
    Review -->|Rejected| Create
    Review -->|Approved| Publish[Admin Publishes to Noticeboard]
    Publish --> End((End))
```

## 5. Normalized Data Model (Entity Relationships)
Simplified view of the normalized database structure.

```mermaid
erDiagram
    USERS ||--|| TEACHERS : "profiles"
    USERS ||--|| STUDENTS : "profiles"
    USERS ||--o{ ANNOUNCEMENTS : "posts/requests"
    CLASSES ||--o{ STUDENTS : "belongs_to"
    CLASSES ||--o{ ASSIGNMENTS : "assigned_to"
    STUDENTS ||--o{ SUBMISSIONS : "uploads"
    ASSIGNMENTS ||--o{ SUBMISSIONS : "contains"
    STUDENTS ||--o{ RESULTS : "achieves"
    EXAMS ||--o{ RESULTS : "recorded_in"
```
