import test from 'ava';
import { mockHttp } from './mocks';

test('http exists', t => {
	t.truthy(mockHttp);
});
