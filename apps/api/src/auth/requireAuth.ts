import type { Request, Response, NextFunction } from "express";
import { validateSession } from "./session";
import { SESSION_COOKIE } from "./cookie";

/**
 * Express middleware: propušta zahtjev dalje SAMO ako postoji valjana sesija.
 * Čita token iz httpOnly kolačića, validira ga i zakači sigurna polja korisnika
 * na req.user. Inače vraća 401. Stavimo ga ispred svih zaštićenih ruta.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const token = req.cookies?.[SESSION_COOKIE];
  if (!token) {
    res.status(401).json({ error: "Niste prijavljeni." });
    return;
  }
  const user = await validateSession(token);
  if (!user) {
    res.status(401).json({ error: "Sesija je istekla ili nije valjana." });
    return;
  }
  // Zakači SAMO sigurna polja — passwordHash NIKAD ne ide dalje.
  req.user = { id: user.id, email: user.email };
  next();
}
