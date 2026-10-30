const db = require('../config/db');

exports.getTermReport = async (req, res) => {
    const { studentId } = req.params;

    try {
        // 1. Student info — LEFT JOIN so students without a class still load
        const [students] = await db.query(`
            SELECT s.id, u.name, s.class_id, COALESCE(c.name, '-') as class_name 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            LEFT JOIN classes c ON s.class_id = c.id
            WHERE s.id = ?
        `, [studentId]);

        if (students.length === 0) return res.status(404).json({ message: 'Student not found' });
        const student = students[0];

        // 2. Class size
        const [classSizeCount] = await db.query('SELECT COUNT(*) as count FROM students WHERE class_id = ?', [student.class_id]);
        const classSize = classSizeCount[0].count;

        // 3. All subjects (sorted & deduplicated by name)
        const subjectOrder = [
            'Religion', 'Tamil', 'Maths', 'Environment',
            'English', 'Sinhala', 'Creative works', 'Art',
            'Physical Education', 'Drawing'
        ];
        const [rawSubjects] = await db.query('SELECT id, name FROM subjects');

        // Group duplicate subject IDs by name (e.g., Religion -> [1, 25])
        const subjectMap = new Map();
        for (const s of rawSubjects) {
            if (!subjectMap.has(s.name)) {
                subjectMap.set(s.name, { name: s.name, ids: [] });
            }
            subjectMap.get(s.name).ids.push(s.id);
        }
        const allSubjects = Array.from(subjectMap.values());
        allSubjects.sort((a, b) => {
            let ia = subjectOrder.indexOf(a.name); let ib = subjectOrder.indexOf(b.name);
            if (ia === -1) ia = 99; if (ib === -1) ib = 99;
            return ia - ib;
        });

        // 4. Fetch Official Marks AND Legacy Results
        const academicYear = new Date().getFullYear().toString();
        const [officialResults] = await db.query(
            'SELECT subject_id, term_1_marks, term_2_marks, term_3_marks FROM official_reports WHERE student_id = ? AND academic_year = ?',
            [studentId, academicYear]
        );

        const terms = ['First Installment', 'Second Installment', 'Third Installment'];
        const [results] = await db.query(`
            SELECT r.marks_obtained, e.name as term_name, s.id as subject_id
            FROM results r
            JOIN exams e ON r.exam_id = e.id
            JOIN subjects s ON e.subject_id = s.id
            WHERE r.student_id = ?
        `, [studentId]);

        // Helper to get mark for a subject (checks ALL duplicate IDs for that subject name)
        const getMergedMark = (subjectIds, officialKey, legacyTermName) => {
            for (const sid of subjectIds) {
                const off = officialResults.find(o => o.subject_id === sid);
                if (off && off[officialKey] && off[officialKey] !== '-') {
                    return off[officialKey];
                }
            }
            for (const sid of subjectIds) {
                const res = results.find(r => r.subject_id === sid && r.term_name === legacyTermName);
                if (res) return res.marks_obtained;
            }
            return '-';
        };

        // 5. Build report rows (one row per unique subject name)
        const reportData = allSubjects.map(subject => ({
            subject: subject.name,
            term1: getMergedMark(subject.ids, 'term_1_marks', terms[0]),
            term2: getMergedMark(subject.ids, 'term_2_marks', terms[1]),
            term3: getMergedMark(subject.ids, 'term_3_marks', terms[2])
        }));

        // 6. Calculate totals and averages
        const calcTermStats = (termKey) => {
            const termMarks = reportData.map(r => parseFloat(r[termKey])).filter(n => !isNaN(n) && n > 0);
            if (termMarks.length === 0) return { total: '-', avg: '-' };
            
            const total = termMarks.reduce((a, b) => a + b, 0);
            const avg = (total / termMarks.length).toFixed(2);
            return { total, avg };
        };

        const stats = {
            term1: calcTermStats('term1'),
            term2: calcTermStats('term2'),
            term3: calcTermStats('term3')
        };

        // 7. Class rankings
        const getRank = async (officialKey, legacyTermName) => {
            if (!student.class_id) return '-'; // No class = no rank

            const [classStudents] = await db.query(
                'SELECT id FROM students WHERE class_id = ?', [student.class_id]
            );

            // Get total marks for EVERY student in class for this term
            const studentTotals = await Promise.all(
                classStudents.map(async (cs) => {
                    const [csOff] = await db.query(
                        'SELECT subject_id, ?? as mark FROM official_reports WHERE student_id = ? AND academic_year = ?',
                        [officialKey, cs.id, academicYear]
                    );
                    const [csLeg] = await db.query(`
                        SELECT s.id as subject_id, r.marks_obtained as mark
                        FROM results r
                        JOIN exams e ON r.exam_id = e.id
                        JOIN subjects s ON e.subject_id = s.id
                        WHERE r.student_id = ? AND e.name = ?
                    `, [cs.id, legacyTermName]);

                    // Merge their marks too for the class ranking
                    let total = 0;
                    allSubjects.forEach(sub => {
                        let found = false;
                        for (const sid of sub.ids) {
                            const o = csOff.find(o => o.subject_id === sid);
                            if (o && o.mark && o.mark !== '-') {
                                total += parseFloat(o.mark);
                                found = true;
                                break;
                            }
                        }
                        if (!found) {
                            for (const sid of sub.ids) {
                                const l = csLeg.find(l => l.subject_id === sid);
                                if (l && l.mark && l.mark !== '-') {
                                    total += parseFloat(l.mark);
                                    break;
                                }
                            }
                        }
                    });
                    return { student_id: cs.id, total };
                })
            );

            // Filter out students with 0 total marks, then sort descending
            const validStudents = studentTotals.filter(s => s.total > 0).sort((a, b) => b.total - a.total);
            const rankIndex = validStudents.findIndex(s => s.student_id == studentId);
            return rankIndex !== -1 ? rankIndex + 1 : '-';
        };

        const ranks = {
            term1: await getRank('term_1_marks', terms[0]),
            term2: await getRank('term_2_marks', terms[1]),
            term3: await getRank('term_3_marks', terms[2])
        };

        const yearUsed = officialResults.length > 0 ? officialResults[0].academic_year : academicYear;

        res.json({ 
            studentName: student.name, 
            className: student.class_name, 
            classSize, 
            report: reportData, 
            stats, 
            ranks,
            academicYear: yearUsed
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.getStudentSubjects = async (req, res) => {
    const { studentId } = req.params;
    try {
        // Get student's class
        const [student] = await db.query('SELECT class_id FROM students WHERE id = ?', [studentId]);
        if (student.length === 0) return res.status(404).json({ message: 'Student not found' });
        const classId = student[0].class_id;

        const query = `
            SELECT s.id, s.name, s.code, u.name as teacher_name, t.id as teacher_id
            FROM subjects s
            JOIN schedule sch ON s.id = sch.subject_id
            JOIN teachers t ON sch.teacher_id = t.id
            JOIN users u ON t.user_id = u.id
            WHERE sch.class_id = ?
        `;
        const [rawSubjects] = await db.query(query, [classId]);

        // Group by name
        const subjectMap = new Map();
        for (const s of rawSubjects) {
            if (!subjectMap.has(s.name)) {
                subjectMap.set(s.name, s);
            }
        }
        const subjects = Array.from(subjectMap.values());

        // Sort to match report card order
        const subjectOrder = [
            'Religion', 'Tamil', 'Maths', 'Environment',
            'English', 'Sinhala', 'Creative works', 'Art',
            'Physical Education', 'Drawing'
        ];

        subjects.sort((a, b) => {
            let indexA = subjectOrder.indexOf(a.name);
            let indexB = subjectOrder.indexOf(b.name);
            if (indexA === -1) indexA = 99;
            if (indexB === -1) indexB = 99;
            return indexA - indexB;
        });

        // Fallback: If no schedule, just get all subjects
        if (subjects.length === 0) {
            const [allSubjRaw] = await db.query('SELECT id, name, code FROM subjects');
            
            const allSubjMap = new Map();
            for (const s of allSubjRaw) {
                if (!allSubjMap.has(s.name)) {
                    allSubjMap.set(s.name, s);
                }
            }
            const allSubj = Array.from(allSubjMap.values());

            allSubj.sort((a, b) => {
                let indexA = subjectOrder.indexOf(a.name);
                let indexB = subjectOrder.indexOf(b.name);
                if (indexA === -1) indexA = 99;
                if (indexB === -1) indexB = 99;
                return indexA - indexB;
            });

            return res.json(allSubj.map(s => ({ ...s, teacher_name: 'Not Assigned', teacher_id: null })));
        }

        res.json(subjects);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
}

exports.getManagedClass = async (req, res) => {
    try {
        const [teacher] = await db.query('SELECT managed_class_id FROM teachers WHERE user_id = ?', [req.user.id]);
        if (teacher.length === 0 || !teacher[0].managed_class_id) {
            return res.json({ managed_class_id: null });
        }

        const [classes] = await db.query('SELECT id, name, room_number FROM classes WHERE id = ?', [teacher[0].managed_class_id]);
        res.json(classes[0] || { managed_class_id: null });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getClassStudentsForReports = async (req, res) => {
    const { classId } = req.params;
    try {
        const [students] = await db.query(`
            SELECT s.id, u.name, s.admission_number 
            FROM students s 
            JOIN users u ON s.user_id = u.id 
            WHERE s.class_id = ?
        `, [classId]);
        res.json(students);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getOfficialMarks = async (req, res) => {
    const { studentId } = req.params;
    const academicYear = new Date().getFullYear().toString();
    try {
        const [marks] = await db.query('SELECT * FROM official_reports WHERE student_id = ? AND academic_year = ?', [studentId, academicYear]);
        res.json(marks);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateOfficialMarks = async (req, res) => {
    const { student_id, marks, academic_year } = req.body; // marks is array of {subject_id, term_1, term_2, term_3}
    const currentYear = new Date().getFullYear().toString();
    const targetYear = academic_year || currentYear;

    try {
        for (const m of marks) {
            await db.query(`
                INSERT INTO official_reports (student_id, subject_id, academic_year, term_1_marks, term_2_marks, term_3_marks)
                VALUES (?, ?, ?, ?, ?, ?)
                ON CONFLICT (student_id, subject_id, academic_year) DO UPDATE SET
                term_1_marks = EXCLUDED.term_1_marks,
                term_2_marks = EXCLUDED.term_2_marks,
                term_3_marks = EXCLUDED.term_3_marks
            `, [student_id, m.subject_id, targetYear, m.term_1_marks || '-', m.term_2_marks || '-', m.term_3_marks || '-']);
        }
        res.json({ message: 'Official report marks updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getClassTeacher = async (req, res) => {
    const { studentId } = req.params;
    try {
        const [rows] = await db.query(`
            SELECT u.name, u.email, t.id as teacher_id
            FROM students s
            JOIN classes c ON s.class_id = c.id
            JOIN teachers t ON t.managed_class_id = c.id
            JOIN users u ON t.user_id = u.id
            WHERE s.id = ?
        `, [studentId]);

        if (rows.length === 0) return res.json(null);
        res.json(rows[0]);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};
