import test from 'ava';
import { $compCtrl, $ctrl, $prefix } from './mocks';

test('$ctrl.getApiPrefix', async t => {
	t.is($ctrl.getApiPrefix(), $prefix);
});

test('$compCtrl.uniqueId', async t => {
	t.is(typeof $compCtrl.uniqueId, 'string');
	t.false($compCtrl.uniqueId.includes('-'));
	t.false($compCtrl.uniqueId.includes(','));
});
