import test from 'ava';
import * as util from '../-util';
import { InputService, NgInputController, inputs } from '../../../index';

const definition = InputService.defineInputComponent(inputs.textBox);
const { controller, template } = util.mockInputCtrl(definition);

test.after(t => {
	t.snapshot(template.outerHTML);
});

test('textbox bindings', t => {
	t.deepEqual(definition.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	});
});

test('textbox transclude', t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('textbox require', t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('textbox controller', t => {
	t.true(controller instanceof NgInputController);
});

test('textbox controllerAs', t => {
	t.is(definition.controllerAs, undefined);
});

test('textbox element', t => {
	t.is((controller as any).$element, template);
});

test('textbox template', t => {
	const input = util.testInput(template, t, 'TEXTAREA');
	t.true(input.classList.contains('form-control'));
	t.is(input.getAttribute('placeholder'), '');
	t.is(input.getAttribute('maxlength'), '3000');

	const label = util.testLabel(template, t);
	t.true(label.classList.contains('form-control-label'));

	const ngMessages = util.testNgMessages(template, t);
	const maxlength = ngMessages.querySelector('[ng-message="maxlength"]') as HTMLDivElement;
	t.true(maxlength.classList.contains('text-danger'));

	util.testNgTranscludeContain(template, t);
});
