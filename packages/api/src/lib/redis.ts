import { Redis } from "ioredis";
import { env } from "../config/env.js";

let client: Redis | null = null;

/** BullMQ requires maxRetriesPerRequest: null on ioredis */
export function getRedis(): Redis {
  if (!client) {
    client = new Redis(env.redisUrl, { maxRetriesPerRequest: null });
  }
  return client;
}
