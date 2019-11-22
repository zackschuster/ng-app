// tslint:disable:no-async-without-await
import test from 'ava';
import { app } from './mocks';
import { NgDataService, NgLogger, NgModalService } from '../src/services';

test('app.module.name is app.$id', async t => {
	t.is(app.$id, app.module.name);
});

test('app has default input components', async t => {
	t.deepEqual(app.components, new Set([
		'checkBox',
		'dateInput',
		'radioList',
		'selectList',
		'textBox',
		'htmlInput',
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
