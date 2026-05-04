import { getRedis } from "./redis.js";

export class RateLimitError extends Error {
  readonly status = 429;
  constructor(message = "Too many requests") {
    super(message);
    this.name = "RateLimitError";
  }
}

/** Fixed window counter. Returns true if allowed, false if over limit (does not increment when over). */
export async function rateLimitConsume(key: string, limit: number, windowSeconds: number): Promise<void> {
  const redis = getRedis();
  const n = await redis.incr(key);
  if (n === 1) {
    await redis.expire(key, windowSeconds);
  }
  if (n > limit) {
    throw new RateLimitError();
  }
}
