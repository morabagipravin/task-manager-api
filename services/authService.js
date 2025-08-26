const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

class AuthService {
  static async register(userData) {
    const { username, email, password } = userData;
    
    // Basic validation
    if (!username || !email || !password) {
      throw new Error('Username, email, and password are required');
    }
    
    if (password.length < 6) {
      throw new Error('Password must be at least 6 characters long');
    }
    
    // Check if user already exists
    const existingUser = await UserModel.findByEmailOrUsername(email);
    if (existingUser) {
      throw new Error('User with this email or username already exists');
    }
    
    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    
    // Create user
    const userId = await UserModel.create({
      username,
      email,
      password: hashedPassword
    });
    
    // Generate JWT token
    const token = this.generateToken(userId);
    
    // Get user data without password
    const user = await UserModel.findById(userId);
    
    return { user, token };
  }

  static async login(identifier, password) {
    // Basic validation
    if (!identifier || !password) {
      throw new Error('Email/username and password are required');
    }
    
    // Find user by email or username
    const user = await UserModel.findByEmailOrUsername(identifier);
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

  static async getUserById(userId) {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }
    return user;
  }

  static async updateUser(userId, updateData) {
    const { password, ...otherData } = updateData;
    
    // If password is being updated, hash it
    if (password) {
      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters long');
      }
      const saltRounds = 10;
      otherData.password = await bcrypt.hash(password, saltRounds);
    }
    
    const updated = await UserModel.update(userId, otherData);
    if (!updated) {
      throw new Error('Failed to update user');
    }
    
    return await UserModel.findById(userId);
  }

  static async deleteUser(userId) {
    const deleted = await UserModel.delete(userId);
    if (!deleted) {
      throw new Error('Failed to delete user');
    }
    return true;
  }
}

module.exports = AuthService;