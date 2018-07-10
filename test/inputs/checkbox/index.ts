import test from 'ava';
import { checkBox } from '../../../src/input';
import { InputService } from '../../../src/input/service';
import { NgComponentController } from '../../mocks';
import * as util from '../_util';

const definedCheckBox = InputService.defineInputComponent(checkBox, document);

test('check box bindings', async t => {
	t.deepEqual(definedCheckBox.bindings, {
		ngModel: '=',
		ngChecked: '<',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	});
});

test('check box transclude', async t => {
	t.deepEqual(definedCheckBox.transclude, {
		contain: '?contain',
	});
});

test('check box controller', async t => {
	t.true(util.mockCtrl(definedCheckBox.controller) instanceof NgComponentController);
});

test('check box controllerAs', async t => {
	t.is(definedCheckBox.controllerAs, undefined);
});

test('check box template', async t => {
	const tpl = util.makeTpl(definedCheckBox.template, 'checkbox');

	t.true(tpl.classList.contains('form-check'));

	const input = util.testInput(tpl, t);
	t.is(input.type, 'checkbox');
	t.true(input.classList.contains('form-check-input'));

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
