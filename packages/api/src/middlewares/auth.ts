import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import type { UserRole } from "@growtix/shared-types";

export type AuthPayload = {
  sub: string;
  orgId: string;
  role: UserRole;
  type: "access" | "refresh";
  /** Password reset / invalidation generation; missing in old JWTs treated as 0 */
  tv?: number;
};

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}

export type SignTokenInput = {
  sub: string;
  orgId: string;
  role: UserRole;
  tv?: number;
};

export function signAccessToken(payload: SignTokenInput): string {
  const tv = payload.tv ?? 0;
  return jwt.sign(
    { sub: payload.sub, orgId: payload.orgId, role: payload.role, type: "access", tv },
    env.jwtSecret,
    { expiresIn: "15m" }
  );
}

export function signRefreshToken(payload: SignTokenInput): string {
  const tv = payload.tv ?? 0;
  return jwt.sign(
    { sub: payload.sub, orgId: payload.orgId, role: payload.role, type: "refresh", tv },
    env.jwtRefreshSecret,
    { expiresIn: "7d" }
  );
}

export function verifyAccessToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, env.jwtSecret) as AuthPayload;
  if (decoded.type !== "access") throw new Error("Invalid token type");
  return decoded;
}

export function verifyRefreshToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, env.jwtRefreshSecret) as AuthPayload;
  if (decoded.type !== "refresh") throw new Error("Invalid token type");
  return decoded;
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    req.auth = verifyAccessToken(header.slice(7));
    next();
  } catch {
    res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!req.auth) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (req.auth.role !== "admin") {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}
