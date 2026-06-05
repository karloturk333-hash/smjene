import "express";

// Proširujemo Express Request tip našim poljem `user`, koje postavlja requireAuth
// middleware. Tako rute mogu sigurno čitati req.user.id uz punu TS provjeru.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: { id: string; email: string };
    }
  }
}
