// File: routes/taskRoutes.js

const express = require('express');
const TaskController = require('../controllers/taskController');
const authMiddleware = require('../middleware/authMiddleware');
const { uploadMiddleware } = require('../utils/fileHandler');

const router = express.Router();

// All task routes require authentication
router.use(authMiddleware);

// Task CRUD operations
router.post('/', uploadMiddleware, TaskController.createTask);
router.get('/', TaskController.getTasks);
router.get('/stats', TaskController.getTaskStats);

// ⚡ Specific routes first
router.get('/:id/download', TaskController.downloadFile);

router.get('/:id', TaskController.getTaskById);
router.put('/:id', uploadMiddleware, TaskController.updateTask);
router.delete('/:id', TaskController.deleteTask);

module.exports = router;
