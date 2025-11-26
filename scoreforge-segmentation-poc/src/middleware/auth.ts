import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';

const authService = new AuthService();

export interface AuthenticatedRequest extends Request {
  userId?: number;
  username?: string;
}

export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({
      success: false,
      error: 'Authentication required. Please login first.',
    });
    return;
  }

  const token = authHeader.substring(7); // Remove 'Bearer ' prefix
  const decoded = authService.verifyToken(token);

  if (!decoded) {
    res.status(401).json({
      success: false,
      error: 'Invalid or expired token. Please login again.',
    });
    return;
  }

  req.userId = decoded.userId;
  req.username = decoded.username;

  next();
}

export function optionalAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization;

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = authService.verifyToken(token);

    if (decoded) {
      req.userId = decoded.userId;
      req.username = decoded.username;
    }
  }

  next();
}

