import test from 'ava';
import { textBox } from '../../../src/input';
import { InputService } from '../../../src/input/service';
import { NgComponentController } from '../../mocks';
import * as util from '../_util';

const definedTextBox = InputService.defineInputComponent(textBox, document);

test('check box bindings', async t => {
	t.deepEqual(definedTextBox.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	});
});

test('check box transclude', async t => {
	t.deepEqual(definedTextBox.transclude, {
		contain: '?contain',
	});
});

test('check box controller', async t => {
	t.true(util.mockCtrl(definedTextBox.controller) instanceof NgComponentController);
});

test('check box controllerAs', async t => {
	t.is(definedTextBox.controllerAs, undefined);
});

test('check box template', async t => {
	const tpl = util.makeTpl(definedTextBox.template, 'textbox');

	const input = util.testInput(tpl, t, 'TEXTAREA');
	t.true(input.classList.contains('form-control'));
	t.is(input.getAttribute('msd-elastic'), '');
	t.is(input.getAttribute('placeholder'), '');
	t.is(input.getAttribute('maxlength'), '3000');

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-control-label'));

	const ngMessages = util.testNgMessages(tpl, t);
	const maxlength = ngMessages.querySelector('[ng-message="maxlength"]') as HTMLDivElement;
	t.true(maxlength.classList.contains('text-danger'));

	util.testNgTranscludeContain(tpl, t);
});
