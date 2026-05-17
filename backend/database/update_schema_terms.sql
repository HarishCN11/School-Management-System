ALTER TABLE exams ADD COLUMN term VARCHAR(50) DEFAULT 'Term 1';

-- Create a table for yearly summaries if not exists, to store position/rank explicitly as requested
CREATE TABLE IF NOT EXISTS academic_records (
    id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    total_marks INT DEFAULT 0,
    average_marks DECIMAL(5,2) DEFAULT 0.00,
    class_position INT DEFAULT 0,
    teacher_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_record (student_id, academic_year),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);
