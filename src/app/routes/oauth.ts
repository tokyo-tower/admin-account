/**
 * oauthルーター
 */
import * as ttts from '@tokyotower/factory';
import * as AWS from 'aws-sdk';
import * as basicAuth from 'basic-auth';
import * as crypto from 'crypto';
import * as createDebug from 'debug';
import { Router } from 'express';
import { body } from 'express-validator';

const REGION = 'ap-northeast-1';

import validator from '../middlewares/validator';

const debug = createDebug('ttts-admin-account:routes');
const oauthRouter = Router();

oauthRouter.post(
    '/token',
    ...[
        body('username')
            .not()
            .isEmpty()
            .withMessage('username required'),
        body('password')
            .not()
            .isEmpty()
            .withMessage('password required')
    ],
    validator,
    async (req, res, next) => {
        try {
            // ベーシック認証ユーザーがクライアント情報
            const user = basicAuth(req);
            debug('basic auth user:', user);
            if (user === undefined) {
                throw new ttts.errors.Unauthorized();
            }

            const credentials = await login(
                <string>process.env.AWS_ACCESS_KEY_ID,
                <string>process.env.AWS_SECRET_ACCESS_KEY,
                user.name,
                user.pass,
                <string>process.env.USER_POOL_ID,
                req.body.username,
                req.body.password
            )();

            res.json(credentials);
        } catch (error) {
            next(error);
        }
    }
);

export default oauthRouter;

export interface ICredentials {
    accessToken: string;
    expiresIn: number;
    idToken: string;
    refreshToken: string;
    tokenType: string;
}

/**
 * 管理者としてログインする
 */
export function login(
    accessKeyId: string,
    secretAccessKey: string,
    clientId: string,
    clientSecret: string,
    userPoolId: string,
    /**
     * ユーザーネーム
     */
    username: string,
    /**
     * パスワード
     */
    password: string
) {
    return async () => {
        return new Promise<ICredentials>((resolve, reject) => {
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
                } else {
                    if (data.AuthenticationResult === undefined) {
                        reject(new Error('Unexpected.'));
                    } else {
                        resolve({
                            accessToken: <string>data.AuthenticationResult.AccessToken,
                            expiresIn: <number>data.AuthenticationResult.ExpiresIn,
                            idToken: <string>data.AuthenticationResult.IdToken,
                            refreshToken: <string>data.AuthenticationResult.RefreshToken,
                            tokenType: <string>data.AuthenticationResult.TokenType
                        });
                    }
                }
            });
        });
    };
}
