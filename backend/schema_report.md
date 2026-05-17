# 🗄️ LIVE DATABASE SCHEMA REPORT

**Database Name:** school_management

## 📋 Table: `academic_records`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **student_id** | int(11) | NO | MUL | NULL |  |
| **academic_year** | varchar(20) | NO |  | NULL |  |
| **total_marks** | int(11) | YES |  | 0 |  |
| **average_marks** | decimal(5,2) | YES |  | 0.00 |  |
| **class_position** | int(11) | YES |  | 0 |  |
| **teacher_remarks** | text | YES |  | NULL |  |
| **created_at** | timestamp | NO |  | current_timestamp() |  |

### 🔗 Relationships
- **student_id** ➡️ links to `students.id`

---

## 📋 Table: `admin_profiles`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **user_id** | int(11) | NO | MUL | NULL |  |
| **contact_detail** | varchar(255) | YES |  | NULL |  |

### 🔗 Relationships
- **user_id** ➡️ links to `users.id`

---

## 📋 Table: `announcements`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **title** | varchar(255) | NO |  | NULL |  |
| **content** | text | NO |  | NULL |  |
| **target_role** | enum('all','student','teacher','parent','admin') | YES |  | all |  |
| **posted_by** | int(11) | YES | MUL | NULL |  |
| **created_at** | timestamp | NO |  | current_timestamp() |  |
| **display_until** | date | YES |  | NULL |  |
| **file_path** | varchar(255) | YES |  | NULL |  |
| **role_target** | varchar(50) | YES |  | All |  |

### 🔗 Relationships
- **posted_by** ➡️ links to `users.id`

---

## 📋 Table: `assignments`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **title** | varchar(255) | NO |  | NULL |  |
| **description** | text | YES |  | NULL |  |
| **class_id** | int(11) | YES | MUL | NULL |  |
| **subject_id** | int(11) | YES | MUL | NULL |  |
| **due_date** | date | YES |  | NULL |  |
| **created_at** | timestamp | NO |  | current_timestamp() |  |

### 🔗 Relationships
- **class_id** ➡️ links to `classes.id`
- **subject_id** ➡️ links to `subjects.id`

---

## 📋 Table: `attendance`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **student_id** | int(11) | NO | MUL | NULL |  |
| **class_id** | int(11) | NO | MUL | NULL |  |
| **date** | date | NO |  | NULL |  |
| **status** | enum('present','absent','late','excused') | YES |  | present |  |

### 🔗 Relationships
- **student_id** ➡️ links to `students.id`
- **class_id** ➡️ links to `classes.id`

---

## 📋 Table: `classes`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **name** | varchar(50) | NO |  | NULL |  |
| **room_number** | varchar(20) | YES |  | NULL |  |
| **created_at** | timestamp | NO |  | current_timestamp() |  |

*(No foreign keys detected)*

---

## 📋 Table: `exams`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **name** | varchar(100) | NO |  | NULL |  |
| **class_id** | int(11) | NO | MUL | NULL |  |
| **subject_id** | int(11) | NO | MUL | NULL |  |
| **exam_date** | date | YES |  | NULL |  |
| **total_marks** | int(11) | YES |  | 100 |  |
| **term** | varchar(50) | YES |  | Term 1 |  |

### 🔗 Relationships
- **class_id** ➡️ links to `classes.id`
- **subject_id** ➡️ links to `subjects.id`

---

## 📋 Table: `inventory`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **item_name** | varchar(255) | NO |  | NULL |  |
| **category** | varchar(100) | YES |  | NULL |  |
| **quantity** | int(11) | YES |  | 0 |  |
| **status** | enum('available','low_stock','out_of_stock') | YES |  | available |  |
| **description** | text | YES |  | NULL |  |
| **last_updated** | timestamp | NO |  | current_timestamp() | on update current_timestamp() |

*(No foreign keys detected)*

---

## 📋 Table: `parents`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **user_id** | int(11) | NO | MUL | NULL |  |
| **student_id** | int(11) | YES | MUL | NULL |  |
| **phone_number** | varchar(20) | YES |  | NULL |  |

### 🔗 Relationships
- **user_id** ➡️ links to `users.id`
- **student_id** ➡️ links to `students.id`

---

