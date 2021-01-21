import test from 'ava';
import { NgService } from '../index';
import { $console, $log } from './mocks';

test('NgConsole subclasses NgService', t => {
	t.true($console instanceof NgService);
});

test('NgConsole has appropriate methods', t => {
	t.is(typeof $console.$debug, 'function');
	t.is(typeof $console.$error, 'function');
	t.is(typeof $console.$info, 'function');
	t.is(typeof $console.$log, 'function');
	t.is(typeof $console.$warn, 'function');
});

test('NgLogger subclasses NgConsole', t => {
	t.true($log instanceof Object.getPrototypeOf($console).constructor);
});

test('NgLogger has appropriate methods', t => {
	t.is(typeof $log.clear, 'function');
	t.is(typeof $log.confirm, 'function');
	t.is(typeof $log.devWarning, 'function');
	t.is(typeof $log.error, 'function');
	t.is(typeof $log.info, 'function');
	t.is(typeof $log.success, 'function');
	t.is(typeof $log.warning, 'function');
});
