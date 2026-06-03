import type { Request, Response, NextFunction, RequestHandler } from "express";

/** Omota async route handler tako da se odbačeni Promise proslijedi error middlewareu. */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>,
): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
