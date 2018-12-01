import test from 'ava';
import { $ctrl, $inputCtrl, $prefix } from './mocks';

test('$ctrl.getApiPrefix', async t => {
	t.is($ctrl.getApiPrefix(), $prefix);
});

test('$compCtrl.uniqueId', async t => {
	t.is(typeof $inputCtrl.uniqueId, 'string');
	t.false($inputCtrl.uniqueId.includes('-'));
	t.false($inputCtrl.uniqueId.includes(','));
});
