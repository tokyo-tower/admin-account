"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * 404ハンドラーミドルウェア
 */
const ttts = require("@tokyotower/factory");
exports.default = (req, __, next) => {
    next(new ttts.errors.NotFound(`router for [${req.originalUrl}]`));
};
