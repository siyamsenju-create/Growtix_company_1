import type { Request, Response, NextFunction } from "express";
import { ZodError } from "zod";
import { RateLimitError } from "../lib/rate-limit.js";

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof ZodError) {
    res.status(400).json({ error: "Validation error", details: err.flatten() });
    return;
  }
  if (err instanceof RateLimitError) {
    res.status(429).json({ error: err.message });
    return;
  }
  const message = err instanceof Error ? err.message : "Internal error";
  console.error(err);
  res.status(500).json({ error: message });
}
