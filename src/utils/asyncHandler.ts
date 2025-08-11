import { Request, Response, NextFunction, RequestHandler } from "express";

export function asyncHandler(
  ...handlers: Array<(req: Request, res: Response, next: NextFunction) => any>
): RequestHandler {
  return async (req, res, next) => {
    try {
      for (const handler of handlers) {
        try {
          // Await each handler; if it returns a promise, wait for it
          await handler(req, res, next);
          // If response is finished, stop processing further handlers
          if (res.headersSent) return;
        } catch (error) {
          console.error({ handler, error });
        }
      }
    } catch (err) {
      next(err);
    }
  };
}
