"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = errorHandler;
// Centralized error handling middleware
function errorHandler(err, req, res, _next) {
    // eslint-disable-next-line no-console
    console.error(err);
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ error: message });
}
