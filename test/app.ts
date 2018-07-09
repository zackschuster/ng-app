import test from 'ava';
import { NgDataService, NgLogger, NgModalService, app } from '..';
import { $prefix } from './mocks';

app.config = {
	PREFIX: {
		API: $prefix,
	},
};

test('app.module.name is app.$id', async t => {
	t.is(app.$id, app.module.name);
});

test(`app.bootstrap() throws without base tag`, async t => {
	t.throws(app.bootstrap);
});

test(`app.bootstrap() doesn't throw with base tag`, async t => {
	const base = document.createElement('base');
	base.href = '/';
	document.head.appendChild(base);
	t.notThrows(app.bootstrap);
});

test('app has default input components', async t => {
	t.deepEqual(app.components, [
		'checkBox',
		'dateInput',
		'radioList',
		'selectList',
		'textBox',
		'textInput',
	]);
});

test('app.http() returns NgDataService', async t => {
	t.true(app.http() instanceof NgDataService);
});

test('app.logger() returns NgLogger', async t => {
	t.true(app.logger() instanceof NgLogger);
});

test('app.modal() returns NgModalService', async t => {
	t.true(app.modal() instanceof NgModalService);
});
