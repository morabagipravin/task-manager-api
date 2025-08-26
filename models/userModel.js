const db = require('../config/db');

class UserModel {
  static async create(userData) {
    const { username, email, password } = userData;
    const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    const [result] = await db.execute(query, [username, email, password]);
    return result.insertId;
  }

  static async findByEmail(email) {
    const query = 'SELECT * FROM users WHERE email = ?';
    const [rows] = await db.execute(query, [email]);
    return rows[0];
  }

  static async findByUsername(username) {
    const query = 'SELECT * FROM users WHERE username = ?';
    const [rows] = await db.execute(query, [username]);
    return rows[0];
  }

  static async findByEmailOrUsername(identifier) {
    const query = 'SELECT * FROM users WHERE email = ? OR username = ?';
    const [rows] = await db.execute(query, [identifier, identifier]);
    return rows[0];
  }

  static async findById(id) {
    const query = 'SELECT id, username, email, created_at FROM users WHERE id = ?';
    const [rows] = await db.execute(query, [id]);
    return rows[0];
  }

  static async update(id, userData) {
    const fields = [];
    const values = [];
    
    Object.keys(userData).forEach(key => {
      if (userData[key] !== undefined) {
        fields.push(`${key} = ?`);
        values.push(userData[key]);
      }
    });
    
    if (fields.length === 0) return false;
    
    values.push(id);
    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  static async delete(id) {
    const query = 'DELETE FROM users WHERE id = ?';
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }
}

module.exports = UserModel;