import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { LoginBodySchema, RegisterBodySchema } from "@growtix/shared-types";
import { Organization, User } from "../../models/index.js";
import {
  requireAuth,
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
} from "../../middlewares/auth.js";
import { generateSecureToken, hashToken } from "../../lib/tokens.js";
import { rateLimitConsume } from "../../lib/rate-limit.js";
import { queueTransactionalEmail } from "../../lib/queue-transactional.js";
import { env } from "../../config/env.js";
import type { Request } from "express";

export const authRouter = Router();

function getTv(user: { tokenVersion?: number | null }): number {
  return user.tokenVersion ?? 0;
}

function isEmailVerified(user: { emailVerifiedAt?: Date | null }): boolean {
  return user.emailVerifiedAt != null;
}

function clientIp(req: Request): string {
  return (req.ip || req.socket.remoteAddress || "unknown").replace(/:/g, "_");
}

authRouter.post("/register", async (req, res, next) => {
  try {
    const body = RegisterBodySchema.parse(req.body);
    const existing = await User.findOne({ email: body.email.toLowerCase() });
    if (existing) {
      res.status(409).json({ error: "Email already registered" });
      return;
    }
    const org = await Organization.create({ name: body.orgName });
    const passwordHash = await bcrypt.hash(body.password, 12);
    const user = await User.create({
      email: body.email.toLowerCase(),
      passwordHash,
      orgId: org._id,
      role: "client",
      emailVerifiedAt: null,
      tokenVersion: 0,
    });

    const raw = generateSecureToken();
    const tokenHash = hashToken(raw);
    const exp = new Date(Date.now() + 48 * 60 * 60 * 1000);
    await User.findByIdAndUpdate(user._id, {
      $set: {
        emailVerificationTokenHash: tokenHash,
        emailVerificationExpiresAt: exp,
      },
    });

    const link = `${env.publicWebUrl}/verify-email?token=${encodeURIComponent(raw)}`;
    await queueTransactionalEmail(String(org._id), String(user._id), {
      kind: "verify_email",
      to: user.email,
      subject: "Verify your Growtix email",
      text: `Welcome to Growtix.\n\nVerify your email (link expires in 48 hours):\n${link}\n\nIf you did not create an account, ignore this message.`,
    });

    const tv = getTv(user);
    const payload = { sub: String(user._id), orgId: String(org._id), role: user.role as "client" | "admin", tv };
    res.status(201).json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        orgId: String(org._id),
        emailVerified: false,
      },
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/login", async (req, res, next) => {
  try {
    const body = LoginBodySchema.parse(req.body);
    const user = await User.findOne({ email: body.email.toLowerCase() });
    if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
      res.status(401).json({ error: "Invalid credentials" });
      return;
    }
    const tv = getTv(user);
    const payload = { sub: String(user._id), orgId: String(user.orgId), role: user.role as "client" | "admin", tv };
    res.json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: String(user._id),
        email: user.email,
        role: user.role,
        orgId: String(user.orgId),
        emailVerified: isEmailVerified(user),
      },
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const body = z.object({ refreshToken: z.string() }).parse(req.body);
    const decoded = verifyRefreshToken(body.refreshToken);
    const user = await User.findById(decoded.sub);
    if (!user) {
      res.status(401).json({ error: "Invalid token" });
      return;
    }
    const jwtTv = decoded.tv ?? 0;
    if (getTv(user) !== jwtTv) {
      res.status(401).json({ error: "Session expired. Please sign in again." });
      return;
    }
    const payload = {
      sub: String(user._id),
      orgId: String(user.orgId),
      role: user.role as "client" | "admin",
      tv: getTv(user),
    };
    res.json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/logout", (_req, res) => {
  res.json({ ok: true });
});

authRouter.get("/me", requireAuth, async (req, res, next) => {
  try {
    const user = await User.findById(req.auth!.sub).lean();
    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({
      id: String(user._id),
      email: user.email,
      role: user.role,
      orgId: String(user.orgId),
      emailVerified: isEmailVerified(user),
    });
  } catch (e) {
    next(e);
  }
});

const EmailBodySchema = z.object({ email: z.string().email() });

