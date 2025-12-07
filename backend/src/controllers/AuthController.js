import AuthService from '../services/AuthService.js';
import logger from '../config/logger.js';

class AuthController {
  /**
   * Register new user
   * POST /api/auth/register
   */
  async register(req, res, next) {
    try {
      const { fullName, email, password, role } = req.body;

      const result = await AuthService.register({
        fullName,
        email,
        password,
        role,
      });

      res.status(201).json({
        message: 'Registration successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const result = await AuthService.login(
        { email, password },
        {
          userAgent: req.headers['user-agent'],
          ipAddress: req.ip,
        }
      );

      res.json({
        message: 'Login successful',
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/auth/refresh
   */
  async refresh(req, res, next) {
    try {
      const { refreshToken } = req.body;

      const tokens = await AuthService.refresh(refreshToken);

      res.json({
        message: 'Token refreshed',
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(req, res, next) {
    try {
      const { refreshToken } = req.body;
      const accessToken = req.token;

      await AuthService.logout(refreshToken, accessToken);

      res.json({ message: 'Logout successful' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout from all devices
   * POST /api/auth/logout-all
   */
  async logoutAll(req, res, next) {
    try {
      await AuthService.logoutAll(req.userId);
      res.json({ message: 'Logged out from all devices' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   * GET /api/auth/verify-email
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.query;

      const result = await AuthService.verifyEmail(token);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(req, res, next) {
    try {
      const { email } = req.body;

      const result = await AuthService.forgotPassword(email);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/auth/reset-password
   */
  async resetPassword(req, res, next) {
    try {
      const { token, password } = req.body;

      const result = await AuthService.resetPassword(token, password);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getCurrentUser(req, res, next) {
    try {
      res.json({
        user: req.user.toPublicJSON(),
      });
    } catch (error) {
      next(error);
    }
  }
}

export default new AuthController();

