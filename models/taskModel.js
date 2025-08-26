const db = require('../config/db');

class TaskModel {
  static async create(taskData) {
    const { title, description, dueDate, status, filePath, userId } = taskData;
    const query = 'INSERT INTO tasks (title, description, due_date, status, file_path, user_id) VALUES (?, ?, ?, ?, ?, ?)';
    const [result] = await db.execute(query, [title, description, dueDate, status || 'pending', filePath, userId]);
    return result.insertId;
  }

  static async findById(id, userId) {
    const query = 'SELECT * FROM tasks WHERE id = ? AND user_id = ?';
    const [rows] = await db.execute(query, [id, userId]);
    return rows[0];
  }

  static async findByUserId(userId, options = {}) {
    const { limit = 10, cursor, status } = options;
    
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    let params = [userId];
    
    // Add status filter if provided
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    // Add cursor-based pagination
    if (cursor) {
      query += ' AND id < ?';
      params.push(cursor);
    }
    
    query += ' ORDER BY id DESC LIMIT ?';
    params.push(parseInt(limit));
    
    const [rows] = await db.execute(query, params);
    return rows;
  }

  static async update(id, userId, taskData) {
    const fields = [];
    const values = [];
    
    Object.keys(taskData).forEach(key => {
      if (taskData[key] !== undefined) {
        // Convert camelCase to snake_case for database columns
        const dbKey = key === 'dueDate' ? 'due_date' : 
                     key === 'filePath' ? 'file_path' : key;
        fields.push(`${dbKey} = ?`);
        values.push(taskData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id, userId);
    const query = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id, userId) {
    const query = 'DELETE FROM tasks WHERE id = ? AND user_id = ?';
    const [result] = await db.execute(query, [id, userId]);
    return result.affectedRows > 0;
  }

  static async getTasksCount(userId, status = null) {
    let query = 'SELECT COUNT(*) as count FROM tasks WHERE user_id = ?';
    let params = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    const [rows] = await db.execute(query, params);
    return rows[0].count;
  }

  static async getUserTasks(userId, options = {}) {
    const { page = 1, limit = 10, status, sortBy = 'created_at', sortOrder = 'DESC' } = options;
    const offset = (page - 1) * limit;
    
    let query = 'SELECT * FROM tasks WHERE user_id = ?';
    let params = [userId];
    
    if (status) {
      query += ' AND status = ?';
      params.push(status);
    }
    
    const validSortFields = ['id', 'title', 'due_date', 'status', 'created_at', 'updated_at'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    
    query += ` ORDER BY ${sortField} ${order} LIMIT ? OFFSET ?`;
    params.push(parseInt(limit), parseInt(offset));
    
    const [rows] = await db.execute(query, params);
    return rows;
  }
}

module.exports = TaskModel;