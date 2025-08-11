import { Request, Response, NextFunction } from "express";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  res.status(err.status || 500).json({
    status: false,
    message: err.message || "Internal Server Error",
  });
}
