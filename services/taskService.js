const TaskModel = require('../models/taskModel');
const path = require('path');
const fs = require('fs').promises;

class TaskService {
  static async createTask(userId, taskData, file = null) {
    const { title, description, dueDate, status } = taskData;
    
    // Basic validation
    if (!title || title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    
    // Validate status
    const validStatuses = ['pending', 'completed'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Status must be either "pending" or "completed"');
    }
    
    // Validate due date
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid due date format');
      }
    }
    
    // Handle file upload
    let filePath = null;
    if (file) {
      filePath = file.path;
    }
    
    // Create task
    const taskId = await TaskModel.create({
      title: title.trim(),
      description: description?.trim() || null,
      dueDate: dueDate || null,
      status: status || 'pending',
      filePath,
      userId
    });
    
    return await TaskModel.findById(taskId, userId);
  }

  static async getTaskById(userId, taskId) {
    if (!taskId || isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    const task = await TaskModel.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    return task;
  }

  static async getUserTasks(userId, options = {}) {
    const { 
      limit = 10, 
      cursor, 
      status, 
      page = 1,
      sortBy = 'created_at',
      sortOrder = 'DESC'
    } = options;
    
    // Validate limit
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    
    // Validate status
    if (status && !['pending', 'completed'].includes(status)) {
      throw new Error('Status must be either "pending" or "completed"');
    }
    
    let tasks;
    let totalCount;
    let hasMore = false;
    
    if (cursor) {
      // Cursor-based pagination
      tasks = await TaskModel.findByUserId(userId, { 
        limit: parsedLimit + 1, 
        cursor, 
        status 
      });
      
      if (tasks.length > parsedLimit) {
        hasMore = true;
        tasks = tasks.slice(0, parsedLimit);
      }
      
      const nextCursor = tasks.length > 0 ? tasks[tasks.length - 1].id : null;
      
      return {
        tasks,
        pagination: {
          hasMore,
          nextCursor: hasMore ? nextCursor : null
        }
      };
    } else {
      // Page-based pagination
      tasks = await TaskModel.getUserTasks(userId, {
        page,
        limit: parsedLimit,
        status,
        sortBy,
        sortOrder
      });
      
      totalCount = await TaskModel.getTasksCount(userId, status);
      const totalPages = Math.ceil(totalCount / parsedLimit);
      
      return {
        tasks,
        pagination: {
          page: parseInt(page),
          limit: parsedLimit,
          totalPages,
          totalCount,
          hasMore: page < totalPages
        }
      };
    }
  }

  static async updateTask(userId, taskId, updateData, file = null) {
    if (!taskId || isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    // Check if task exists and belongs to user
    const existingTask = await TaskModel.findById(taskId, userId);
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    const { title, description, dueDate, status } = updateData;
    const updatedData = {};
    
    // Validate and prepare update data
    if (title !== undefined) {
      if (!title || title.trim().length === 0) {
        throw new Error('Task title cannot be empty');
      }
      updatedData.title = title.trim();
    }
    
    if (description !== undefined) {
      updatedData.description = description?.trim() || null;
    }
    
    if (dueDate !== undefined) {
      if (dueDate) {
        const date = new Date(dueDate);
        if (isNaN(date.getTime())) {
          throw new Error('Invalid due date format');
        }
        updatedData.dueDate = dueDate;
      } else {
        updatedData.dueDate = null;
      }
    }
    
    if (status !== undefined) {
      const validStatuses = ['pending', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Status must be either "pending" or "completed"');
      }
      updatedData.status = status;
    }
    
    // Handle file upload
    if (file) {
      // Delete old file if exists
      if (existingTask.file_path) {
        try {
          await fs.unlink(existingTask.file_path);
        } catch (error) {
          // File might not exist, continue
          console.warn('Could not delete old file:', error.message);
        }
      }
      updatedData.filePath = file.path;
    }
    
    // Update task
    const updated = await TaskModel.update(taskId, userId, updatedData);
    if (!updated) {
      throw new Error('Failed to update task');
    }
    
    return await TaskModel.findById(taskId, userId);
  }

  static async deleteTask(userId, taskId) {
    if (!taskId || isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    // Check if task exists and belongs to user
    const task = await TaskModel.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Delete associated file if exists
    if (task.file_path) {
      try {
        await fs.unlink(task.file_path);
      } catch (error) {
        // File might not exist, continue with task deletion
        console.warn('Could not delete task file:', error.message);
      }
    }
    
    // Delete task
    const deleted = await TaskModel.delete(taskId, userId);
    if (!deleted) {
      throw new Error('Failed to delete task');
    }
    
    return true;
  }

  static async getTaskStats(userId) {
    const totalTasks = await TaskModel.getTasksCount(userId);
    const pendingTasks = await TaskModel.getTasksCount(userId, 'pending');
    const completedTasks = await TaskModel.getTasksCount(userId, 'completed');
    
    return {
      total: totalTasks,
      pending: pendingTasks,
      completed: completedTasks
    };
  }
}

module.exports = TaskService;