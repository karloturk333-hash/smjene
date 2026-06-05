import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import { computeHours } from "../src/lib/time";

const prisma = new PrismaClient();
const VENUES = ["Konoba More", "Caffe Bar Riva", "Restoran Stari Grad"];

// Poznati demo račun za razvoj. (Ovo NIJE prava lozinka korisnika, nego fiksni
// demo kredencijal — zato ga smijemo ispisati u konzolu. U pravom auth kodu
// lozinke se NIKAD ne logiraju.)
const DEMO_EMAIL = "demo@napojnice.hr";
const DEMO_PASSWORD = "demo12345";

async function main() {
  // Čist start. Brišemo redom zbog stranih ključeva (smjene/sesije pa korisnici);
  // s onDelete: Cascade dovoljno bi bilo i samo user.deleteMany(), ali eksplicitno je jasnije.
  await prisma.shift.deleteMany();
  await prisma.session.deleteMany();
  await prisma.user.deleteMany();

  // Lozinku hashiramo bcryptom (cost 12). Punu priču o hashiranju, saltu i
  // cost faktoru objašnjavamo u Fazi 2 (password servis) — ovdje je samo koristimo.
  const passwordHash = await bcrypt.hash(DEMO_PASSWORD, 12);
  const user = await prisma.user.create({
    data: { email: DEMO_EMAIL, passwordHash },
  });

  const today = new Date();
  for (let i = 0; i < 14; i++) {
    const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i * 2);
    const startTime = "16:00";
    const endTime = i % 4 === 0 ? "00:30" : "23:00";
    const tipsCash = Math.round((15 + Math.random() * 35) * 100) / 100;
    const tipsCard = Math.round((10 + Math.random() * 25) * 100) / 100;
    const guests = 20 + Math.floor(Math.random() * 60);

    await prisma.shift.create({
      data: {
        date,
        startTime,
        endTime,
        hours: computeHours(startTime, endTime),
        tipsCash,
        tipsCard,
        guests,
        venue: VENUES[i % VENUES.length],
        userId: user.id, // sve smjene pripadaju demo korisniku
      },
    });
  }

  console.log(`Seed: korisnik ${DEMO_EMAIL} (lozinka: ${DEMO_PASSWORD}) + 14 smjena kreirano.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
