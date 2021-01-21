import test from 'ava';
import { $ctrl, $prefix } from './mocks';
import { NgAttributes } from '../index';

test('NgController has $attrs property that mirrors the Angular.js object', t => {
	t.true($ctrl.$attrs instanceof NgAttributes);
});

test('NgController has a reference to the API prefix', t => {
	t.is($ctrl.apiPrefix, $prefix);
});

test('NgController has a unique id', t => {
	t.is(typeof $ctrl.uniqueId, 'string');
	t.is($ctrl.uniqueId.indexOf('-'), -1);
	t.is($ctrl.uniqueId.indexOf(','), -1);
});
