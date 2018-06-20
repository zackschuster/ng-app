import test from 'ava';
import { mockHttp as $http } from './mocks';

test('http has appropriate methods', t => {
	t.is(typeof $http.Get, 'function');
	t.is(typeof $http.Post, 'function');
	t.is(typeof $http.Put, 'function');
	t.is(typeof $http.Patch, 'function');
	t.is(typeof $http.Delete, 'function');
	t.is(typeof $http.Jsonp, 'function');
});
