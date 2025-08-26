const TaskService = require('../task-manager-api/services/taskService');

class TaskController {
  static async createTask(req, res) {
    try {
      const userId = req.user.userId;
      const taskData = req.body;
      const file = req.file;
      
      const task = await TaskService.createTask(userId, taskData, file);
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: {
          task
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getTasks(req, res) {
    try {
      const userId = req.user.userId;
      const options = {
        limit: req.query.limit,
        cursor: req.query.cursor,
        status: req.query.status,
        page: req.query.page,
        sortBy: req.query.sortBy,
        sortOrder: req.query.sortOrder
      };
      
      const result = await TaskService.getUserTasks(userId, options);
      
      res.json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: result
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async get