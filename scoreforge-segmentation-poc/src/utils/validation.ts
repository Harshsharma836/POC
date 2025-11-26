
export const SCORE_MIN = 0;
export const SCORE_MAX = 1000000;
export const USER_ID_MIN = 1;
export const USER_ID_MAX = 2147483647;
export const USERNAME_MIN_LENGTH = 1;
export const USERNAME_MAX_LENGTH = 50;


export function validateScore(score: any): { valid: boolean; error?: string; value?: number } {

  if (score === undefined || score === null) {
    return { valid: false, error: 'Score is required' };
  }

  if (typeof score !== 'number') {
    const parsed = Number(score);
    if (isNaN(parsed)) {
      return { valid: false, error: 'Score must be a number' };
    }
    score = parsed;
  }

  if (!isFinite(score)) {
    return { valid: false, error: 'Score must be a finite number' };
  }

  if (score < SCORE_MIN) {
    return { valid: false, error: `Score cannot be negative. Minimum: ${SCORE_MIN}` };
  }

  if (score > SCORE_MAX) {
    return { valid: false, error: `Score exceeds maximum allowed value: ${SCORE_MAX}` };
  }

  if (!Number.isInteger(score)) {
    return { valid: false, error: 'Score must be an integer' };
  }

  return { valid: true, value: score };
}

export function validateUserId(userId: any): { valid: boolean; error?: string; value?: number } {
  if (userId === undefined || userId === null) {
    return { valid: false, error: 'User ID is required' };
  }

  if (typeof userId !== 'number') {
    const parsed = parseInt(userId, 10);
    if (isNaN(parsed)) {
      return { valid: false, error: 'User ID must be a number' };
    }
    userId = parsed;
  }

  if (!Number.isInteger(userId)) {
    return { valid: false, error: 'User ID must be an integer' };
  }

  if (userId < USER_ID_MIN) {
    return { valid: false, error: `User ID must be at least ${USER_ID_MIN}` };
  }

  if (userId > USER_ID_MAX) {
    return { valid: false, error: `User ID exceeds maximum value: ${USER_ID_MAX}` };
  }

  return { valid: true, value: userId };
}


export function validateGameMode(gameMode: any): { valid: boolean; error?: string; value?: 'story' | 'multiplayer' } {
  if (!gameMode) {
    return { valid: false, error: 'Game mode is required' };
  }

  const validModes: ('story' | 'multiplayer')[] = ['story', 'multiplayer'];
  
  if (!validModes.includes(gameMode)) {
    return { valid: false, error: `Game mode must be one of: ${validModes.join(', ')}` };
  }

  return { valid: true, value: gameMode };
}

export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }

  let sanitized = username.trim();

  sanitized = sanitized.replace(/<[^>]*>/g, '');

  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');

  sanitized = sanitized.replace(/[<>'"&]/g, '');

  if (sanitized.length > USERNAME_MAX_LENGTH) {
    sanitized = sanitized.substring(0, USERNAME_MAX_LENGTH);
  }

  return sanitized;
}

export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };

  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export function validateLimit(limit: any): { valid: boolean; error?: string; value?: number } {
  if (limit === undefined || limit === null) {
    return { valid: true, value: 10 };
  }

  const parsed = parseInt(limit, 10);
  if (isNaN(parsed)) {
    return { valid: false, error: 'Limit must be a number' };
  }

  if (parsed < 1) {
    return { valid: false, error: 'Limit must be at least 1' };
  }

  if (parsed > 100) {
    return { valid: false, error: 'Limit cannot exceed 100' };
  }

  return { valid: true, value: parsed };
}

