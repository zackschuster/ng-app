// tslint:disable:no-async-without-await
import test from 'ava';
import * as util from '../-util';
import { InputService, NgInputController, inputs } from '../../..';

const definition = InputService.defineInputComponent(inputs.dateInput);
const { controller, template } = util.mockInputCtrl(definition);

test.after(async t => {
	t.snapshot(template.outerHTML);
});

test('date bindings', async t => {
	t.deepEqual(definition.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
		minDate: '<',
		maxDate: '<',
	});
});

test('date transclude', async t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('date require', async t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('date controller', async t => {
	t.true(controller instanceof NgInputController);
});

test('date controllerAs', async t => {
	t.is(definition.controllerAs, undefined);
});

test('date element', async t => {
	t.is((controller as any).$element, template);
});

test('date template', async t => {
	const tpl = util.makeTpl(definition.template, t);
	t.true(tpl.classList.contains('form-group'));

	const inputGroup = tpl.querySelector('.input-group') as HTMLDivElement;
	t.true(inputGroup.classList.contains('input-group'));
	t.is(inputGroup.tagName, 'DIV');

	const inputGroupPrepend = inputGroup.firstElementChild as HTMLDivElement;
	t.true(inputGroupPrepend.classList.contains('input-group-prepend'));
	t.is(inputGroupPrepend.tagName, 'DIV');
	t.is(inputGroupPrepend.getAttribute('data-toggle'), 'true');
	t.is(inputGroupPrepend.style.cursor, 'pointer');

	const inputGroupText = inputGroupPrepend.firstElementChild as HTMLSpanElement;
	t.true(inputGroupText.classList.contains('input-group-text'));
	t.is(inputGroupText.tagName, 'SPAN');

	const icon = inputGroupText.firstElementChild as HTMLSpanElement;
	t.true(icon.classList.contains('fa'));
	t.true(icon.classList.contains('fa-calendar'));
	t.is(icon.getAttribute('aria-hidden'), 'true');

	const input = util.testInput(tpl, t);
	t.is(input.getAttribute('data-input'), 'true');

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
