import { logger } from '../utils/logger';

/**
 * Simple in-memory token blacklist service
 * In production, this should be replaced with Redis or database storage
 */
class TokenBlacklistService {
  private blacklistedTokens: Set<string> = new Set();
  private tokenExpiries: Map<string, number> = new Map();

  /**
   * Add a token to the blacklist
   * @param token - The JWT token to blacklist
   * @param expiryTime - When the token expires (timestamp)
   */
  blacklistToken(token: string, expiryTime: number): void {
    this.blacklistedTokens.add(token);
    this.tokenExpiries.set(token, expiryTime);
    logger.info('Token blacklisted', { tokenPreview: token.substring(0, 20) + '...' });
    
    // Clean up expired tokens periodically
    this.cleanupExpiredTokens();
  }

  /**
   * Check if a token is blacklisted
   * @param token - The JWT token to check
   * @returns true if the token is blacklisted
   */
  isTokenBlacklisted(token: string): boolean {
    return this.blacklistedTokens.has(token);
  }

  /**
   * Remove expired tokens from the blacklist
   */
  private cleanupExpiredTokens(): void {
    const now = Date.now() / 1000; // Convert to seconds
    
    for (const [token, expiry] of this.tokenExpiries.entries()) {
      if (expiry < now) {
        this.blacklistedTokens.delete(token);
        this.tokenExpiries.delete(token);
      }
    }
  }

  /**
   * Get the number of blacklisted tokens (for monitoring)
   */
  getBlacklistSize(): number {
    return this.blacklistedTokens.size;
  }

  /**
   * Clear all blacklisted tokens (for testing purposes)
   */
  clearBlacklist(): void {
    this.blacklistedTokens.clear();
    this.tokenExpiries.clear();
    logger.info('Token blacklist cleared');
  }
}

export const tokenBlacklistService = new TokenBlacklistService();