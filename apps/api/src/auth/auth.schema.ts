import { z } from "zod";

/**
 * Validacija ulaza za auth rute (zod). Email mora biti email; lozinku
 * normaliziramo (trim + lowercase emaila) da "Demo@x.hr" i "demo@x.hr" budu isti
 * korisnik. Lozinku ovdje SAMO validiramo — nikad je ne logiramo ni ne vraćamo.
 */
const email = z
  .string()
  .email("Neispravan email")
  .max(254)
  .transform((e) => e.trim().toLowerCase());

export const registerSchema = z.object({
  email,
  // Min 8 znakova kod registracije — donja granica jačine lozinke.
  password: z.string().min(8, "Lozinka mora imati barem 8 znakova").max(200),
});

export const loginSchema = z.object({
  email,
  // Kod logina ne namećemo duljinu (ne odajemo pravila) — samo da nije prazno.
  password: z.string().min(1, "Lozinka je obavezna").max(200),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
