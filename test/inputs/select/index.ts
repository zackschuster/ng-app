import test from 'ava';
import * as util from '../-util';
import { InputService, NgInputController, inputs } from '../../../index';

const definition = InputService.defineInputComponent(inputs.selectList);
const { controller, template } = util.mockInputCtrl(definition);

test.after(t => {
	t.snapshot(template.outerHTML);
});

test('select bindings', t => {
	t.deepEqual(definition.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
		list: '<',
	});
});

test('select transclude', t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('select require', t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('select controller', t => {
	t.true(controller instanceof NgInputController);
});

test('select controllerAs', t => {
	t.is(definition.controllerAs, undefined);
});

test('select element', t => {
	t.is((controller as any).$element, template);
});

test('select template', t => {
	const input = util.testInput(template, t, 'SELECT');

	const placeholder = input.firstElementChild as HTMLOptionElement;
	t.is(placeholder.getAttribute('placeholder'), 'true');
	t.is(placeholder.getAttribute('value'), '');

	util.testLabel(template, t);
	util.testNgMessages(template, t);
	util.testNgTranscludeContain(template, t);
});

test('select template (multiple)', t => {
	const tpl = util.makeTpl(definition.template, t, { multiple: true });
	const input = util.testInput(tpl, t, 'SELECT');

	t.is(input.getAttribute('multiple'), 'true');
	t.is(input.firstElementChild, null);

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
