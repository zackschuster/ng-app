import test from 'ava';
import { textInput } from '../../../src/input';
import { InputService } from '../../../src/input/service';
import { NgComponentController } from '../../mocks';
import * as util from '../_util';

const definedTextInput = InputService.defineInputComponent(textInput, document);

test('textinput bindings', async t => {
	t.deepEqual(definedTextInput.bindings, {
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
	t.deepEqual(definedTextInput.transclude, { contain: '?contain' });
});

test('textinput require', async t => {
	t.deepEqual(definedTextInput.require, { ngModelCtrl: 'ngModel' });
});

test('textinput controller', async t => {
	t.true(util.mockCtrl(definedTextInput.controller) instanceof NgComponentController);
});

test('textinput controllerAs', async t => {
	t.is(definedTextInput.controllerAs, undefined);
});

test('textinput template', async t => {
	const tpl = util.makeTpl(definedTextInput.template, t);

	const input = util.testInput(tpl, t);
	t.true(input.classList.contains('form-control'));
	t.is(input.type, 'text');
	t.is(input.getAttribute('placeholder'), '');
	t.is(input.getAttribute('maxlength'), '3000');

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-control-label'));

	const ngMessages = util.testNgMessages(tpl, t);
	const maxlength = ngMessages.querySelector('[ng-message="maxlength"]') as HTMLDivElement;
	t.true(maxlength.classList.contains('text-danger'));

	util.testNgTranscludeContain(tpl, t);
});

test('textinput template (number)', async t => {
	const tpl = util.makeTpl(definedTextInput.template, t, { type: 'number' });

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
