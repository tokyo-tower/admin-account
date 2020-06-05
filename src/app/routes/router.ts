/**
 * ルーター
 */
import * as express from 'express';

import oauthRouter from './oauth';
import ahRouter from './_ah';

const router = express.Router();

// middleware that is specific to this router
// router.use((req, res, next) => {
//   debug('Time: ', Date.now())
//   next()
// })

router.use('/_ah', ahRouter);
router.use('/oauth', oauthRouter);

export default router;
