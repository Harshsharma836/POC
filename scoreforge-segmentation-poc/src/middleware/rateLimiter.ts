import rateLimit from 'express-rate-limit';
import { Request, Response } from 'express';
import { redisClient } from '../config/redis';
import { AuthenticatedRequest } from './auth';

/**
 * Enhanced Rate Limiting
 * Multiple layers of protection against API abuse
 */

// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req: Request) => {
    // Skip rate limiting for health checks
    return req.path === '/health';
  },
});

// Stricter rate limiter for score submissions (per IP)
export const submitScoreLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Reduced from 60 to 10 - more strict
  message: 'Too many score submissions. Maximum 10 submissions per minute.',
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

// Per-user rate limiter (using Redis)
export async function perUserRateLimit(
  userId: number,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }> {
  const key = `rate_limit:user:${userId}`;
  const current = await redisClient.incr(key);

  if (current === 1) {
    // First request, set expiration
    await redisClient.expire(key, windowSeconds);
  }

  const remaining = Math.max(0, maxRequests - current);

  return {
    allowed: current <= maxRequests,
    remaining,
  };
}

// Middleware for per-user rate limiting
export async function userRateLimitMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: Function
): Promise<void> {
  // Only apply if user is authenticated
  if (!req.userId) {
    return next();
  }

  const userId = req.userId;
  const maxRequests = 20; // Max 20 score submissions per hour per user
  const windowSeconds = 3600; // 1 hour

  const { allowed, remaining } = await perUserRateLimit(userId, maxRequests, windowSeconds);

  if (!allowed) {
    res.status(429).json({
      success: false,
      error: `Rate limit exceeded. Maximum ${maxRequests} score submissions per hour.`,
      retryAfter: windowSeconds,
    });
    return;
  }

  // Add remaining requests to response headers
  res.setHeader('X-RateLimit-Remaining', remaining.toString());
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());

  next();
}

