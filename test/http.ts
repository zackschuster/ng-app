import test from 'ava';
import { $http } from './mocks';
// import { $backend, $http } from './mocks';

test('http has appropriate methods', t => {
	t.is(typeof $http.Get, 'function');
	t.is(typeof $http.Post, 'function');
	t.is(typeof $http.Put, 'function');
	t.is(typeof $http.Patch, 'function');
	t.is(typeof $http.Delete, 'function');
	t.is(typeof $http.Jsonp, 'function');
});

// fails with "promise not resolved" error
// test('http get', async t => {
// 	$backend.whenGET($http.getFullUrl('test')).respond('success');
// 	t.is(await $http.Get<string>('test'), 'success');
// });
