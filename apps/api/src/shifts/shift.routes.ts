import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { shiftInputSchema, shiftUpdateSchema } from "./shift.schema";
import * as service from "./shift.service";

export const shiftRouter = Router();

shiftRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const shifts = await service.listShifts(
      typeof from === "string" ? from : undefined,
      typeof to === "string" ? to : undefined,
    );
    res.json(shifts);
  }),
);

shiftRouter.post(
  "/",
  asyncHandler(async (req, res) => {
    const parsed = shiftInputSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const shift = await service.createShift(parsed.data);
    res.status(201).json(shift);
  }),
);

shiftRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const shift = await service.getShift(req.params.id);
    if (!shift) {
      res.status(404).json({ error: "Smjena nije pronađena." });
      return;
    }
    res.json(shift);
  }),
);

shiftRouter.patch(
  "/:id",
  asyncHandler(async (req, res) => {
    const parsed = shiftUpdateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.flatten() });
      return;
    }
    const updated = await service.updateShift(req.params.id, parsed.data);
    if (!updated) {
      res.status(404).json({ error: "Smjena nije pronađena." });
      return;
    }
    res.json(updated);
  }),
);

shiftRouter.delete(
  "/:id",
  asyncHandler(async (req, res) => {
    const ok = await service.deleteShift(req.params.id);
    if (!ok) {
      res.status(404).json({ error: "Smjena nije pronađena." });
      return;
    }
    res.status(204).end();
  }),
);
