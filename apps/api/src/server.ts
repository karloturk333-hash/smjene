import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import { shiftRouter } from "./shifts/shift.routes";
import { statsRouter } from "./stats/stats.routes";

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});
app.use("/api/shifts", shiftRouter);
app.use("/api/stats", statsRouter);

// 404
app.use((_req, res) => {
  res.status(404).json({ error: "Ruta nije pronađena." });
});

// Centralni error handler.
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ error: "Interna greška servera." });
});

const PORT = Number(process.env.PORT) || 4000;
app.listen(PORT, () => {
  console.log(`API → http://localhost:${PORT}`);
});
