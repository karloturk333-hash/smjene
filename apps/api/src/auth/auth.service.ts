import { prisma } from "../db";
import { hashPassword, verifyPassword, DUMMY_HASH } from "./password";
import type { RegisterInput, LoginInput } from "./auth.schema";

/** Sigurna projekcija korisnika za klijenta — NIKAD ne uključuje passwordHash. */
export interface PublicUser {
  id: string;
  email: string;
  createdAt: Date;
}

const toPublic = (u: { id: string; email: string; createdAt: Date }): PublicUser => ({
  id: u.id,
  email: u.email,
  createdAt: u.createdAt,
});

/** Bacamo je kad je email već registriran; ruta je mapira u 409. */
export class EmailTakenError extends Error {}

/** Registracija: email mora biti slobodan, lozinku hashiramo, kreiramo korisnika. */
export async function registerUser(input: RegisterInput): Promise<PublicUser> {
  const existing = await prisma.user.findUnique({ where: { email: input.email } });
  if (existing) throw new EmailTakenError();

  const passwordHash = await hashPassword(input.password);
  const user = await prisma.user.create({
    data: { email: input.email, passwordHash },
  });
  return toPublic(user);
}

/**
 * Login: vrati korisnika ako lozinka odgovara, inače null.
 * Pozivamo verifyPassword ČAK I kad korisnik ne postoji (s DUMMY_HASH-om) da
 * obje grane traju jednako dugo → ne odajemo postoji li email (timing napad).
 */
export async function loginUser(input: LoginInput): Promise<PublicUser | null> {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  const hash = user?.passwordHash ?? DUMMY_HASH;
  const ok = await verifyPassword(input.password, hash);
  if (!user || !ok) return null;
  return toPublic(user);
}
