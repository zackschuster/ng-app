// tslint:disable:no-async-without-await
import test from 'ava';
import { $log } from './mocks';

test('logger has appropriate methods', async t => {
	t.is(typeof $log.clear, 'function');
	t.is(typeof $log.confirm, 'function');
	t.is(typeof $log.devWarning, 'function');
	t.is(typeof $log.error, 'function');
	t.is(typeof $log.info, 'function');
	t.is(typeof $log.success, 'function');
	t.is(typeof $log.warning, 'function');
});
