"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * ルーター
 */
const express = require("express");
const oauth_1 = require("./oauth");
const _ah_1 = require("./_ah");
const router = express.Router();
// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })
router.use('/_ah', _ah_1.default);
router.use('/oauth', oauth_1.default);
exports.default = router;
