import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { getStats, type Period } from "../shifts/shift.service";

export const statsRouter = Router();

statsRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const p = req.query.period;
    const period: Period = p === "week" || p === "month" ? p : "all";
    res.json(await getStats(period));
  }),
);
