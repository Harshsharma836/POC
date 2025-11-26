import { AppDataSource } from '../config/database';
import { User } from '../entities/User';
import jwt, { SignOptions } from 'jsonwebtoken';

const JWT_SECRET: string = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export interface LoginResult {
  success: boolean;
  token?: string;
  user?: {
    id: number;
    username: string;
  };
  error?: string;
}

export class AuthService {
  /**
   * Login with username (no password required)
   */
  async login(username: string): Promise<LoginResult> {
    try {
      // Validate username
      if (!username || typeof username !== 'string' || username.trim().length === 0) {
        return {
          success: false,
          error: 'Username is required',
        };
      }

      // Sanitize username (prevent XSS)
      const { sanitizeUsername: sanitize } = require('../utils/validation');
      const sanitizedUsername = sanitize(username);

      // Find user by username
      const user = await AppDataSource.getRepository(User).findOne({
        where: { username: sanitizedUsername },
      });

      if (!user) {
        return {
          success: false,
          error: 'User not found',
        };
      }

      const payload = {
        userId: user.id,
        username: user.username,
      };
      const token = jwt.sign(payload, JWT_SECRET, {
        expiresIn: '7d',
      });

      return {
        success: true,
        token,
        user: {
          id: user.id,
          username: user.username,
        },
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: 'Internal server error',
      };
    }
  }

  verifyToken(token: string): { userId: number; username: string } | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        userId: number;
        username: string;
      };
      return decoded;
    } catch (error) {
      return null;
    }
  }
}

