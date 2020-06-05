// tslint:disable:no-implicit-dependencies
/**
 * APIエラーテスト
 */
// import * as assert from 'assert';
import * as sinon from 'sinon';

let sandbox: sinon.SinonSandbox;

describe('Write some tests!', () => {
    beforeEach(() => {
        sandbox = sinon.createSandbox();
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('some test', async () => {
        sandbox.verify();
    });
});
