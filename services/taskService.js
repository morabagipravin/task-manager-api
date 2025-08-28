const db = require('../config/db');
const path = require('path');
const fs = require('fs').promises;

function parseFilePaths(maybeJson) {
  if (!maybeJson) return [];
  try {
    const val = JSON.parse(maybeJson);
    return Array.isArray(val) ? val : [maybeJson];
  } catch (_) {
    return [maybeJson];
  }
}

class TaskService {
  static async createTask(userId, taskData, files = []) {
    const { title, description, dueDate, status } = taskData;
    
    if (!title || title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    
    const validStatuses = ['pending', 'completed'];
    if (status && !validStatuses.includes(status)) {
      throw new Error('Status must be either "pending" or "completed"');
    }
    
    if (dueDate) {
      const date = new Date(dueDate);
      if (isNaN(date.getTime())) {
        throw new Error('Invalid due date format');
      }
    }
    
    let filePaths = [];
    if (files && files.length > 0) {
      filePaths = files.map(file => file.path);
    }
    
    const [result] = await db.execute(
      'INSERT INTO tasks (user_id, title, description, due_date, status, file_path) VALUES (?, ?, ?, ?, ?, ?)',
      [
        userId,
        title.trim(),
        description?.trim() || null,
        dueDate || null,
        status || 'pending',
        filePaths.length ? JSON.stringify(filePaths) : null
      ]
    );
    
    const taskId = result.insertId;
    return await this.findById(taskId, userId);
  }

  static async findById(taskId, userId) {
    const [rows] = await db.execute(
      'SELECT id, user_id AS userId, title, description, due_date AS dueDate, status, file_path AS filePath, created_at AS createdAt, updated_at AS updatedAt FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );
    const task = rows[0] || null;
    if (!task) return null;
    const filePaths = parseFilePaths(task.filePath);
    delete task.filePath;
    return { ...task, filePaths };
  }

  static async getTaskById(userId, taskId) {
    if (!taskId || isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    
    const task = await this.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    return task;
  }

  static async getUserTasks(userId, options = {}) {
    const { limit = 10, cursor, status } = options;
    const parsedLimit = Math.min(Math.max(parseInt(limit) || 10, 1), 100);
    if (status && !['pending', 'completed'].includes(status)) {
      throw new Error('Status must be either "pending" or "completed"');
    }
    
    let query = 'SELECT id, user_id AS userId, title, description, due_date AS dueDate, status, file_path AS filePath, created_at AS createdAt, updated_at AS updatedAt FROM tasks WHERE user_id = ?';
    const params = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }

    const cursorId = Number(cursor);
    if (Number.isFinite(cursorId) && cursorId > 0) {
      query += ' AND id > ?';
      params.push(cursorId);
    }

    // Inline LIMIT value to avoid ER_WRONG_ARGUMENTS with bound params in some MySQL versions
    query += ` ORDER BY id ASC LIMIT ${parsedLimit + 1}`;
    
    const [rows] = await db.execute(query, params);
    let tasks = rows.map(row => {
      const filePaths = parseFilePaths(row.filePath);
      delete row.filePath;
      return { ...row, filePaths };
    });
    let hasMore = false;
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
  }

  static async updateTask(userId, taskId, updateData, files = []) {
    if (!taskId || isNaN(taskId)) {
      throw new Error('Invalid task ID');
    }
    const existingTask = await this.findById(taskId, userId);
    if (!existingTask) {
      throw new Error('Task not found');
    }
    
    const { title, description, dueDate, status } = updateData;
    const updatedData = {};
    
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
        updatedData.due_date = dueDate;
      } else {
        updatedData.due_date = null;
      }
    }
    if (status !== undefined) {
      const validStatuses = ['pending', 'completed'];
      if (!validStatuses.includes(status)) {
        throw new Error('Status must be either "pending" or "completed"');
      }
      updatedData.status = status;
    }
    
    if (files && files.length > 0) {
      const oldFilePaths = existingTask.filePaths || [];
      for (const filePath of oldFilePaths) {
        try { await fs.unlink(filePath); } catch (_) {}
      }
      const newFilePaths = files.map(file => file.path);
      updatedData.file_path = JSON.stringify(newFilePaths);
    }
    
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
      `UPDATE tasks SET ${updateFields.join(', ')} WHERE id = ? AND user_id = ?`,
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
    const task = await this.findById(taskId, userId);
    if (!task) {
      throw new Error('Task not found');
    }
    const filePaths = task.filePaths || [];
    for (const fp of filePaths) {
      try { await fs.unlink(fp); } catch (_) {}
    }
    const [result] = await db.execute(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [taskId, userId]
    );
    if (result.affectedRows === 0) {
      throw new Error('Failed to delete task');
    }
    return true;
  }

  static async getTaskFilePath(userId, taskId, fileName) {
    const task = await this.findById(taskId, userId);
    if (!task) return null;
    const filePath = (task.filePaths || []).find(p => path.basename(p) === fileName || p.includes(fileName));
    return filePath || null;
  }
}

module.exports = TaskService;