import test from 'ava';
import * as util from '../-util';
import { InputService, NgInputController, inputs } from '../../../index';

const definition = InputService.defineInputComponent(inputs.textInput);
const { controller, template } = util.mockInputCtrl(definition);

test.after(t => {
	t.snapshot(template.outerHTML);
});

test('textinput -> htmlinput alias', t => {
	// should be separate objects with the same layout
	t.false(definition === InputService.defineInputComponent(inputs.htmlInput));
	// TODO: fails, fix
	// t.deepEqual(definedHtmlInput, definedTextInput);
});

test('textinput bindings', t => {
	t.deepEqual(definition.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
		min: '<',
		max: '<',
		step: '<',
	});
});

test('textinput transclude', t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('textinput require', t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('textinput controller', t => {
	t.true(controller instanceof NgInputController);
});

test('textinput controller (number)', t => {
	const { controller: numberCtrl } = util.mockInputCtrl(definition, { min: 1, max: 3, type: 'number' });
	t.true(numberCtrl instanceof NgInputController);
	t.is(numberCtrl.$attrs.type, 'number');
	t.is(numberCtrl.$attrs.min, 1);
	t.is(numberCtrl.$attrs.max, 3);

	numberCtrl.ngModelCtrl = { $validators: {} } as any;

	if (typeof numberCtrl.$onInit === 'function') {
		numberCtrl.$onInit();
	} else {
		t.fail('text input (number) controller has no $onInit method');
	}

	t.is(Object.keys(numberCtrl.ngModelCtrl.$validators).length, 2);

	// min and max are initially undefined, so should return true for all
	t.true(numberCtrl.ngModelCtrl.$validators.minVal(0, 0));
	t.true(numberCtrl.ngModelCtrl.$validators.minVal(1, 1));
	t.true(numberCtrl.ngModelCtrl.$validators.maxVal(3, 3));
	t.true(numberCtrl.ngModelCtrl.$validators.maxVal(4, 4));

	// manually set min and max for "proper" validation
	numberCtrl.min = Number(numberCtrl.$attrs.min);
	numberCtrl.max = Number(numberCtrl.$attrs.max);

	t.false(numberCtrl.ngModelCtrl.$validators.minVal(0, 0));
	t.true(numberCtrl.ngModelCtrl.$validators.minVal(1, 1));
	t.true(numberCtrl.ngModelCtrl.$validators.maxVal(3, 3));
	t.false(numberCtrl.ngModelCtrl.$validators.maxVal(4, 4));
});

test('textinput controllerAs', t => {
	t.is(definition.controllerAs, undefined);
});

test('textinput element', t => {
	t.is((controller as any).$element, template);
});

test('textinput template', t => {
	const input = util.testInput(template, t);
	t.true(input.classList.contains('form-control'));
	t.is(input.type, 'text');
	t.is(input.getAttribute('placeholder'), '');
	t.is(input.getAttribute('maxlength'), '3000');

	const label = util.testLabel(template, t);
	t.true(label.classList.contains('form-control-label'));

	const ngMessages = util.testNgMessages(template, t);
	const maxlength = ngMessages.querySelector('[ng-message="maxlength"]') as HTMLDivElement;
	t.true(maxlength.classList.contains('text-danger'));

	util.testNgTranscludeContain(template, t);
});

test('textinput template (number)', t => {
	const tpl = util.makeTpl(definition.template, t, { type: 'number' });
	const input = util.testInput(tpl, t);
	t.true(input.classList.contains('form-control'));
	t.is(input.type, 'number');
	t.is(input.getAttribute('placeholder'), '');
	t.is(input.getAttribute('maxlength'), '3000');
	t.is(input.getAttribute('ng-attr-min'), '{{$ctrl.min}}');
	t.is(input.getAttribute('ng-attr-max'), '{{$ctrl.max}}');
	t.is(input.getAttribute('ng-attr-step'), `{{$ctrl.step || 'any'}}`);

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-control-label'));

	const ngMessages = util.testNgMessages(tpl, t);
	const maxlength = ngMessages.querySelector('[ng-message="maxlength"]') as HTMLDivElement;
	t.true(maxlength.classList.contains('text-danger'));
	const minVal = ngMessages.querySelector('[ng-message="minVal"]') as HTMLDivElement;
	t.true(minVal.classList.contains('text-danger'));
	const maxVal = ngMessages.querySelector('[ng-message="maxVal"]') as HTMLDivElement;
	t.true(maxVal.classList.contains('text-danger'));

	util.testNgTranscludeContain(tpl, t);
});

test('textinput template (range)', t => {
	const tpl = util.makeTpl(definition.template, t, { type: 'range' });

	const input = util.testInput(tpl, t);
	t.true(input.classList.contains('custom-range'));
	t.is(input.type, 'range');
	t.is(input.getAttribute('placeholder'), null);
	t.is(input.getAttribute('maxlength'), null);
	t.is(input.getAttribute('ng-attr-min'), '{{$ctrl.min}}');
	t.is(input.getAttribute('ng-attr-max'), '{{$ctrl.max}}');
	t.is(input.getAttribute('ng-attr-step'), `{{$ctrl.step || '1'}}`);

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-control-label'));

	const ngMessages = util.testNgMessages(tpl, t);
	const minVal = ngMessages.querySelector('[ng-message="minVal"]') as HTMLDivElement;
	t.true(minVal.classList.contains('text-danger'));
	const maxVal = ngMessages.querySelector('[ng-message="maxVal"]') as HTMLDivElement;
	t.true(maxVal.classList.contains('text-danger'));

	util.testNgTranscludeContain(tpl, t);
});
