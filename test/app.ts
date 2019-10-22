// tslint:disable:no-async-without-await
import test from 'ava';
import { NgDataService, NgLogger, NgModalService } from '..';
import { app } from './mocks';

test('app.module.name is app.$id', async t => {
	t.is(app.$id, app.module.name);
});

test(`app.bootstrap() throws without base tag`, async t => {
	t.throws(app.bootstrap);
});

test(`app.bootstrap() doesn't throw with base tag`, async t => {
	const base = document.createElement('base');
	base.href = '/';
	(document.head as HTMLHeadElement).appendChild(base);
	t.notThrows(app.bootstrap);
});

test('app has default input components', async t => {
	t.deepEqual(app.components, new Set([
		'checkBox',
		'dateInput',
		'radioList',
		'selectList',
		'textBox',
		'textInput',
	]));
});

test('app.http returns NgDataService', async t => {
	t.true(app.http instanceof NgDataService);
});

test('app.log returns NgLogger', async t => {
	t.true(app.log instanceof NgLogger);
});

test('app.modal returns NgModalService', async t => {
	t.true(app.modal instanceof NgModalService);
});
