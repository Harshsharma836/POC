import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { redisClient } from '../config/redis';

const HMAC_SECRET = process.env.HMAC_SECRET || 'your-hmac-secret-change-in-production';
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes
const NONCE_TTL = 10 * 60; // 10 minutes in seconds


interface SignedRequest extends Request {
  body: {
    user_id?: number;
    score?: number;
    game_mode?: string;
    timestamp?: number;
    nonce?: string;
    signature?: string;
  };
}

/**
 * Generates HMAC signature for request
 */
export function generateRequestSignature(
  userId: number,
  score: number,
  gameMode: string,
  timestamp: number,
  nonce: string
): string {
  const message = `${userId}:${score}:${gameMode}:${timestamp}:${nonce}`;
  return crypto
    .createHmac('sha256', HMAC_SECRET)
    .update(message)
    .digest('hex');
}

/**
 * Verifies request signature
 */
function verifyRequestSignature(
  userId: number,
  score: number,
  gameMode: string,
  timestamp: number,
  nonce: string,
  signature: string
): boolean {
  const expectedSignature = generateRequestSignature(userId, score, gameMode, timestamp, nonce);
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
}

/**
 * Checks if nonce has been used before (replay attack prevention)
 */
async function isNonceUsed(nonce: string): Promise<boolean> {
  const key = `nonce:${nonce}`;
  const exists = await redisClient.exists(key);
  return exists === 1;
}

/**
 * Marks nonce as used
 */
async function markNonceAsUsed(nonce: string): Promise<void> {
  const key = `nonce:${nonce}`;
  await redisClient.setex(key, NONCE_TTL, '1');
}

/**
 * Request integrity middleware
 * Validates timestamp, nonce, and HMAC signature
 */
export async function validateRequestIntegrity(
  req: SignedRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  // For now, make it optional - can be enabled for production
  // Skip if signature validation is disabled
  if (process.env.DISABLE_REQUEST_SIGNING === 'true') {
    return next();
  }

  const { user_id, score, game_mode, timestamp, nonce, signature } = req.body;

  // Validate required fields
  if (!timestamp || !nonce || !signature) {
    // If signature fields are missing, allow request but log warning
    // In production, you might want to require signatures
    console.warn('Request missing integrity fields - allowing but logging');
    return next();
  }

  // Validate timestamp (prevent old requests)
  const now = Date.now();
  const requestTime = timestamp;

  if (Math.abs(now - requestTime) > REQUEST_TIMEOUT_MS) {
    res.status(400).json({
      success: false,
      error: 'Request timestamp is too old or too far in the future',
    });
    return;
  }

  // Check if nonce has been used (replay attack prevention)
  const nonceUsed = await isNonceUsed(nonce);
  if (nonceUsed) {
    res.status(400).json({
      success: false,
      error: 'Request has already been processed (replay attack detected)',
    });
    return;
  }

  // Verify HMAC signature
  if (!user_id || !score || !game_mode) {
    res.status(400).json({
      success: false,
      error: 'Missing required fields for signature verification',
    });
    return;
  }

  const isValid = verifyRequestSignature(
    user_id,
    score,
    game_mode,
    timestamp,
    nonce,
    signature
  );

  if (!isValid) {
    res.status(400).json({
      success: false,
      error: 'Invalid request signature (request may have been tampered with)',
    });
    return;
  }

  // Mark nonce as used
  await markNonceAsUsed(nonce);

  next();
}

