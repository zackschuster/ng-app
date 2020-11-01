// tslint:disable:no-async-without-await
import test from 'ava';
import { $prefix, app } from './mocks';
import { NgHttp } from '../src/http';
import { NgLogger } from '../src/logger';
import { NgModal } from '../src/modal';

test('app.module.name is app.$id', async t => {
	t.is(app.$id, app.module.name);
});

test('app.bootstrap() throws without base tag', async t => {
	await t.throwsAsync(app.bootstrap);
});

test(`app.bootstrap() doesn't throw with base tag`, async t => {
	const base = document.createElement('base');
	base.href = '/';
	(document.head as HTMLHeadElement).appendChild(base);
	await t.notThrowsAsync(() => app.bootstrap());
});

test('app has default input components', async t => {
	t.deepEqual(app.components, [
		'checkBox',
		'dateInput',
		'radioList',
		'selectList',
		'textBox',
		'htmlInput',
		'textInput',
		'appSpinner',
	]);
});

test('app.http returns NgDataService', async t => {
	t.true(app.http instanceof NgHttp);
});

test('app.http.getFullUrl returns prefixed url', async t => {
	t.is(app.http.getFullUrl('test', $prefix, false), `http://${$prefix}/test`);
});

test('app.log returns NgLogger', async t => {
	t.true(app.log instanceof NgLogger);
});

test('app.modal returns NgModalService', async t => {
	t.true(app.modal instanceof NgModal);
});
