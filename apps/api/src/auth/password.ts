import bcrypt from "bcrypt";

/**
 * PASSWORD SERVIS — jedino mjesto u aplikaciji koje zna kako lozinka postaje
 * hash i kako se provjerava. Ostatak koda nikad ne dira bcrypt izravno.
 *
 * ── Hashiranje vs. enkripcija ────────────────────────────────────────────────
 * Lozinke HASHIRAMO (jednosmjerno), ne ENKRIPTIRAMO (dvosmjerno). Enkripcija
 * ima ključ kojim se može vratiti original — da netko ukrade ključ + bazu,
 * dobio bi sve lozinke. Hash se NE može vratiti natrag. Lozinku ipak možemo
 * provjeriti: hashiramo ono što je korisnik upisao i usporedimo s pohranjenim
 * hashom. Tako nikad ne pohranjujemo ni ne dešifriramo samu lozinku.
 *
 * ── Cost faktor (work factor) ────────────────────────────────────────────────
 * bcrypt ne hashira jednom — ponavlja interni algoritam 2^COST puta.
 * COST 12 => 2^12 = 4096 rundi => ~200–300 ms po hashu. To je NAMJERNO sporo:
 * napadač koji ukrade bazu mora platiti tih ~250 ms za SVAKI pokušaj pogađanja,
 * pa brute-force postaje neisplativ. Za obične funkcije želimo brzo; za lozinke
 * želimo sporo. +1 na COST = dvostruko sporije. Biraj najveći COST koji tvoj
 * login još ugodno podnosi.
 */
const COST = 12;

/** Pretvori plain lozinku u bcrypt hash. Salt je UNUTAR rezultata (vidi niže). */
export function hashPassword(plain: string): Promise<string> {
  // bcrypt.hash sam generira nasumičan salt, hashira, i sve upakira u jedan
  // string oblika "$2b$12$<22-znak-salt><31-znak-hash>".
  //   $2b$  → verzija bcrypt algoritma
  //   $12$  → cost faktor (ovdje 12)
  //   sljedeća 22 znaka → SALT (nasumičan, po korisniku)
  //   zadnji 31 znak    → sam hash
  // Zato salt ne moramo spremati zasebno — pri provjeri ga bcrypt pročita odavde.
  return bcrypt.hash(plain, COST);
}

/**
 * Provjeri lozinku protiv spremljenog hasha. bcrypt iz hash stringa izvuče salt
 * i cost, ponovno hashira uneseni plain i usporedi rezultate — u KONSTANTNOM
 * vremenu (compare ne "izlazi ranije" na prvoj različitoj bajti, pa ne curi
 * informacija kroz vrijeme odgovora; vidi timing napade).
 */
export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

/**
 * Validan bcrypt hash nasumične lozinke. Koristi se pri loginu kad korisnik NE
 * postoji: tada svejedno pozovemo verifyPassword(plain, DUMMY_HASH) da grana
 * "nepostojeći email" traje jednako dugo kao i "kriva lozinka". Inače bi napadač
 * iz brzine odgovora mogao zaključiti postoji li email (timing/enumeracija).
 */
export const DUMMY_HASH = bcrypt.hashSync("nije-bitno-sluzi-samo-za-timing", COST);
