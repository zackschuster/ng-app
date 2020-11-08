import test from 'ava';
import { $modal } from './mocks';

test('modal has appropriate methods', t => {
	const modal = $modal.open({});

	t.is(typeof modal.close, 'function');
	t.is(typeof modal.dismiss, 'function');
});
