// tslint:disable:no-async-without-await no-magic-numbers
import test from 'ava';
import { htmlInput, textInput } from '../../../src/input/components';
import { InputService } from '../../../src/input/service';
import { NgInputController } from '../../mocks';
import * as util from '../-util';

const definition = InputService.defineInputComponent(textInput, document);
const { controller, template } = util.mockCtrl(definition);

test.after(async t => {
	t.snapshot(template.outerHTML);
});

test('textinput -> htmlinput alias', async t => {
	// should be separate objects with the same layout
	t.false(definition === InputService.defineInputComponent(htmlInput, document));
	// TODO: fails, fix
	// t.deepEqual(definedHtmlInput, definedTextInput);
});

test('textinput bindings', async t => {
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

test('textinput transclude', async t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('textinput require', async t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('textinput controller', async t => {
	t.true(controller instanceof NgInputController);
});

test('textinput controller (number)', async t => {
	const { controller: numberCtrl } = util.mockCtrl(definition, { min: 1, max: 3, type: 'number' });
	t.true(numberCtrl instanceof NgInputController);
	t.is(numberCtrl.$attrs.type, 'number');

	numberCtrl.ngModelCtrl = { $validators: { } } as any;

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

test('textinput controllerAs', async t => {
	t.is(definition.controllerAs, undefined);
});

test('textinput element', async t => {
	t.is((controller as any).$element, template);
});

test('textinput template', async t => {
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

test('textinput template (number)', async t => {
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
