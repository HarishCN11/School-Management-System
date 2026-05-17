# School Management System Backend

This is a backend API for a school management system built with Node.js, Express, and MySQL.

## Features

- **Authentication**: User registration and login (JWT-based). Supports roles (admin, teacher, student, parent).
- **Student Management**: Profiles, details.
- **Teacher Management**: Profiles, qualifications.
- **Academic Management**: Classes, Subjects.
- **Attendance**: Mark and view attendance.
- **Exams & Results**: Schedule exams, record marks, view performance.

## Setup

1.  **Install Dependencies**:
    ```bash
    npm install
    ```

2.  **Database Setup**:
    -   Ensure MySQL is running.
    -   Create a database (default: `school_management`) or let the script do it.
    -   Update `.env` with your DB credentials.
    -   Run initialization script to create tables:
        ```bash
        node config/init_db.js
        ```

3.  **Run Server**:
    ```bash
    npm start
    # or for development
    npm run dev
    ```

## API Endpoints

### Authentication
-   `POST /api/auth/register` - Register a new user
-   `POST /api/auth/login` - Login and get token

### Students
-   `GET /api/students` - Get all students
-   `GET /api/students/:id` - Get student details
-   `POST /api/students/profile` - Create student profile

### Teachers
-   `GET /api/teachers` - Get all teachers
-   `POST /api/teachers/profile` - Create teacher profile

### Academic
-   `GET /api/academic/classes` - List classes
-   `POST /api/academic/classes` - Create class
-   `GET /api/academic/subjects` - List subjects
-   `POST /api/academic/subjects` - Create subject

### Attendance
-   `POST /api/attendance` - Mark attendance
-   `GET /api/attendance/class/:class_id/date/:date` - View attendance

### Exams
-   `POST /api/exams` - Create/Schedule exam
-   `POST /api/exams/results` - Record results
-   `GET /api/exams/student/:student_id` - Get results for a student
-   `GET /api/exams/exam/:exam_id` - Get class results for an exam

### Schedule (Timetable)
-   `POST /api/schedule` - Add schedule item
-   `GET /api/schedule/class/:class_id` - Get class schedule
-   `GET /api/schedule/teacher/:teacher_id` - Get teacher schedule
