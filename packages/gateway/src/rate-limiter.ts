/**
 * Token bucket rate limiter.
 * Uses in-memory storage by default, Redis for production.
 */

interface Bucket {
  tokens: number;
  lastRefill: number;
}

export class RateLimiter {
  private buckets: Map<string, Bucket> = new Map();
  private capacity: number;
  private refillRate: number; // tokens per second

  constructor(capacity = 60, refillRate = 1) {
    this.capacity = capacity;
    this.refillRate = refillRate;
  }

  /**
   * Check if a request is allowed under the rate limit.
   * Returns true if allowed, false if rate limited.
   */
  check(key: string): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(key);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(key, bucket);
    }

    // Refill tokens based on elapsed time
    const elapsed = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(
      this.capacity,
      bucket.tokens + elapsed * this.refillRate
    );
    bucket.lastRefill = now;

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return true;
    }

    return false;
  }

  /**
   * Get remaining tokens for a key.
   */
  remaining(key: string): number {
    const bucket = this.buckets.get(key);
    return bucket ? Math.floor(bucket.tokens) : this.capacity;
  }

  /**
   * Clean up stale buckets (call periodically).
   */
  cleanup(): void {
    const cutoff = Date.now() - 60_000; // 1 minute
    for (const [key, bucket] of this.buckets) {
      if (bucket.lastRefill < cutoff && bucket.tokens >= this.capacity) {
        this.buckets.delete(key);
      }
    }
  }
}