## 📋 Table: `principals`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **user_id** | int(11) | NO | MUL | NULL |  |
| **experience_years** | int(11) | YES |  | NULL |  |
| **contact_number** | varchar(20) | YES |  | NULL |  |

### 🔗 Relationships
- **user_id** ➡️ links to `users.id`

---

## 📋 Table: `results`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **exam_id** | int(11) | NO | MUL | NULL |  |
| **student_id** | int(11) | NO | MUL | NULL |  |
| **marks_obtained** | decimal(5,2) | YES |  | NULL |  |

### 🔗 Relationships
- **exam_id** ➡️ links to `exams.id`
- **student_id** ➡️ links to `students.id`

---

## 📋 Table: `schedule`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **class_id** | int(11) | NO | MUL | NULL |  |
| **subject_id** | int(11) | NO | MUL | NULL |  |
| **teacher_id** | int(11) | NO | MUL | NULL |  |
| **day_of_week** | enum('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday') | YES |  | NULL |  |
| **start_time** | time | YES |  | NULL |  |
| **end_time** | time | YES |  | NULL |  |

### 🔗 Relationships
- **class_id** ➡️ links to `classes.id`
- **subject_id** ➡️ links to `subjects.id`
- **teacher_id** ➡️ links to `teachers.id`

---

## 📋 Table: `students`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **user_id** | int(11) | NO | MUL | NULL |  |
| **class_id** | int(11) | YES | MUL | NULL |  |
| **admission_number** | varchar(50) | YES | UNI | NULL |  |
| **dob** | date | YES |  | NULL |  |
| **gender** | enum('male','female','other') | YES |  | NULL |  |
| **address** | text | YES |  | NULL |  |

### 🔗 Relationships
- **user_id** ➡️ links to `users.id`
- **class_id** ➡️ links to `classes.id`

---

## 📋 Table: `study_materials`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **title** | varchar(255) | NO |  | NULL |  |
| **description** | text | YES |  | NULL |  |
| **class_id** | int(11) | NO | MUL | NULL |  |
| **subject_id** | int(11) | NO | MUL | NULL |  |
| **teacher_id** | int(11) | NO | MUL | NULL |  |
| **file_path** | varchar(255) | NO |  | NULL |  |
| **uploaded_at** | timestamp | NO |  | current_timestamp() |  |

### 🔗 Relationships
- **class_id** ➡️ links to `classes.id`
- **subject_id** ➡️ links to `subjects.id`
- **teacher_id** ➡️ links to `teachers.id`

---

## 📋 Table: `subjects`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **name** | varchar(100) | NO |  | NULL |  |
| **code** | varchar(20) | YES | UNI | NULL |  |

*(No foreign keys detected)*

---

## 📋 Table: `submissions`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **assignment_id** | int(11) | NO | MUL | NULL |  |
| **student_id** | int(11) | NO | MUL | NULL |  |
| **file_path** | varchar(255) | NO |  | NULL |  |
| **submitted_at** | timestamp | NO |  | current_timestamp() |  |
| **marks** | int(11) | YES |  | NULL |  |
| **remarks** | text | YES |  | NULL |  |

### 🔗 Relationships
- **assignment_id** ➡️ links to `assignments.id`
- **student_id** ➡️ links to `students.id`

---

## 📋 Table: `teachers`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **user_id** | int(11) | NO | MUL | NULL |  |
| **qualification** | varchar(100) | YES |  | NULL |  |
| **specialization** | varchar(100) | YES |  | NULL |  |
| **phone_number** | varchar(20) | YES |  | NULL |  |
| **address** | text | YES |  | NULL |  |

### 🔗 Relationships
- **user_id** ➡️ links to `users.id`

---

## 📋 Table: `users`

### Columns
| Field | Type | Null | Key | Default | Extra |
|---|---|---|---|---|---|
| **id** | int(11) | NO | PRI | NULL | auto_increment |
| **name** | varchar(255) | NO |  | NULL |  |
| **email** | varchar(255) | NO | UNI | NULL |  |
| **password_hash** | varchar(255) | NO |  | NULL |  |
| **role** | enum('admin','teacher','student','parent','principal') | YES |  | student |  |
| **created_at** | timestamp | NO |  | current_timestamp() |  |

*(No foreign keys detected)*

---

