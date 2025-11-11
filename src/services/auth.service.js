/**
 * BlazeIoT Solutions - Authentication Service
 * JWT-based authentication and authorization
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config/config');
const dbService = require('./database.service');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Hash password
   */
  async hashPassword(password) {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
  }

  /**
   * Compare password with hash
   */
  async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }

  /**
   * Generate JWT token
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    };

    return jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    });
  }

  /**
   * Verify JWT token
   */
  verifyToken(token) {
    try {
      return jwt.verify(token, config.jwt.secret);
    } catch (error) {
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Authenticate user
   */
  async authenticate(username, password) {
    try {
      // Get user from database
      const user = await dbService.getUserByUsername(username);
      
      if (!user) {
        logger.warn(`Login attempt with invalid username: ${username}`);
        return { success: false, message: 'Invalid credentials' };
      }

      // Compare passwords
      const isValidPassword = await this.comparePassword(password, user.password_hash);
      
      if (!isValidPassword) {
        logger.warn(`Failed login attempt for user: ${username}`);
        return { success: false, message: 'Invalid credentials' };
      }

      // Update last login
      await dbService.updateLastLogin(username);

      // Generate token
      const token = this.generateToken(user);

      logger.info(`User logged in: ${username}`);
      
      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role,
        },
      };
    } catch (error) {
      logger.error('Authentication error:', error);
      throw error;
    }
  }

  /**
   * Create admin user (for initial setup)
   */
  async createAdminUser(username, password, email) {
    try {
      // Check if user already exists
      const existingUser = await dbService.getUserByUsername(username);
      
      if (existingUser) {
        logger.warn(`Admin user already exists: ${username}`);
        return { success: false, message: 'User already exists' };
      }

      // Hash password
      const password_hash = await this.hashPassword(password);

      // Create user
      const userId = await dbService.createUser({
        username,
        password_hash,
        email,
        role: 'admin',
      });

      logger.info(`Admin user created: ${username}`);
      
      return {
        success: true,
        userId,
        message: 'Admin user created successfully',
      };
    } catch (error) {
      logger.error('Error creating admin user:', error);
      throw error;
    }
  }

  /**
   * Middleware to protect routes
   */
  protect(req, res, next) {
    try {
      // Get token from header
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({
          success: false,
          message: 'No token provided',
        });
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix

      // Verify token
      const decoded = this.verifyToken(token);
      
      // Attach user to request
      req.user = decoded;
      
      next();
    } catch (error) {
      logger.warn('Token verification failed:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token',
      });
    }
  }

  /**
   * Middleware to check admin role
   */
  requireAdmin(req, res, next) {
    if (req.user && req.user.role === 'admin') {
      next();
    } else {
      return res.status(403).json({
        success: false,
        message: 'Admin access required',
      });
    }
  }
}

// Create singleton instance
const authService = new AuthService();

// Export middleware as bound functions to preserve 'this' context
module.exports = authService;
module.exports.protect = authService.protect.bind(authService);
module.exports.requireAdmin = authService.requireAdmin.bind(authService);
