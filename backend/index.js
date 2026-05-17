const express = require('express');
const cors = require('cors'); 
const dotenv = require('dotenv'); 
const db = require('./config/db'); 
const path = require('path'); 

// Configure environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request Logger & DB Connectivity Check
app.use(async (req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);

  // Quick health check for API routes
  if (req.url.startsWith('/api')) {
    try {
      const connection = await db.getConnection();
      connection.release();
    } catch (dbError) {
      console.error('CRITICAL: Database connection failed during request:', dbError.message);
      return res.status(503).json({
        message: 'Database is offline. Please start your MySQL service (XAMPP or Windows Services).',
        error: dbError.code
      });
    }
  }
  next();
});

// Routes
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const academicRoutes = require('./routes/academicRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const examRoutes = require('./routes/examRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const principalRoutes = require('./routes/principalRoutes');
const parentRoutes = require('./routes/parentRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/principals', principalRoutes);
app.use('/api/parents', parentRoutes);
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/announcements', require('./routes/announcementRoutes'));
app.use('/api/assignments', require('./routes/assignmentRoutes'));
app.use('/api/materials', require('./routes/materialRoutes'));
app.use('/api/feedback', require('./routes/feedbackRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/teacher-portal', require('./routes/teacherPortalRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/stats', require('./routes/statsRoutes'));

// Basic route
app.get('/', (req, res) => {
  res.send('School Management Backend is running!');
});

// Health check route
app.get('/health', async (req, res) => {
  try {
    const connection = await db.getConnection();
    await connection.release();
    res.json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', database: 'disconnected', error: error.message });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Start server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);

  // Test database connection
  db.getConnection()
    .then(connection => {
      connection.release();
      console.log('✓ Database connection successful');
    })
    .catch(error => {
      console.warn('⚠ Database connection failed:', error.message);
      console.warn('Server is running but database features may not work.');
      console.warn('Make sure MySQL is running and credentials in .env are correct.');
    });
});
