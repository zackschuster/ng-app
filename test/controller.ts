import test from 'ava';
import { $ctrl, $prefix } from './mocks';

test('$ctrl.apiPrefix', t => {
	t.is($ctrl.apiPrefix, $prefix);
});

test('$compCtrl.uniqueId', t => {
	t.is(typeof $ctrl.uniqueId, 'string');
	t.is($ctrl.uniqueId.indexOf('-'), -1);
	t.is($ctrl.uniqueId.indexOf(','), -1);
});
