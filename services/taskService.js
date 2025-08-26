const db = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

class TaskService {
  static async createTask(userId, taskData, files = []) {
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
    
    // Handle file uploads
    let filePaths = [];
    if (files && files.length > 0) {
      filePaths = files.map(file => file.path);
    }
    
    // Create task
    const [result] = await db.execute(
      'INSERT INTO tasks (userId, title, description, dueDate, status, filePaths) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        title.trim(),
        description?.trim() || null,
        dueDate || null,
        status || 'pending',
        JSON.stringify(filePaths)
      ]
    );
    
    const taskId = result.insertId;
    return await this.findById(taskId, userId);
  }

  static async findById(taskId, userId) {
    const [rows] = await db.execute(
      'SELECT id, userId, title, description, dueDate, status, filePaths, createdAt, updatedAt FROM tasks WHERE id = ? AND userId = ?',
      [taskId, userId]
    );
    return rows[0] || null;
  }

  static async getTaskById(userId, taskId) {
    if (!taskId || isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    const task = await this.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Parse filePaths JSON
    if (task.filePaths) {
      task.filePaths = JSON.parse(task.filePaths);
    }
    
    return task;
  }

  static async getUserTasks(userId, options = {}) {
    const { limit = 10, cursor, status } = options;
    
    // Validate limit
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    
    // Validate status
    if (status && !['pending', 'completed'].includes(status)) {
      throw new Error('Status must be either "pending" or "completed"');
    }
    
    let query = 'SELECT id, userId, title, description, dueDate, status, filePaths, createdAt, updatedAt FROM tasks WHERE userId = ?';
    let params = [userId];
    
    // Add status filter
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    // Add cursor-based pagination
    if (cursor) {
      query += ' AND id > ?';
      params.push(cursor);
    }
    
    // Add ordering and limit
    query += ' ORDER BY id ASC LIMIT ?';
    params.push(parsedLimit + 1); // Get one extra to check if there are more
    
    const [rows] = await db.execute(query, params);
    
    let tasks = rows;
    let hasMore = false;
    
    // Check if there are more results
    if (tasks.length > parsedLimit) {
      hasMore = true;
      tasks = tasks.slice(0, parsedLimit);
    }
    
    // Parse filePaths JSON for each task
    tasks = tasks.map(task => {
      if (task.filePaths) {
        task.filePaths = JSON.parse(task.filePaths);
      }
      return task;
    });
    
    const nextCursor = tasks.length > 0 ? tasks[tasks.length - 1].id : null;
    
    return {
      tasks,
      pagination: {
        hasMore,
        nextCursor: hasMore ? nextCursor : null
      }
    };
  }

  static async updateTask(userId, taskId, updateData, files = []) {
    if (!taskId || isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    // Check if task exists and belongs to user
    const existingTask = await this.findById(taskId, userId);
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
    
    // Handle file uploads
    if (files && files.length > 0) {
      // Delete old files if they exist
      if (existingTask.filePaths) {
        const oldFilePaths = JSON.parse(existingTask.filePaths);
        for (const filePath of oldFilePaths) {
          try {
            await fs.unlink(filePath);
          } catch (error) {
            // File might not exist, continue
            console.warn('Could not delete old file:', error.message);
          }
        }
      }
      
      // Add new file paths
      const newFilePaths = files.map(file => file.path);
      updatedData.filePaths = JSON.stringify(newFilePaths);
    }
    
    // Build update query
    const updateFields = [];
    const updateParams = [];
    
    Object.keys(updatedData).forEach(key => {
      updateFields.push(`${key} = ?`);
      updateParams.push(updatedData[key]);
    });
    
    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }
    
    updateParams.push(taskId, userId);
    
    const [result] = await db.execute(
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND userId = ?`,
      updateParams
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Failed to update task');
    }
    
    return await this.findById(taskId, userId);
  }

  static async deleteTask(userId, taskId) {
    if (!taskId || isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    // Check if task exists and belongs to user
    const task = await this.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    
    // Delete associated files if they exist
    if (task.filePaths) {
      const filePaths = JSON.parse(task.filePaths);
      for (const filePath of filePaths) {
        try {
          await fs.unlink(filePath);
        } catch (error) {
          // File might not exist, continue with task deletion
          console.warn('Could not delete task file:', error.message);
        }
      }
    }
    
    // Delete task (hard delete)
    const [result] = await db.execute(
      'DELETE FROM tasks WHERE id = ? AND userId = ?',
      [taskId, userId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Failed to delete task');
    }
    
    return true;
  }

  static async getTaskFilePath(userId, taskId, fileName) {
    const task = await this.findById(taskId, userId);
    if (!task || !task.filePaths) {
      return null;
    }
    
    const filePaths = JSON.parse(task.filePaths);
    const filePath = filePaths.find(path => path.includes(fileName));
    
    return filePath || null;
  }
}

module.exports = TaskService;