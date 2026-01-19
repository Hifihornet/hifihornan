// Security utilities for input validation and sanitization

export class SecurityUtils {
  // Sanitize HTML to prevent XSS
  static sanitizeHtml(input: string): string {
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
  }

  // Validate and sanitize user input
  static sanitizeInput(input: string, maxLength: number = 1000): string {
    if (!input) return '';
    
    // Remove potentially dangerous characters
    const sanitized = input
      .replace(/[<>]/g, '') // Remove < and >
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, '') // Remove event handlers
      .substring(0, maxLength);
    
    return sanitized.trim();
  }

  // Validate email format
  static isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Validate phone number (Swedish format)
  static isValidPhone(phone: string): boolean {
    const phoneRegex = /^(\+46|0)[\d\s-]{8,15}$/;
    return phoneRegex.test(phone);
  }

  // Rate limiting helper
  static createRateLimiter(maxAttempts: number, windowMs: number) {
    const attempts = new Map<string, number[]>();
    
    return {
      isAllowed: (identifier: string): boolean => {
        const now = Date.now();
        const userAttempts = attempts.get(identifier) || [];
        
        // Remove old attempts outside window
        const recentAttempts = userAttempts.filter(time => now - time < windowMs);
        
        if (recentAttempts.length >= maxAttempts) {
          return false;
        }
        
        recentAttempts.push(now);
        attempts.set(identifier, recentAttempts);
        return true;
      },
      
      reset: (identifier: string) => {
        attempts.delete(identifier);
      }
    };
  }

  // CSRF protection helper
  static generateCSRFToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  // Content Security Policy helper
  static getCSPHeader(): string {
    return [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://inupyxotrnparxupvujz.supabase.co",
      "font-src 'self'",
      "object-src 'none'",
      "media-src 'self'",
      "frame-src 'none'"
    ].join('; ');
  }
}
