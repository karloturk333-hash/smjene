import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { registerSchema, loginSchema } from "./auth.schema";
import { registerUser, loginUser, EmailTakenError } from "./auth.service";
import { createSession, invalidateSession } from "./session";
import { setSessionCookie, clearSessionCookie, SESSION_COOKIE } from "./cookie";
import { requireAuth } from "./requireAuth";

export const authRouter = Router();

// POST /api/auth/register → kreiraj korisnika + odmah ga prijavi (postavi kolačić).
authRouter.post(
  "/register",
  asyncHandler(async (req, res) => {
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    try {
      const user = await registerUser(parsed.data);
      const { token, expiresAt } = await createSession(user.id);
      setSessionCookie(res, token, expiresAt);
      res.status(201).json({ user }); // user NE sadrži passwordHash
    } catch (e) {
      if (e instanceof EmailTakenError) {
        res.status(409).json({ error: "Email je već registriran." });
        return;
      }
      throw e; // ostalo prepuštamo centralnom error handleru
    }
  }),
);

// POST /api/auth/login → provjeri lozinku, postavi kolačić.
authRouter.post(
  "/login",
  asyncHandler(async (req, res) => {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const user = await loginUser(parsed.data);
    if (!user) {
      // GENERIČKA poruka — ne odajemo je li krivo bio email ili lozinka.
      res.status(401).json({ error: "Neispravan email ili lozinka." });
      return;
    }
    const { token, expiresAt } = await createSession(user.id);
    setSessionCookie(res, token, expiresAt);
    res.json({ user });
  }),
);

// POST /api/auth/logout → ubij sesiju u bazi i obriši kolačić.
authRouter.post(
  "/logout",
  asyncHandler(async (req, res) => {
    const token = req.cookies?.[SESSION_COOKIE];
    if (token) await invalidateSession(token);
    clearSessionCookie(res);
    res.status(204).end();
  }),
);

// GET /api/auth/me → tko sam ja? (iza requireAuth; vraća req.user ili 401).
authRouter.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    res.json({ user: req.user });
  }),
);
