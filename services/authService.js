const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_EXPIRES_IN = '1h'; // 1 hour expiry as per requirements

class AuthService {
  static async signup(userData) {
    const { username, email, password } = userData;
    
    // Basic validation
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Check if user already exists
    const existingUser = await this.findByEmailOrUsername(email);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const [result] = await db.execute(
      'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
      [username, email, hashedPassword]
    );
    
    const userId = result.insertId;
    
    // Generate JWT token
    const token = this.generateToken(userId);
    
    // Get user data without password
    const user = await this.findById(userId);
    
    return { user, token };
  }

  static async login(identifier, password) {
    // Basic validation
    if (!identifier || !password) {
      throw new Error('Email/username and password are required');
    }
    
    // Find user by email or username
    const user = await this.findByEmailOrUsername(identifier);
    if (!user) {
      throw new Error('Invalid credentials');
    }
    
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }
    
    // Generate JWT token
    const token = this.generateToken(user.id);
    
    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    
    return { user: userWithoutPassword, token };
  }

  static generateToken(userId) {
    return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }

  static verifyToken(token) {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  static async findById(userId) {
    const [rows] = await db.execute(
      // Select only columns that are guaranteed to exist across schemas
      'SELECT id, username, email FROM users WHERE id = ?',
      [userId]
    );
    return rows[0] || null;
  }

  static async findByEmailOrUsername(identifier) {
    const [rows] = await db.execute(
      // Select only essential fields to avoid schema differences
      'SELECT id, username, email, password FROM users WHERE email = ? OR username = ?',
      [identifier, identifier]
    );
    return rows[0] || null;
  }
}

module.exports = AuthService;