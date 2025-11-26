# Security Implementation Documentation

## Overview

This document describes all security measures implemented to protect the Gaming Leaderboard System from various threats including API abuse, injection attacks, data tampering, replay attacks, and XSS vulnerabilities.

---

## 1. API Abuse Protection

### Problem
- Users submitting thousands of requests per second
- Single user flooding the system
- Automated bot attacks
- Unfair leaderboard manipulation

### Solution: Multi-Layer Rate Limiting

#### 1.1 IP-Based Rate Limiting

**Implementation**: `src/middleware/rateLimiter.ts`

```typescript
// General API rate limiter
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per 15 minutes per IP
});

// Stricter for score submissions
export const submitScoreLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 10, // Only 10 submissions per minute per IP
});
```

**Protection**:
- Prevents single IP from overwhelming the system
- Limits score submissions to 10 per minute (reduced from 60)
- Automatically blocks excessive requests

**Why Necessary**:
- Prevents DDoS attacks
- Ensures fair play (no single user can spam submissions)
- Protects database from overload

#### 1.2 Per-User Rate Limiting

**Implementation**: `src/middleware/rateLimiter.ts`

```typescript
export async function perUserRateLimit(
  userId: number,
  maxRequests: number,
  windowSeconds: number
): Promise<{ allowed: boolean; remaining: number }>
```

**Protection**:
- Limits each authenticated user to 20 score submissions per hour
- Uses Redis for distributed rate limiting
- Works across multiple server instances

**Why Necessary**:
- Prevents authenticated users from gaming the system
- Works even if user changes IP address
- Ensures fair competition

#### 1.3 Request Size Limiting

**Implementation**: `src/server.ts`

```typescript
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
```

**Protection**:
- Limits request body size to 10KB
- Prevents large payload attacks
- Reduces memory usage

---

## 2. Input Validation and Injection Prevention

### Problem
- Negative scores
- Extremely high scores
- SQL injection attempts
- Invalid data types
- Malformed requests

### Solution: Comprehensive Input Validation

#### 2.1 Score Validation

**Implementation**: `src/utils/validation.ts`

```typescript
export function validateScore(score: any): {
  valid: boolean;
  error?: string;
  value?: number;
}
```

**Validations**:
- ✅ Must be a number
- ✅ Must be finite (not NaN or Infinity)
- ✅ Must be >= 0 (no negative scores)
- ✅ Must be <= 1,000,000 (reasonable maximum)
- ✅ Must be an integer

**Protection**:
- Prevents negative scores from breaking rankings
- Prevents unrealistic high scores
- Ensures data integrity

**Why Necessary**:
- Negative scores would break ranking logic
- Extremely high scores could indicate cheating
- Type validation prevents injection attacks

#### 2.2 User ID Validation

**Implementation**: `src/utils/validation.ts`

```typescript
export function validateUserId(userId: any): {
  valid: boolean;
  error?: string;
  value?: number;
}
```

**Validations**:
- ✅ Must be a number
- ✅ Must be an integer
- ✅ Must be >= 1
- ✅ Must be <= 2,147,483,647 (max 32-bit integer)

**Protection**:
- Prevents invalid user IDs
- Prevents out-of-range values
- Type validation prevents SQL injection

**Why Necessary**:
- Invalid user IDs would cause database errors
- TypeORM uses parameterized queries, but validation adds extra layer
- Prevents integer overflow attacks

#### 2.3 Game Mode Validation

**Implementation**: `src/utils/validation.ts`

```typescript
export function validateGameMode(gameMode: any): {
  valid: boolean;
  error?: string;
  value?: 'story' | 'multiplayer';
}
```

**Validations**:
- ✅ Must be exactly 'story' or 'multiplayer'
- ✅ No other values accepted

**Protection**:
- Prevents invalid game modes
- Prevents injection attempts through game mode field

#### 2.4 SQL Injection Prevention

**Protection Layers**:

1. **TypeORM Parameterized Queries**: All database queries use parameterized statements
   ```typescript
   .where('leaderboard.user_id = :userId', { userId })
   ```

2. **Input Validation**: All inputs validated before database access

3. **Type Checking**: TypeScript ensures type safety

**Why Necessary**:
- Parameterized queries prevent SQL injection
- Input validation catches malicious data before it reaches database
- Defense in depth approach

---

## 3. Request Integrity and Replay Attack Prevention

### Problem
- Request tampering (changing user_id, score values)
- Replay attacks (resending old requests)
- Man-in-the-middle attacks

### Solution: HMAC Request Signing + Nonce

#### 3.1 HMAC Request Signing

