/**
 * エラーハンドラーミドルウェア
 */
import * as ttts from '@tokyotower/factory';
import * as createDebug from 'debug';
import { NextFunction, Request, Response } from 'express';
import {
    BAD_REQUEST,
    CONFLICT, FORBIDDEN,
    INTERNAL_SERVER_ERROR,
    NOT_FOUND,
    NOT_IMPLEMENTED,
    SERVICE_UNAVAILABLE,
    TOO_MANY_REQUESTS,
    UNAUTHORIZED
} from 'http-status';

import { APIError } from '../error/api';

const debug = createDebug('ttts-admin-account:middlewares:errorHandler');

export default (err: any, __: Request, res: Response, next: NextFunction) => {
    debug('handling err...', err);

    if (res.headersSent) {
        next(err);

        return;
    }

    let apiError: APIError;
    if (err instanceof APIError) {
        apiError = err;
    } else {
        // エラー配列が入ってくることもある
        if (Array.isArray(err)) {
            apiError = new APIError(tttsError2httpStatusCode(err[0]), err);
        } else if (err instanceof ttts.errors.TTTS) {
            apiError = new APIError(tttsError2httpStatusCode(err), [err]);
        } else {
            // 500
            apiError = new APIError(INTERNAL_SERVER_ERROR, [new ttts.errors.TTTS(<any>'InternalServerError', err.message)]);
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
function tttsError2httpStatusCode(err: ttts.errors.TTTS) {
    let statusCode = BAD_REQUEST;

    switch (true) {
        // 401
        case (err instanceof ttts.errors.Unauthorized):
            statusCode = UNAUTHORIZED;
            break;

        // 403
        case (err instanceof ttts.errors.Forbidden):
            statusCode = FORBIDDEN;
            break;

        // 404
        case (err instanceof ttts.errors.NotFound):
            statusCode = NOT_FOUND;
            break;

        // 409
        case (err instanceof ttts.errors.AlreadyInUse):
            statusCode = CONFLICT;
            break;

        // 429
        case (err instanceof ttts.errors.RateLimitExceeded):
            statusCode = TOO_MANY_REQUESTS;
            break;

        // 502
        case (err instanceof ttts.errors.NotImplemented):
            statusCode = NOT_IMPLEMENTED;
            break;

        // 503
        case (err instanceof ttts.errors.ServiceUnavailable):
            statusCode = SERVICE_UNAVAILABLE;
            break;

        // 400
        default:
            statusCode = BAD_REQUEST;
    }

    return statusCode;
}
