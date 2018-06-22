import test from 'ava';
import { $http, $prefix, pingTestUrl } from './mocks';

test('getFullUrl returns prefixed url', t => {
	t.is($http.getFullUrl('test'), `${$prefix}/test`);
});

test('http get', async t => {
	t.is(await pingTestUrl('GET', 'get'), 'get');
});
test('http post', async t => {
	t.is(await pingTestUrl('POST', 'post'), 'post');
});
test('http put', async t => {
	t.is(await pingTestUrl('PUT', 'put'), 'put');
});
test('http patch', async t => {
	t.is(await pingTestUrl('PATCH', 'patch'), 'patch');
});
test('http delete', async t => {
	t.is(await pingTestUrl('DELETE', 'delete'), 'delete');
});
// $sceDelegate blocks jsonp; see ./mocks/_http.ts
// test('http jsonp', async t => {
// 	t.is(await pingTestUrl('JSONP', 'test', 'success'), 'success');
// });
