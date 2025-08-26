const jwt = require('jsonwebtoken');
const AuthService = require('../services/authService');
const logger = require('../config/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-key';

const authMiddleware = async (req, res, next) => {
  try {
    // Get token from header
    const authHeader = req.header('Authorization');
    
    if (!authHeader) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    // Check if token starts with 'Bearer '
    if (!authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token format. Use Bearer <token>'
      });
    }
    
    // Extract token
    const token = authHeader.substring(7); // Remove 'Bearer ' prefix
    
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }
    
    try {
      // Verify token
      const decoded = AuthService.verifyToken(token);
      
      // Check if user still exists
      const user = await AuthService.findById(decoded.userId);
      if (!user) {
        logger.warn('Token is valid but user no longer exists', { userId: decoded.userId });
        return res.status(401).json({
          success: false,
          message: 'Token is valid but user no longer exists.'
        });
      }
      
      // Add user info to request
      req.user = decoded;
      next();
      
    } catch (jwtError) {
      if (jwtError.name === 'TokenExpiredError') {
        logger.warn('Token expired', { token: token.substring(0, 10) + '...' });
        return res.status(401).json({
          success: false,
          message: 'Token has expired. Please login again.'
        });
      } else if (jwtError.name === 'JsonWebTokenError') {
        logger.warn('Invalid token provided');
        return res.status(401).json({
          success: false,
          message: 'Invalid token.'
        });
      } else {
        throw jwtError;
      }
    }
    
  } catch (error) {
    logger.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during authentication.'
    });
  }
};

module.exports = authMiddleware;