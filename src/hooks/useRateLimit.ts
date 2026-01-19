import { useState, useCallback } from 'react';
import { SecurityUtils } from '@/utils/security';

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
}

export const useRateLimit = (config: RateLimitConfig) => {
  const [rateLimiter] = useState(() => 
    SecurityUtils.createRateLimiter(config.maxAttempts, config.windowMs)
  );

  const checkRateLimit = useCallback((identifier: string): boolean => {
    return rateLimiter.isAllowed(identifier);
  }, [rateLimiter]);

  const resetRateLimit = useCallback((identifier: string) => {
    rateLimiter.reset(identifier);
  }, [rateLimiter]);

  return { checkRateLimit, resetRateLimit };
};

// Usage examples:
// const loginRateLimit = useRateLimit({ maxAttempts: 5, windowMs: 15 * 60 * 1000 }); // 5 attempts per 15 min
// const messageRateLimit = useRateLimit({ maxAttempts: 10, windowMs: 60 * 1000 }); // 10 messages per minute
