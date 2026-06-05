import crypto from "node:crypto";
import { prisma } from "../db";

/**
 * SESSION SERVIS — server-side sesije.
 *
 * Model: pri prijavi generiramo dugačak NASUMIČAN token. Sam token ide korisniku
 * u httpOnly kolačić; u bazu spremamo SAMO njegov hash. Zato čak i ako baza
 * procuri, napadač ne dobije upotrebljive tokene — hash se ne može vratiti u
 * token, pa se ne može lažirati ničija sesija. (Isti princip kao kod lozinki.)
 */

// Koliko sesija traje (7 dana).
const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;

// PEPPER — tajna iz okoline (.env), koja NIJE u bazi. Token hashiramo HMAC-om
// pod ovim ključem. Razlika salt vs. pepper: salt je per-zapis i živi u bazi;
// pepper je globalan i živi IZVAN baze. Napadač koji ima samo bazu ne može ni
// izračunati hash bez peppera. Fail-fast ako nije postavljen.
const PEPPER = process.env.AUTH_PEPPER;
if (!PEPPER) {
  throw new Error(
    "AUTH_PEPPER nije postavljen u .env. Generiraj ga npr.: openssl rand -hex 32",
  );
}
const pepper = PEPPER; // od ove točke TS zna da je string (nije undefined)

/**
 * hash tokena = HMAC-SHA256(token, pepper).
 * Zašto smije brzi SHA-256, a ne spori bcrypt kao kod lozinki? Jer je token već
 * 256 bita čiste slučajnosti — nema niskoentropijskog "pogađanja" od kojeg bi
 * nas sporost štitila. Bcrypt bi ovdje bio samo bezveze spor.
 */
function hashToken(token: string): string {
  return crypto.createHmac("sha256", pepper).update(token).digest("hex");
}

export interface CreatedSession {
  /** RAW token — ide u kolačić. NIKAD se ne sprema u bazu. */
  token: string;
  expiresAt: Date;
}

/** Kreiraj novu sesiju za korisnika; vrati RAW token (vidljiv samo ovdje). */
export async function createSession(userId: string): Promise<CreatedSession> {
  // crypto.randomBytes = kriptografski siguran izvor slučajnosti (CSPRNG).
  // NIKAD Math.random() — on je predvidljiv (nije za sigurnost), pa bi napadač
  // teoretski mogao pogoditi/rekonstruirati buduće tokene.
  const token = crypto.randomBytes(32).toString("hex"); // 256 bita → 64 hex znaka
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await prisma.session.create({
    data: { tokenHash: hashToken(token), userId, expiresAt },
  });
  return { token, expiresAt };
}

/** Vrati korisnika ako je token valjan i nije istekao; inače null. */
export async function validateSession(token: string) {
  const session = await prisma.session.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { user: true },
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    // Istekla — počisti zapis i tretiraj kao nevaljanu.
    await prisma.session.delete({ where: { id: session.id } }).catch(() => {});
    return null;
  }
  return session.user;
}

/** Logout — obriši sesiju po hashu tokena (token koji više nije u bazi je mrtav). */
export async function invalidateSession(token: string): Promise<void> {
  await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
}
