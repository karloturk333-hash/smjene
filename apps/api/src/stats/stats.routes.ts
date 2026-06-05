import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { getStats, type Period } from "../shifts/shift.service";

export const statsRouter = Router();

// Montiran iza requireAuth (vidi server.ts) → req.user uvijek postoji.
// Statistika se računa SAMO iz smjena trenutnog korisnika.
statsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const p = req.query.period;
    const period: Period = p === "week" || p === "month" ? p : "all";
    res.json(await getStats(req.user!.id, period));
  }),
);
