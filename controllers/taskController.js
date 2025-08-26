const TaskService = require('../services/taskService');

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

  static async getTaskById(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.id;
      
      const task = await TaskService.getTaskById(userId, taskId);
      
      res.json({
        success: true,
        message: 'Task retrieved successfully',
        data: {
          task
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateTask(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.id;
      const updateData = req.body;
      const file = req.file;
      
      const task = await TaskService.updateTask(userId, taskId, updateData, file);
      
      res.json({
        success: true,
        message: 'Task updated successfully',
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

  static async deleteTask(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.id;
      
      await TaskService.deleteTask(userId, taskId);
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getTaskStats(req, res) {
    try {
      const userId = req.user.userId;
      
      const stats = await TaskService.getTaskStats(userId);
      
      res.json({
        success: true,
        message: 'Task statistics retrieved successfully',
        data: {
          stats
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  static async downloadFile(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.id;
      
      const task = await TaskService.getTaskById(userId, taskId);
      
      if (!task.file_path) {
        return res.status(404).json({
          success: false,
          message: 'No file attached to this task'
        });
      }

      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(task.file_path)) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      const fileName = path.basename(task.file_path);
      res.download(task.file_path, fileName);
      
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = TaskController;