import "dotenv/config";
import express, { type Request, type Response, type NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { shiftRouter } from "./shifts/shift.routes";
import { statsRouter } from "./stats/stats.routes";
import { authRouter } from "./auth/auth.routes";
import { requireAuth } from "./auth/requireAuth";

const app = express();
// U dev-u SPA i API dijele origin kroz Vite proxy, pa je sve same-origin.
// credentials: true znači "smiješ slati/postavljati kolačiće" (treba za sesiju);
// origin: true reflektira origin zahtjeva (ne smije biti "*" uz credentials).
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser()); // popuni req.cookies iz "Cookie" headera

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

// Auth rute su javne (register/login/logout); /me je iza requireAuth iznutra.
app.use("/api/auth", authRouter);

// SVE smjene i statistika su iza prijave: requireAuth stoji ispred routera, pa
// nijedan handler ne radi bez valjane sesije i bez postavljenog req.user.
app.use("/api/shifts", requireAuth, shiftRouter);
app.use("/api/stats", requireAuth, statsRouter);

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
