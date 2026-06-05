import { Router } from "express";
import { asyncHandler } from "../lib/asyncHandler";
import { shiftInputSchema, shiftUpdateSchema } from "./shift.schema";
import * as service from "./shift.service";

export const shiftRouter = Router();

// NAPOMENA: ovaj router je u server.ts montiran IZA requireAuth middlewarea,
// pa je req.user ovdje uvijek postavljen (zato `req.user!`). Svaki poziv servisu
// prosljeđuje req.user.id da smjene budu izolirane po korisniku.

shiftRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const { from, to } = req.query;
    const shifts = await service.listShifts(
      req.user!.id,
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
    const shift = await service.createShift(req.user!.id, parsed.data);
    res.status(201).json(shift);
  }),
);

shiftRouter.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const shift = await service.getShift(req.user!.id, req.params.id!);
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
    const updated = await service.updateShift(req.user!.id, req.params.id!, parsed.data);
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
    const ok = await service.deleteShift(req.user!.id, req.params.id!);
    if (!ok) {
      res.status(404).json({ error: "Smjena nije pronađena." });
      return;
    }
    res.status(204).end();
  }),
);
