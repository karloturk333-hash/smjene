import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { computeHours } from "../src/lib/time";

const prisma = new PrismaClient();
const VENUES = ["Konoba More", "Caffe Bar Riva", "Restoran Stari Grad"];

async function main() {
  await prisma.shift.deleteMany();
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
      },
    });
  }

  console.log("Seed: 14 smjena kreirano.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
