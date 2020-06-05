"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = void 0;
/**
 * oauthルーター
 */
const ttts = require("@tokyotower/factory");
const AWS = require("aws-sdk");
const basicAuth = require("basic-auth");
const crypto = require("crypto");
const createDebug = require("debug");
const express_1 = require("express");
const express_validator_1 = require("express-validator");
const REGION = 'ap-northeast-1';
const validator_1 = require("../middlewares/validator");
const debug = createDebug('ttts-admin-account:routes');
const oauthRouter = express_1.Router();
oauthRouter.post('/token', ...[
    express_validator_1.body('username')
        .not()
        .isEmpty()
        .withMessage('username required'),
    express_validator_1.body('password')
        .not()
        .isEmpty()
        .withMessage('password required')
], validator_1.default, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ベーシック認証ユーザーがクライアント情報
        const user = basicAuth(req);
        debug('basic auth user:', user);
        if (user === undefined) {
            throw new ttts.errors.Unauthorized();
        }
        const credentials = yield login(process.env.AWS_ACCESS_KEY_ID, process.env.AWS_SECRET_ACCESS_KEY, user.name, user.pass, process.env.USER_POOL_ID, req.body.username, req.body.password)();
        res.json(credentials);
    }
    catch (error) {
        next(error);
    }
}));
exports.default = oauthRouter;
/**
 * 管理者としてログインする
 */
function login(accessKeyId, secretAccessKey, clientId, clientSecret, userPoolId, 
/**
 * ユーザーネーム
 */
username, 
/**
 * パスワード
 */
password) {
    return () => __awaiter(this, void 0, void 0, function* () {
        return new Promise((resolve, reject) => {
            const cognitoidentityserviceprovider = new AWS.CognitoIdentityServiceProvider({
                apiVersion: 'latest',
                region: REGION,
                accessKeyId: accessKeyId,
                secretAccessKey: secretAccessKey
            });
            const hash = crypto.createHmac('sha256', clientSecret)
                .update(`${username}${clientId}`)
                .digest('base64');
            const params = {
                UserPoolId: userPoolId,
                ClientId: clientId,
                AuthFlow: 'ADMIN_NO_SRP_AUTH',
                AuthParameters: {
                    USERNAME: username,
                    SECRET_HASH: hash,
                    PASSWORD: password
                }
                // ClientMetadata?: ClientMetadataType;
                // AnalyticsMetadata?: AnalyticsMetadataType;
                // ContextData?: ContextDataType;
            };
            cognitoidentityserviceprovider.adminInitiateAuth(params, (err, data) => {
                debug('adminInitiateAuth result:', err);
                if (err instanceof Error) {
                    reject(err);
                }
                else {
                    if (data.AuthenticationResult === undefined) {
                        reject(new Error('Unexpected.'));
                    }
                    else {
                        resolve({
                            accessToken: data.AuthenticationResult.AccessToken,
                            expiresIn: data.AuthenticationResult.ExpiresIn,
                            idToken: data.AuthenticationResult.IdToken,
                            refreshToken: data.AuthenticationResult.RefreshToken,
                            tokenType: data.AuthenticationResult.TokenType
                        });
                    }
                }
            });
        });
    });
}
exports.login = login;
