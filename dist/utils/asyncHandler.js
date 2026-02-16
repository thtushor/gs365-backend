"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.asyncHandler = asyncHandler;
function asyncHandler(...handlers) {
    return async (req, res, next) => {
        try {
            for (const handler of handlers) {
                try {
                    // Await each handler; if it returns a promise, wait for it
                    await handler(req, res, next);
                    // If response is finished, stop processing further handlers
                    if (res.headersSent)
                        return;
                }
                catch (error) {
                    console.error({ handler, error });
                }
            }
        }
        catch (err) {
            next(err);
        }
    };
}
