import { Request, Response } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export class AuthController {
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { username } = req.body;

      if (!username) {
        res.status(400).json({
          success: false,
          error: 'Username is required',
        });
        return;
      }

      const result = await authService.login(username);

      if (!result.success) {
        res.status(401).json({
          success: false,
          error: result.error || 'Login failed',
        });
        return;
      }

      res.status(200).json({
        success: true,
        token: result.token,
        user: result.user,
      });
    } catch (error) {
      console.error('Login controller error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }

  async verifyToken(req: Request, res: Response): Promise<void> {
    try {
      const authHeader = req.headers.authorization;
      
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({
          success: false,
          error: 'No token provided',
        });
        return;
      }

      const token = authHeader.substring(7); // Remove 'Bearer ' prefix
      const decoded = authService.verifyToken(token);

      if (!decoded) {
        res.status(401).json({
          success: false,
          error: 'Invalid or expired token',
        });
        return;
      }

      res.status(200).json({
        success: true,
        user: decoded,
      });
    } catch (error) {
      console.error('Token verification error:', error);
      res.status(500).json({
        success: false,
        error: 'Internal server error',
      });
    }
  }
}

