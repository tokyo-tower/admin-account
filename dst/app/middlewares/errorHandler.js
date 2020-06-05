"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * エラーハンドラーミドルウェア
 */
const ttts = require("@tokyotower/factory");
const createDebug = require("debug");
const http_status_1 = require("http-status");
const api_1 = require("../error/api");
const debug = createDebug('ttts-admin-account:middlewares:errorHandler');
exports.default = (err, __, res, next) => {
    debug('handling err...', err);
    if (res.headersSent) {
        next(err);
        return;
    }
    let apiError;
    if (err instanceof api_1.APIError) {
        apiError = err;
    }
    else {
        // エラー配列が入ってくることもある
        if (Array.isArray(err)) {
            apiError = new api_1.APIError(tttsError2httpStatusCode(err[0]), err);
        }
        else if (err instanceof ttts.errors.TTTS) {
            apiError = new api_1.APIError(tttsError2httpStatusCode(err), [err]);
        }
        else {
            // 500
            apiError = new api_1.APIError(http_status_1.INTERNAL_SERVER_ERROR, [new ttts.errors.TTTS('InternalServerError', err.message)]);
        }
    }
    res.status(apiError.code)
        .json({
        error: apiError.toObject()
    });
};
/**
 * TTTSエラーをHTTPステータスコードへ変換する
 * @function
 * @param {ttts.factory.errors.TTTS} err TTTSエラー
 */
function tttsError2httpStatusCode(err) {
    let statusCode = http_status_1.BAD_REQUEST;
    switch (true) {
        // 401
        case (err instanceof ttts.errors.Unauthorized):
            statusCode = http_status_1.UNAUTHORIZED;
            break;
        // 403
        case (err instanceof ttts.errors.Forbidden):
            statusCode = http_status_1.FORBIDDEN;
            break;
        // 404
        case (err instanceof ttts.errors.NotFound):
            statusCode = http_status_1.NOT_FOUND;
            break;
        // 409
        case (err instanceof ttts.errors.AlreadyInUse):
            statusCode = http_status_1.CONFLICT;
            break;
        // 429
        case (err instanceof ttts.errors.RateLimitExceeded):
            statusCode = http_status_1.TOO_MANY_REQUESTS;
            break;
        // 502
        case (err instanceof ttts.errors.NotImplemented):
            statusCode = http_status_1.NOT_IMPLEMENTED;
            break;
        // 503
        case (err instanceof ttts.errors.ServiceUnavailable):
            statusCode = http_status_1.SERVICE_UNAVAILABLE;
            break;
        // 400
        default:
            statusCode = http_status_1.BAD_REQUEST;
    }
    return statusCode;
}
