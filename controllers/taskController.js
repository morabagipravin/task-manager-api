const TaskService = require('../services/taskService');
const logger = require('../config/logger');

class TaskController {
  static async createTask(req, res) {
    try {
      const userId = req.user.userId;
      const taskData = req.body;
      const files = req.files; // Multiple files
      
      const task = await TaskService.createTask(userId, taskData, files);
      
      logger.info('Task created successfully', { userId, taskId: task.id });
      
      res.status(201).json({
        success: true,
        message: 'Task created successfully',
        data: {
          task
        }
      });
    } catch (error) {
      logger.error('Task creation failed:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getTasks(req, res) {
    try {
      const userId = req.user.userId;
      const { cursor, limit = 10, status } = req.query;
      
      const result = await TaskService.getUserTasks(userId, { cursor, limit, status });
      
      logger.info('Tasks retrieved successfully', { userId, count: result.tasks.length });
      
      res.json({
        success: true,
        message: 'Tasks retrieved successfully',
        data: result
      });
    } catch (error) {
      logger.error('Task retrieval failed:', error);
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
      logger.error('Task retrieval failed:', error);
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
      const files = req.files; // Multiple files
      
      const task = await TaskService.updateTask(userId, taskId, updateData, files);
      
      logger.info('Task updated successfully', { userId, taskId });
      
      res.json({
        success: true,
        message: 'Task updated successfully',
        data: {
          task
        }
      });
    } catch (error) {
      logger.error('Task update failed:', error);
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
      
      logger.info('Task deleted successfully', { userId, taskId });
      
      res.json({
        success: true,
        message: 'Task deleted successfully'
      });
    } catch (error) {
      logger.error('Task deletion failed:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  static async downloadFile(req, res) {
    try {
      const userId = req.user.userId;
      const taskId = req.params.id;
      const fileName = req.query.file; // Get filename from query parameter
      
      if (!fileName) {
        return res.status(400).json({
          success: false,
          message: 'File name is required as query parameter'
        });
      }
      
      const filePath = await TaskService.getTaskFilePath(userId, taskId, fileName);
      
      if (!filePath) {
        return res.status(404).json({
          success: false,
          message: 'File not found'
        });
      }

      const fs = require('fs');
      const path = require('path');
      
      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          message: 'File not found on server'
        });
      }

      res.download(filePath, fileName);
      
    } catch (error) {
      logger.error('File download failed:', error);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = TaskController;