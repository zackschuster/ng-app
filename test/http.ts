import test from 'ava';
import { $http, $prefix, pingTestUrl } from './mocks';

test('NgHttp has a method for returning the prefixed url', t => {
	t.is($http.getFullUrl('test', $prefix, false), `http://${$prefix}/test`);
});

test('NgHttp can send a GET request', async t => {
	t.deepEqual(await pingTestUrl('GET', 'got'), { data: '/got' });
});

test('NgHttp can send a GET request with an $sce trusted url', async t => {
	t.deepEqual(await pingTestUrl('GET', 'got', { useSce: true }), { data: '/got' });
});

test('NgHttp can send a POST request', async t => {
	t.deepEqual(await pingTestUrl('POST', 'posted'), { data: '/posted' });
});

test('NgHttp can send a POST request with an $sce trusted url', async t => {
	t.deepEqual(await pingTestUrl('POST', 'posted', { useSce: true }), { data: '/posted' });
});

test('NgHttp can send a PUT request', async t => {
	t.deepEqual(await pingTestUrl('PUT', 'set'), { data: '/set' });
});

test('NgHttp can send a PUT request with an $sce trusted url', async t => {
	t.deepEqual(await pingTestUrl('PUT', 'set', { useSce: true }), { data: '/set' });
});

test('NgHttp can send a PATCH request', async t => {
	t.deepEqual(await pingTestUrl('PATCH', 'patched'), { data: '/patched' });
});

test('NgHttp can send a PATCH request with an $sce trusted url', async t => {
	t.deepEqual(await pingTestUrl('PATCH', 'patched', { useSce: true }), { data: '/patched' });
});

test('NgHttp can send a DELETE request', async t => {
	t.deepEqual(await pingTestUrl('DELETE', 'deleted'), { data: '/deleted' });
});

test('NgHttp can send a DELETE request with an $sce trusted url', async t => {
	t.deepEqual(await pingTestUrl('DELETE', 'deleted', { useSce: true }), { data: '/deleted' });
});

// currently throws $digest-in-progress error
// test('NgHttp has a method for sending a JSONP request', async t => {
// 	t.deepEqual(await pingTestUrl('JSONP', 'jsonp'), { data: '/jsonp' });
// });
