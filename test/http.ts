// tslint:disable:no-async-without-await
import test from 'ava';
import { $http, $prefix, pingTestUrl } from './mocks';

test('getFullUrl returns prefixed url', async t => {
	t.is($http.getFullUrl('test'), `${$prefix}/test`);
});

test('http get', async t => {
	t.is(await pingTestUrl('GET', 'got'), 'got');
});
test('http post', async t => {
	t.is(await pingTestUrl('POST', 'posted'), 'posted');
});
test('http put', async t => {
	t.is(await pingTestUrl('PUT', 'set'), 'set');
});
test('http patch', async t => {
	t.is(await pingTestUrl('PATCH', 'patched'), 'patched');
});
test('http delete', async t => {
	t.is(await pingTestUrl('DELETE', 'deleted'), 'deleted');
});
// $sceDelegate blocks jsonp; see ./mocks/_http.ts
// test('http jsonp', async t => {
// 	t.is(await pingTestUrl('JSONP', 'test', 'success'), 'success');
// });
