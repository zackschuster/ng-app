import test from 'ava';
import * as util from '../-util';
import { InputService, NgInputController, inputs } from '../../../index';

const definition = InputService.defineInputComponent(inputs.dateInput);
const { controller, template } = util.mockInputCtrl(definition);

test.after(t => {
	t.snapshot(template.outerHTML);
});

test('date bindings', t => {
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

test('date transclude', t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('date require', t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('date controller', t => {
	t.true(controller instanceof NgInputController);
});

test('date controllerAs', t => {
	t.is(definition.controllerAs, undefined);
});

test('date element', t => {
	t.is((controller as any).$element, template);
});

test('date template', t => {
	const tpl = util.makeTpl(definition.template, t);
	t.true(tpl.classList.contains('form-group'));

	const inputGroup = tpl.querySelector('.input-group') as HTMLDivElement;
	t.true(inputGroup.classList.contains('input-group'));
	t.is(inputGroup.tagName, 'DIV');

	const input = util.testInput(tpl, t);
	t.is(input.getAttribute('type'), 'date');

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});

test('date template (fallback)', t => {
	const tpl = util.makeTpl(definition.template, t, {
		useFallback: true,
		minYear: 1900,
		maxYear: 2100,
		defaultYear: 2020,
		defaultMonth: 10,
	});
	t.true(tpl.classList.contains('form-group'));

	const inputGroup = tpl.querySelector('.input-group') as HTMLDivElement;
	t.is(inputGroup.tagName, 'DIV');

	const inputGroupText = inputGroup.firstElementChild as HTMLParagraphElement;
	t.is(inputGroupText.tagName, 'P');

	const icon = inputGroupText.firstElementChild as SVGElement;
	t.is(icon.tagName, 'svg');
	t.is(icon.getAttribute('aria-hidden'), 'true');

	const input = util.testInput(tpl, t, 'SELECT');
	t.is(input.getAttribute('type'), null);
	t.is(tpl.querySelectorAll('select').length, 3);

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
