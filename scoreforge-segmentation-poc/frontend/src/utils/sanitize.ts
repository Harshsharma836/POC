
export function escapeHtml(text: string): string {
  if (!text || typeof text !== 'string') {
    return '';
  }

  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * Sanitizes username for display
 * Removes potentially dangerous characters
 */
export function sanitizeUsername(username: string): string {
  if (!username || typeof username !== 'string') {
    return '';
  }

  // Remove HTML tags
  let sanitized = username.replace(/<[^>]*>/g, '');
  
  // Remove script tags
  sanitized = sanitized.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
  
  // Remove event handlers
  sanitized = sanitized.replace(/on\w+\s*=\s*["'][^"']*["']/gi, '');
  
  // Trim and limit length
  sanitized = sanitized.trim().substring(0, 50);
  
  return sanitized;
}

export function sanitizeNumber(value: any, min: number = 0, max: number = Infinity): number | null {
  if (value === undefined || value === null) {
    return null;
  }

  const num = typeof value === 'number' ? value : Number(value);
  
  if (isNaN(num) || !isFinite(num)) {
    return null;
  }

  if (num < min || num > max) {
    return null;
  }

  return Math.floor(num); // Ensure integer
}

