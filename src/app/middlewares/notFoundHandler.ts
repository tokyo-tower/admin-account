/**
 * 404ハンドラーミドルウェア
 */
import * as ttts from '@tokyotower/factory';
import { NextFunction, Request, Response } from 'express';

export default (req: Request, __: Response, next: NextFunction) => {
    next(new ttts.errors.NotFound(`router for [${req.originalUrl}]`));
};
