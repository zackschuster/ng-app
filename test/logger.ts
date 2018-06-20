import test from 'ava';
import { mockLogger } from './mocks';

test('logger exists', t => {
	t.truthy(mockLogger);
});
