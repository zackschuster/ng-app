import test from 'ava';
import { $ctrl, $prefix } from './mocks';
import { NgAttributes } from '../index';

test('$ctrl.$attrs', t => {
	t.true($ctrl.$attrs instanceof NgAttributes);
});

test('$ctrl.apiPrefix', t => {
	t.is($ctrl.apiPrefix, $prefix);
});

test('$ctrl.uniqueId', t => {
	t.is(typeof $ctrl.uniqueId, 'string');
	t.is($ctrl.uniqueId.indexOf('-'), -1);
	t.is($ctrl.uniqueId.indexOf(','), -1);
});