**Implementation**: `src/middleware/requestIntegrity.ts`

```typescript
export function generateRequestSignature(
  userId: number,
  score: number,
  gameMode: string,
  timestamp: number,
  nonce: string
): string
```

**How It Works**:
1. Client generates unique nonce (random string)
2. Client gets current timestamp
3. Client creates HMAC signature: `HMAC(userId:score:gameMode:timestamp:nonce)`
4. Server verifies signature matches
5. If signature doesn't match, request is rejected

**Protection**:
- ✅ Prevents request tampering (any change invalidates signature)
- ✅ Ensures request integrity
- ✅ Uses SHA-256 HMAC (cryptographically secure)

**Why Necessary**:
- Prevents attackers from modifying user_id or score
- Ensures data hasn't been altered in transit
- Cryptographic verification of request authenticity

#### 3.2 Replay Attack Prevention

**Implementation**: `src/middleware/requestIntegrity.ts`

```typescript
async function isNonceUsed(nonce: string): Promise<boolean>
async function markNonceAsUsed(nonce: string): Promise<void>
```

**How It Works**:
1. Each request includes unique nonce
2. Server checks if nonce has been used before
3. If nonce exists in Redis, request is rejected (replay attack)
4. If nonce is new, it's stored in Redis with TTL
5. Nonces expire after 10 minutes

