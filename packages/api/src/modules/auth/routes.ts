import { Router } from "express";
import bcrypt from "bcryptjs";
import { z } from "zod";
import {
  LoginBodySchema,
  RegisterBodySchema,
} from "@growtix/shared-types";
import { Organization, User } from "../../models/index.js";
import {
  requireAuth,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../../middlewares/auth.js";

export const authRouter = Router();

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
    });
    const payload = { sub: String(user._id), orgId: String(org._id), role: user.role as "client" | "admin" };
    res.status(201).json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: { id: String(user._id), email: user.email, role: user.role, orgId: String(org._id) },
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
    const payload = { sub: String(user._id), orgId: String(user.orgId), role: user.role as "client" | "admin" };
    res.json({
      accessToken: signAccessToken(payload),
      refreshToken: signRefreshToken(payload),
      user: { id: String(user._id), email: user.email, role: user.role, orgId: String(user.orgId) },
    });
  } catch (e) {
    next(e);
  }
});

authRouter.post("/refresh", async (req, res, next) => {
  try {
    const body = z.object({ refreshToken: z.string() }).parse(req.body);
    const decoded = verifyRefreshToken(body.refreshToken);
    const payload = { sub: decoded.sub, orgId: decoded.orgId, role: decoded.role };
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
    });
  } catch (e) {
    next(e);
  }
});
