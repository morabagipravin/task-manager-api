const AuthService = require('../task-manager-api/services/authService');

class AuthController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;
      
      const result = await AuthService.register({ username, email, password });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { identifier, password } = req.body;
      
      const result = await AuthService.login(identifier, password);
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }

  static async getProfile(req, res) {
    try {
      const userId = req.user.userId;
      const user = await AuthService.getUserById(userId);
      
      res.json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  static async updateProfile(req, res) {
    try {
      const userId = req.user.userId;
      const updateData = req.body;
      
      const user = await AuthService.updateUser(userId, updateData);
      
      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: {
          user
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async deleteAccount(req, res) {
    try {
      const userId = req.user.userId;
      
      await AuthService.deleteUser(userId);
      
      res.json({
        success: true,
        message: 'Account deleted successfully'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async refreshToken(req, res) {
    try {
      const userId = req.user.userId;
      
      // Generate new token
      const token = AuthService.generateToken(userId);
      const user = await AuthService.getUserById(userId);
      
      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          user,
          token
        }
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;