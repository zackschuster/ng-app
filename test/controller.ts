// tslint:disable:no-async-without-await
import test from 'ava';
import { $ctrl, $inputCtrl, $prefix } from './mocks';

test('$ctrl.apiPrefix', async t => {
	t.is($ctrl.apiPrefix, $prefix);
});

test('$compCtrl.uniqueId', async t => {
	t.is(typeof $inputCtrl.uniqueId, 'string');
	t.false($inputCtrl.uniqueId.includes('-'));
	t.false($inputCtrl.uniqueId.includes(','));
});
