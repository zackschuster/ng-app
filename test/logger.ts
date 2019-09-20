// tslint:disable: no-async-without-await
import test from 'ava';

import { NgService } from '../src/service';
import { app } from './-mocks';

test('console subclasses service', async t => {
	t.true(app.console instanceof NgService);
});

test('console has appropriate methods', async t => {
	t.is(typeof app.console.$debug, 'function');
	t.is(typeof app.console.$error, 'function');
	t.is(typeof app.console.$info, 'function');
	t.is(typeof app.console.$log, 'function');
	t.is(typeof app.console.$warn, 'function');
});

test('logger subclasses console', async t => {
	t.true(app.log instanceof Object.getPrototypeOf(app.console).constructor);
});

test('logger has appropriate methods', async t => {
	t.is(typeof app.log.clear, 'function');
	t.is(typeof app.log.confirm, 'function');
	t.is(typeof app.log.devWarning, 'function');
	t.is(typeof app.log.error, 'function');
	t.is(typeof app.log.info, 'function');
	t.is(typeof app.log.success, 'function');
	t.is(typeof app.log.warning, 'function');
});
