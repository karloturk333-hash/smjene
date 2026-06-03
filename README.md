# Napojnice — pratitelj smjena i napojnica za konobare

Full-stack aplikacija za praćenje smjena i napojnica (bakšiša) konobara.

- **`apps/api`** — REST API: **Express + TypeScript + Prisma + SQLite**, validacija `zod`.
- **`apps/web`** — SPA: **Vite + React + TypeScript + TanStack Query**.

Monorepo (npm workspaces). MVP: jedan korisnik (bez prijave).

## Funkcionalnosti (MVP)
- Unos smjene (datum, početak–kraj → izračun sati, napojnice gotovina/kartica, lokal, bilješka).
- Popis smjena (uređivanje / brisanje).
- Dashboard: ukupne napojnice i sati (tjedan / mjesec / sve), **€/sat**, broj smjena, omjer gotovina/kartica.

## Pokretanje
```bash
npm install                       # instalira oba workspacea
cp apps/api/.env.example apps/api/.env
npm run -w apps/api prisma:migrate   # kreira SQLite bazu
npm run -w apps/api db:seed          # (opcionalno) demo podaci
npm run dev                        # API :4000 + web :5173 paralelno
```

## API
| Metoda | Ruta | Opis |
|--------|------|------|
| GET | `/api/health` | health check |
| GET | `/api/shifts?from=&to=` | popis smjena |
| POST | `/api/shifts` | nova smjena |
| GET | `/api/shifts/:id` | jedna smjena |
| PATCH | `/api/shifts/:id` | uredi smjenu |
| DELETE | `/api/shifts/:id` | obriši smjenu |
| GET | `/api/stats?period=week\|month\|all` | agregati za dashboard |
