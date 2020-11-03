// tslint:disable:no-async-without-await
import test from 'ava';
import { NgService } from '..';
import { $console, $log } from './mocks';

test('console subclasses service', async t => {
	t.true($console instanceof NgService);
});

test('console has appropriate methods', async t => {
	t.is(typeof $console.$debug, 'function');
	t.is(typeof $console.$error, 'function');
	t.is(typeof $console.$info, 'function');
	t.is(typeof $console.$log, 'function');
	t.is(typeof $console.$warn, 'function');
});

test('logger subclasses console', async t => {
	t.true($log instanceof Object.getPrototypeOf($console).constructor);
});

test('logger has appropriate methods', async t => {
	t.is(typeof $log.clear, 'function');
	t.is(typeof $log.confirm, 'function');
	t.is(typeof $log.devWarning, 'function');
	t.is(typeof $log.error, 'function');
	t.is(typeof $log.info, 'function');
	t.is(typeof $log.success, 'function');
	t.is(typeof $log.warning, 'function');
});
