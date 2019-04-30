import test from 'ava';
import { textBox } from '../../../src/inputs/text-box';
import { NgInputController } from '../../../src/inputs';
import * as util from '../-util';
import { app } from '../../-mocks';

const definedTextBox = app.inputs.defineInputComponent(textBox);

test('textbox bindings', async t => {
	t.deepEqual(definedTextBox.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	});
});

test('textbox transclude', async t => {
	t.deepEqual(definedTextBox.transclude, { contain: '?contain' });
});

test('textbox require', async t => {
	t.deepEqual(definedTextBox.require, { ngModelCtrl: 'ngModel' });
});

test('textbox controller', async t => {
	t.true(util.mockCtrl(definedTextBox.controller) instanceof NgInputController);
});

test('textbox controllerAs', async t => {
	t.is(definedTextBox.controllerAs, undefined);
});

test('textbox template', async t => {
	const tpl = util.makeTpl(definedTextBox.template, t);

	const input = util.testInput(tpl, t, 'TEXTAREA');
	t.true(input.classList.contains('form-control'));
	t.is(input.getAttribute('placeholder'), '');
	t.is(input.getAttribute('maxlength'), '3000');

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-control-label'));

	const ngMessages = util.testNgMessages(tpl, t);
	const maxlength = ngMessages.querySelector('[ng-message="maxlength"]') as HTMLDivElement;
	t.true(maxlength.classList.contains('text-danger'));

	util.testNgTranscludeContain(tpl, t);
});
