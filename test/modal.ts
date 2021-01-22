import test from 'ava';
import { $openNewModal } from './mocks';

test('NgModal returns appropriate methods on open', t => {
	const modal = $openNewModal();
	t.true(modal.close instanceof Function);
	t.true(modal.dismiss instanceof Function);
	t.true(modal.show instanceof Function);
	t.true(modal.hide instanceof Function);
});

test('NgModal returns element reference on open', t => {
	const modal = $openNewModal();
	t.true(modal.element instanceof HTMLElement);
	t.snapshot(modal.element.outerHTML);
});

test('NgModal returns promise on open', t => {
	const modal = $openNewModal();
	t.true(modal.result.then instanceof Function);
	t.true(modal.result.catch instanceof Function);
	t.true(modal.result.finally instanceof Function);
	t.like(modal.result, {
		$$state: {
			status: 0,
		},
	});
});

test('NgModal promise resolves when close function is called', async t => {
	const modal = $openNewModal();
	setTimeout(modal.close);
	await t.notThrowsAsync(modal.result);
});

test('NgModal promise rejects when dismiss function is called', async t => {
	const modal = $openNewModal();
	setTimeout(modal.dismiss);
	await t.throwsAsync(modal.result);
});

test('NgModal close function calls custom onClose function', t => {
	let called = 0;
	const modal = $openNewModal({
		onClose() {
			t.pass();
			return (called++) > 0;
		},
	});
	t.plan(4);
	modal.close();
	t.like(modal.result, {
		$$state: {
			status: 0,
		},
	});
	modal.close();
	t.like(modal.result, {
		$$state: {
			status: 1,
		},
	});
});

test('NgModal dismiss function does not call custom onClose function', async t => {
	const modal = $openNewModal({
		onClose() {
			t.fail();
			return true;
		},
	});
	setTimeout(modal.dismiss);
	await t.throwsAsync(modal.result);
});

test('NgModal sets default text for title and template when opened', t => {
	const modal = $openNewModal();
	t.is(
		modal.element.querySelector('h5')?.innerHTML,
		'Set the <code>title</code> property to replace me :)',
	);
	t.is(
		modal.element.querySelector('main')?.innerHTML,
		'<p class="lead">Set the <code>template</code> property to replace me :)</p>',
	);
});

test('NgModal allows configuring text for title when opened', t => {
	const modal = $openNewModal({ title: 'Title <h6>Subtitle</h6>' });
	t.is(modal.element.querySelector('h5')?.innerHTML, 'Title <h6>Subtitle</h6>');
	t.is(
		modal.element.querySelector('main')?.innerHTML,
		'<p class="lead">Set the <code>template</code> property to replace me :)</p>',
	);
});

test('NgModal allows configuring text for template when opened', t => {
	const modal = $openNewModal({ template: 'Template <p>Subgraf</p>' });
	t.is(
		modal.element.querySelector('h5')?.innerHTML,
		'Set the <code>title</code> property to replace me :)',
	);
	t.is(modal.element.querySelector('main')?.innerHTML, 'Template <p>Subgraf</p>');
});

test('NgModal sets default text on open for submit and cancel buttons', t => {
	const modal = $openNewModal();
	t.is(modal.element.querySelector<HTMLInputElement>('input[type="submit"]')?.value, 'Ok');
	t.is(modal.element.querySelector('button')?.innerText, 'Cancel');
});

test('NgModal allows configuring text on open for submit button', t => {
	const modal = $openNewModal({ okBtnText: 'I Guess' });
	t.is(modal.element.querySelector<HTMLInputElement>('input[type="submit"]')?.value, 'I Guess');
	t.is(modal.element.querySelector('button')?.innerText, 'Cancel');
});

test('NgModal allows configuring text on open for cancel button', t => {
	const modal = $openNewModal({ cancelBtnText: 'On Second Thought...' });
	t.is(modal.element.querySelector<HTMLInputElement>('input[type="submit"]')?.value, 'Ok');
	t.is(modal.element.querySelector('button')?.innerText, 'On Second Thought...');
});

test('NgModal allows dynamic show & hide', async t => {
	const modal = $openNewModal({ show: false });
	t.is(modal.element.style.getPropertyValue('opacity'), '');
	t.snapshot(modal.element.outerHTML);
	await modal.show();
	t.is(modal.element.style.getPropertyValue('opacity'), '1');
	await modal.hide();
	t.is(modal.element.style.getPropertyValue('opacity'), '0');
});

test('NgModal hides submit button on open when text configuration is set to false', t => {
	const modal = $openNewModal({ okBtnText: false });
	t.true(modal.element.querySelector<HTMLInputElement>('input[type="submit"]')?.hidden);
	t.snapshot(modal.element.outerHTML);
});

test('NgModal hides cancel button on open when text configuration is set to false', t => {
	const modal = $openNewModal({ cancelBtnText: false });
	t.true(modal.element.querySelector('button')?.hidden);
	t.snapshot(modal.element.outerHTML);
});

test('NgModal hides footer on open when submit & cancel text configuration are both set to false', t => {
	const modal = $openNewModal({ okBtnText: false, cancelBtnText: false });
	t.true(modal.element.querySelector<HTMLInputElement>('input[type="submit"]')?.hidden);
	t.true(modal.element.querySelector('button')?.hidden);
	t.true(modal.element.querySelector('footer')?.hidden);
	t.snapshot(modal.element.outerHTML);
});
