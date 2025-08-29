// File: routes/taskRoutes.js

const express = require('express');
const TaskController = require('../controllers/taskController');
const authMiddleware = require('../middlewares/authMiddleware');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { uploadsDir } = require('../utils/fileHandler');

const router = express.Router();

// Ensure uploads directory exists in the correct location
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for multiple file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Allow common file types
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, PDFs, and text files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 5 // Maximum 5 files per request
  }
});

// All task routes require authentication
router.use(authMiddleware);

// Task CRUD operations
router.post('/', upload.array('files', 5), TaskController.createTask);
router.get('/', TaskController.getTasks);

// Task operations
router.get('/:id', TaskController.getTaskById);
router.put('/:id', upload.array('files', 5), TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

// File download route
router.get('/:id/download', TaskController.downloadFile);

module.exports = router;
