// tslint:disable: no-async-without-await
import test from 'ava';
import { app } from './-mocks';

test('modal has appropriate methods', async t => {
	const modal = app.modal.open({ });

	t.is(typeof modal.close, 'function');
	t.is(typeof modal.dismiss, 'function');
});
