import http from 'http';
import test from 'ava';

import { $prefix, app } from './-mocks';

async function pingTestUrl(
	method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE' | 'JSONP',
	endpoint: string,
) {
	let rsp: any;
	switch (method) {
		case 'GET':
			rsp = await app.http.Get<string>(endpoint);
			break;
		case 'POST':
			rsp = await app.http.Post<string>(endpoint, endpoint);
			break;
		case 'PUT':
			rsp = await app.http.Put<string>(endpoint, endpoint);
			break;
		case 'PATCH':
			rsp = await app.http.Patch<string>(endpoint, [{ op: 'add', path: '/path', value: endpoint }]);
			break;
		case 'DELETE':
			rsp = await app.http.Delete<string>(endpoint);
			break;
		case 'JSONP':
			throw new Error('Currently unable to test JSONP');
		// 	return $http.Jsonp<string>(endpoint);
		default:
			throw new Error('Bad method');
	}

	return rsp;
}

http.createServer((req, res) => {
	res.writeHead(200, { 'Content-Type': 'application/json' });
	res.end(JSON.stringify({ data: req.url as string }));
}).listen(2323);

test('getFullUrl returns prefixed url', async t => {
	t.is(app.http.getFullUrl('test', $prefix, false), `http://${$prefix}/test`);
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