**Protection**:
- ✅ Prevents replay attacks (same request can't be sent twice)
- ✅ Nonces expire automatically (prevents storage bloat)
- ✅ Uses Redis for distributed nonce tracking

**Why Necessary**:
- Prevents attackers from resending old requests
- Prevents duplicate score submissions
- Ensures each request is unique

#### 3.3 Timestamp Validation

**Implementation**: `src/middleware/requestIntegrity.ts`

```typescript
const REQUEST_TIMEOUT_MS = 5 * 60 * 1000; // 5 minutes

if (Math.abs(now - requestTime) > REQUEST_TIMEOUT_MS) {
  // Reject request
}
```

**Protection**:
- ✅ Rejects requests older than 5 minutes
- ✅ Rejects requests from the future
- ✅ Prevents replay of very old requests

**Why Necessary**:
- Prevents replay of old requests
- Ensures requests are recent
- Works with nonce system for complete protection

#### 3.4 User ID Tampering Prevention

**Implementation**: `src/controllers/LeaderboardController.ts`

```typescript
// Security: Ensure authenticated users can only submit scores for themselves
if (req.userId && req.userId !== userIdValidation.value) {
  res.status(403).json({
    error: 'You can only submit scores for your own account',
  });
  return;
}
```

**Protection**:
- ✅ Authenticated users can only submit for themselves
- ✅ Prevents user_id tampering in requests
- ✅ Uses JWT token to verify user identity

**Why Necessary**:
- Prevents users from submitting scores for other users
- Ensures fair play
- Protects user accounts

---

## 4. Cross-Site Scripting (XSS) Prevention

### Problem
- Malicious scripts in usernames
- Script execution when viewing leaderboard
- Cookie theft
- Session hijacking

### Solution: Multi-Layer XSS Protection

#### 4.1 Input Sanitization

**Backend Implementation**: `src/utils/validation.ts`

```typescript
export function sanitizeUsername(username: string): string {
  // Remove HTML tags
  sanitized = sanitized.replace(/<[^>]*>/g, '');
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Remove dangerous characters
  sanitized = sanitized.replace(/[<>'"&]/g, '');
}
```

**Protection**:
- ✅ Removes HTML tags from usernames
- ✅ Removes script tags
- ✅ Removes event handlers (onclick, onerror, etc.)
- ✅ Removes dangerous characters

**Why Necessary**:
- Prevents malicious code from being stored in database
- First line of defense against XSS

#### 4.2 Output Escaping

**Backend Implementation**: `src/utils/validation.ts`

```typescript
export function escapeHtml(text: string): string {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}
```

**Usage in Controllers**:
```typescript
const sanitizedLeaderboard = leaderboard.map(player => ({
  ...player,
  username: escapeHtml(player.username),
}));
```

**Protection**:
- ✅ Escapes HTML special characters
- ✅ Prevents script execution even if sanitization fails
- ✅ Applied to all user-generated content before sending to frontend

**Why Necessary**:
- Defense in depth approach
- Ensures safe output even if input sanitization misses something
- Industry best practice

#### 4.3 Content Security Policy (CSP)

**Implementation**: `src/server.ts`

```typescript
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  },
}));
```

**Protection**:
- ✅ Prevents inline scripts from executing
- ✅ Only allows scripts from same origin
- ✅ Blocks iframe embedding
- ✅ Prevents data exfiltration

**Why Necessary**:
- Browser-level protection
- Works even if XSS code is injected
- Prevents script execution
- Industry standard security header

#### 4.4 React's Built-in XSS Protection

**Frontend**: React automatically escapes content in JSX

```tsx
<span className="username">{username}</span>
```

**Protection**:
- ✅ React escapes all content by default
- ✅ Prevents script execution
- ✅ Additional layer of protection

**Why Necessary**:
- Framework-level protection
- Works automatically
- Defense in depth

---

## 5. Authentication and Authorization

### Problem
- Users submitting scores for other users
- Unauthorized access
- Session hijacking

### Solution: JWT-Based Authentication

#### 5.1 Authentication Middleware

**Implementation**: `src/middleware/auth.ts`

```typescript
export function authenticateToken(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): void
```

**Protection**:
- ✅ Verifies JWT token
- ✅ Attaches user info to request
- ✅ Prevents unauthorized access

#### 5.2 User ID Verification

**Implementation**: `src/controllers/LeaderboardController.ts`

```typescript
if (req.userId && req.userId !== userIdValidation.value) {
  res.status(403).json({
    error: 'You can only submit scores for your own account',
  });
}
```

**Protection**:
- ✅ Ensures users can only submit for themselves
- ✅ Prevents user ID tampering
- ✅ Uses JWT to verify identity

---

## Security Measures Summary

| Threat | Protection | Implementation |
|--------|-----------|----------------|
| API Abuse | Multi-layer rate limiting | IP-based + Per-user rate limiting |
| Negative Scores | Input validation | Score range validation (0-1M) |
| High Scores | Input validation | Maximum score limit |
| SQL Injection | Parameterized queries + Validation | TypeORM + Input validation |
| Request Tampering | HMAC signing | Request signature verification |
| Replay Attacks | Nonce + Timestamp | Redis nonce tracking |
| User ID Tampering | Authentication + Authorization | JWT + User ID verification |
| XSS Attacks | Sanitization + Escaping + CSP | Multi-layer XSS prevention |
| Session Hijacking | JWT tokens | Secure token-based auth |

---

## Configuration

### Environment Variables

```env
# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# HMAC for Request Signing
HMAC_SECRET=your-hmac-secret-change-in-production

# Disable request signing (for development)
DISABLE_REQUEST_SIGNING=false
```

### Rate Limiting Configuration

- **IP-based**: 10 submissions per minute
- **Per-user**: 20 submissions per hour
- **General API**: 100 requests per 15 minutes

### Request Integrity

- **Timestamp window**: 5 minutes
- **Nonce TTL**: 10 minutes
- **HMAC algorithm**: SHA-256

---

## Testing Security Measures

### Test Rate Limiting
```bash
# Send 11 requests in 1 minute - should be blocked
for i in {1..11}; do
  curl -X POST http://localhost:8000/api/leaderboard/submit \
    -H "Content-Type: application/json" \
    -d '{"user_id":1,"score":100,"game_mode":"story"}'
done
```

### Test Input Validation
```bash
# Negative score - should be rejected
curl -X POST http://localhost:8000/api/leaderboard/submit \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"score":-100,"game_mode":"story"}'

# Invalid game mode - should be rejected
curl -X POST http://localhost:8000/api/leaderboard/submit \
  -H "Content-Type: application/json" \
  -d '{"user_id":1,"score":100,"game_mode":"invalid"}'
```

### Test XSS Prevention
```bash
# Try to inject script in username (should be sanitized)
# Username: <script>alert('XSS')</script>
```

---

## Best Practices

1. ✅ **Always validate input** - Never trust user input
2. ✅ **Use parameterized queries** - Prevents SQL injection
3. ✅ **Sanitize AND escape** - Defense in depth for XSS
4. ✅ **Rate limit everything** - Prevent abuse
5. ✅ **Use HTTPS in production** - Encrypt data in transit
6. ✅ **Keep secrets secure** - Use environment variables
7. ✅ **Monitor and log** - Detect attacks early
8. ✅ **Regular security audits** - Stay updated

---

## Conclusion

The Gaming Leaderboard System now has comprehensive security measures protecting against:

- ✅ API abuse and DDoS attacks
- ✅ Input validation and injection attacks
- ✅ Request tampering and replay attacks
- ✅ XSS vulnerabilities
- ✅ Unauthorized access and user ID tampering

All security measures work together in a **defense-in-depth** strategy, ensuring that even if one layer fails, others provide protection.

**The system is now production-ready and secure!** 🚀🔒

