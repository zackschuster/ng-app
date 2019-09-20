// tslint:disable: no-async-without-await
import test from 'ava';
import { $ctrl, $prefix } from './-mocks';

test('$ctrl.apiPrefix', async t => {
	t.is($ctrl.apiPrefix, $prefix);
});

test('$compCtrl.uniqueId', async t => {
	t.is(typeof $ctrl.uniqueId, 'string');
	t.false($ctrl.uniqueId.includes('-'));
	t.false($ctrl.uniqueId.includes(','));
});
