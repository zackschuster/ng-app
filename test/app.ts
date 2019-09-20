// tslint:disable: no-async-without-await
import test from 'ava';
import { NgHttp, NgLogger, NgModal, inputs, misc } from '..';
import { $prefix, app } from './-mocks';

test('app.module.name is app.$id', async t => {
	t.is(app.$id, app.module.name);
});

test('app has default input components', async t => {
	t.deepEqual(app.components, new Set([...Object.keys(inputs), ...Object.keys(misc)]));
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
