const AuthService = require('../services/authService');
const logger = require('../config/logger');

class AuthController {
  static async signup(req, res) {
    try {
      const { username, email, password } = req.body;
      
      const result = await AuthService.signup({ username, email, password });
      
      logger.info('User registered successfully', { email });
      
      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      logger.error('Registration failed:', error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  static async login(req, res) {
    try {
      const { username, email, password } = req.body;
      
      // Allow login with either username or email
      const identifier = username || email;
      if (!identifier) {
        return res.status(400).json({
          success: false,
          message: 'Username or email is required'
        });
      }
      
      const result = await AuthService.login(identifier, password);
      
      logger.info('User logged in successfully', { identifier });
      
      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: result.user,
          token: result.token
        }
      });
    } catch (error) {
      logger.error('Login failed:', error);
      res.status(401).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = AuthController;