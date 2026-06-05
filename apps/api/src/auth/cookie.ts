import type { Response } from "express";

/** Ime kolačića koji nosi session token. */
export const SESSION_COOKIE = "sid";

// `secure` smije biti true samo preko HTTPS-a. U dev (http://localhost) mora biti
// false, inače preglednik odbije kolačić. Uključujemo ga tek u produkciji.
const isProd = process.env.NODE_ENV === "production";

/**
 * Postavi session kolačić. Značenje zastavica (svaka brani drugi napad):
 *  - httpOnly: JavaScript u pregledniku NE MOŽE pročitati kolačić
 *    (document.cookie ga ne vidi) → XSS ne može ukrasti token.
 *  - secure: kolačić se šalje samo preko HTTPS-a → štiti od presretanja u
 *    plain-textu na mreži. (Dev: false, prod: true.)
 *  - sameSite "lax": preglednik NE šalje kolačić uz cross-site POST/AJAX s tuđih
 *    stranica → osnovna zaštita od CSRF-a. "lax" ipak dopušta običnu navigaciju
 *    (klik na link s druge stranice), pa UX ostaje normalan.
 *  - path "/": vrijedi za cijelu aplikaciju.
 *  - expires: koliko kolačić živi u pregledniku (vežemo ga uz istek sesije).
 */
export function setSessionCookie(res: Response, token: string, expiresAt: Date): void {
  res.cookie(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

/** Obriši session kolačić (logout). Opcije moraju odgovarati onima pri postavljanju. */
export function clearSessionCookie(res: Response): void {
  res.clearCookie(SESSION_COOKIE, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/",
  });
}