authRouter.post("/verify-email/request", async (req, res, next) => {
  try {
    await rateLimitConsume(`rl:ve:ip:${clientIp(req)}`, 20, 3600);
    const parsed = EmailBodySchema.safeParse(req.body);
    const email = parsed.success ? parsed.data.email.toLowerCase() : null;
    if (email) {
      await rateLimitConsume(`rl:ve:em:${hashToken(email).slice(0, 24)}`, 5, 3600);
    }

    let sent = false;
    if (req.headers.authorization?.startsWith("Bearer ")) {
      try {
        const auth = verifyAccessToken(req.headers.authorization.slice(7));
        const user = await User.findById(auth.sub);
        if (user && !isEmailVerified(user)) {
          await sendVerificationEmail(user);
          sent = true;
        }
      } catch {
        /* fall through to email-only */
      }
    }

    if (!sent && email) {
      const user = await User.findOne({ email });
      if (user && !isEmailVerified(user)) {
        await sendVerificationEmail(user);
      }
    }

    res.status(204).send();
  } catch (e) {
    next(e);
  }
});

authRouter.post("/verify-email/confirm", async (req, res, next) => {
  try {
    await rateLimitConsume(`rl:vec:ip:${clientIp(req)}`, 30, 3600);
    const body = z.object({ token: z.string().min(10) }).parse(req.body);
    const tokenHash = hashToken(body.token);
    const user = await User.findOne({
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid or expired verification link." });
      return;
    }
    await User.findByIdAndUpdate(user._id, {
      $set: { emailVerifiedAt: new Date() },
      $unset: { emailVerificationTokenHash: 1, emailVerificationExpiresAt: 1 },
    });
    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/password-reset/request", async (req, res, next) => {
  try {
    await rateLimitConsume(`rl:pr:ip:${clientIp(req)}`, 15, 3600);
    const parsed = EmailBodySchema.safeParse(req.body);
    if (parsed.success) {
      await rateLimitConsume(`rl:pr:em:${hashToken(parsed.data.email.toLowerCase()).slice(0, 24)}`, 5, 3600);
    }

    if (parsed.success) {
      const email = parsed.data.email.toLowerCase();
      const user = await User.findOne({ email });
      if (user) {
        const raw = generateSecureToken();
        const tokenHash = hashToken(raw);
        const exp = new Date(Date.now() + 60 * 60 * 1000);
        await User.findByIdAndUpdate(user._id, {
          $set: {
            passwordResetTokenHash: tokenHash,
            passwordResetExpiresAt: exp,
          },
        });
        const link = `${env.publicWebUrl}/reset-password?token=${encodeURIComponent(raw)}`;
        await queueTransactionalEmail(String(user.orgId), String(user._id), {
          kind: "password_reset",
          to: user.email,
          subject: "Reset your Growtix password",
          text: `We received a request to reset your password.\n\nReset link (expires in 1 hour):\n${link}\n\nIf you did not request this, you can ignore this email.`,
        });
      }
    }

    res.json({ ok: true });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/password-reset/confirm", async (req, res, next) => {
  try {
    await rateLimitConsume(`rl:prc:ip:${clientIp(req)}`, 20, 3600);
    const body = z
      .object({
        token: z.string().min(10),
        newPassword: z.string().min(8),
      })
      .parse(req.body);

    const tokenHash = hashToken(body.token);
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpiresAt: { $gt: new Date() },
    });
    if (!user) {
      res.status(400).json({ error: "Invalid or expired reset link." });
      return;
    }

    const passwordHash = await bcrypt.hash(body.newPassword, 12);
    const updated = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          passwordHash,
          passwordChangedAt: new Date(),
        },
        $unset: {
          passwordResetTokenHash: 1,
          passwordResetExpiresAt: 1,
        },
        $inc: { tokenVersion: 1 },
      },
      { new: true }
    );
    if (!updated) {
      res.status(500).json({ error: "Update failed" });
      return;
    }

    const tv = getTv(updated);
    const payload = {
      sub: String(updated._id),
      orgId: String(updated.orgId),
      role: updated.role as "client" | "admin",
      tv,
    };
    res.json({
      ok: true,
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: {
        id: String(updated._id),
        email: updated.email,
        role: updated.role,
        orgId: String(updated.orgId),
        emailVerified: isEmailVerified(updated),
      },
    });
  } catch (e) {
    next(e);
  }
});

async function sendVerificationEmail(user: { _id: unknown; email: string; orgId: unknown }): Promise<void> {
  const raw = generateSecureToken();
  const tokenHash = hashToken(raw);
  const exp = new Date(Date.now() + 48 * 60 * 60 * 1000);
  await User.findByIdAndUpdate(user._id, {
    $set: {
      emailVerificationTokenHash: tokenHash,
      emailVerificationExpiresAt: exp,
    },
  });
  const link = `${env.publicWebUrl}/verify-email?token=${encodeURIComponent(raw)}`;
  await queueTransactionalEmail(String(user.orgId), String(user._id), {
    kind: "verify_email",
    to: user.email,
    subject: "Verify your Growtix email",
    text: `Verify your email (link expires in 48 hours):\n${link}`,
  });
}
