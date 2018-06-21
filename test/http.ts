import test from 'ava';
import { $http, $prefix } from './mocks';
// import { $backend, $rootScope } from './mocks';

test('http has appropriate methods', t => {
	t.is(typeof $http.Get, 'function');
	t.is(typeof $http.Post, 'function');
	t.is(typeof $http.Put, 'function');
	t.is(typeof $http.Patch, 'function');
	t.is(typeof $http.Delete, 'function');
	t.is(typeof $http.Jsonp, 'function');
});

test('getFullUrl returns prefixed url', t => {
	t.is($http.getFullUrl('test'), `${$prefix}/test`);
});

// fails with "promise not resolved" error
// test('http get', async t => {
// 	$backend.whenGET($http.getFullUrl('test')).respond(200, 'success');
// 	$rootScope.$apply();
// 	t.is(await $http.Get<string>('test'), 'success');
// });
