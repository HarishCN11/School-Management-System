USE school_management;

DROP TABLE IF EXISTS announcements;

CREATE TABLE announcements (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    file_path VARCHAR(255),
    display_until DATE,
    target_role ENUM('all', 'student', 'teacher', 'admin', 'parent', 'principal') DEFAULT 'all',
    posted_by INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (posted_by) REFERENCES users(id) ON DELETE SET NULL
);
