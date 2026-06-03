import { PrismaClient } from "@prisma/client";

/** Jedinstvena Prisma instanca za cijelu aplikaciju. */
export const prisma = new PrismaClient();
