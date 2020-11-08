// tslint:disable:no-async-without-await
import test from 'ava';
import { $http, $prefix, pingTestUrl } from './mocks';

test('getFullUrl returns prefixed url', async t => {
	t.is($http.getFullUrl('test', $prefix, false), `http://${$prefix}/test`);
});

test('http get', async t => {
	t.deepEqual(await pingTestUrl('GET', 'got'), { data: '/got' });
});
test('http post', async t => {
	t.deepEqual(await pingTestUrl('POST', 'posted'), { data: '/posted' });
});
test('http put', async t => {
	t.deepEqual(await pingTestUrl('PUT', 'set'), { data: '/set' });
});
test('http patch', async t => {
	t.deepEqual(await pingTestUrl('PATCH', 'patched'), { data: '/patched' });
});
test('http delete', async t => {
	t.deepEqual(await pingTestUrl('DELETE', 'deleted'), { data: '/deleted' });
});
// $sceDelegate blocks jsonp; see ./mocks/_http.ts
// test('http jsonp', async t => {
// 	t.is(await pingTestUrl('JSONP', 'test', 'success'), 'success');
// });
