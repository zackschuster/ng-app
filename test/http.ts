// tslint:disable:no-async-without-await
import test from 'ava';
import { $http, $prefix, pingTestUrl } from './mocks';
import http from 'http';
import { HttpStatusCode } from '@ledge/types/http';

const PORT = 2323;
http
	.createServer((req, res) => {
		res.writeHead(HttpStatusCode.Ok, { 'Content-Type': 'application/json' });
		res.end(JSON.stringify({ data: req.url as string }));
	})
	.listen(PORT);

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
