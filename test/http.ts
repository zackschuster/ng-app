import test from 'ava';
import { $http, $prefix, pingTestUrl } from './mocks';

test('NgHttp has a method for returning the prefixed url', t => {
	t.is($http.getFullUrl('test', $prefix, false), `http://${$prefix}/test`);
});

test('NgHttp has a method for sending a GET request', async t => {
	t.deepEqual(await pingTestUrl('GET', 'got'), { data: '/got' });
});

test('NgHttp has a method for sending a POST request', async t => {
	t.deepEqual(await pingTestUrl('POST', 'posted'), { data: '/posted' });
});

test('NgHttp has a method for sending a PUT request', async t => {
	t.deepEqual(await pingTestUrl('PUT', 'set'), { data: '/set' });
});

test('NgHttp has a method for sending a PATCH request', async t => {
	t.deepEqual(await pingTestUrl('PATCH', 'patched'), { data: '/patched' });
});

test('NgHttp has a method for sending a DELETE request', async t => {
	t.deepEqual(await pingTestUrl('DELETE', 'deleted'), { data: '/deleted' });
});

// $sceDelegate blocks JSONP by default
// test('NgHttp has a method for sending a JSONP request', async t => {
// 	t.is(await pingTestUrl('JSONP', 'test', 'success'), 'success');
// });
