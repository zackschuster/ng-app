import test from 'ava';
import { checkBox } from '../../../src/inputs/check-box';
import { InputService, NgInputController } from '../../../src/inputs';
import * as util from '../_util';

const definedCheckBox = InputService.defineInputComponent(checkBox);

test('checkbox bindings', async t => {
	t.deepEqual(definedCheckBox.bindings, {
		ngModel: '=',
		ngChecked: '<',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	});
});

test('checkbox transclude', async t => {
	t.deepEqual(definedCheckBox.transclude, { contain: '?contain' });
});

test('checkbox require', async t => {
	t.deepEqual(definedCheckBox.require, { ngModelCtrl: 'ngModel' });
});

test('checkbox controller', async t => {
	t.true(util.mockCtrl(definedCheckBox.ctrl) instanceof NgInputController);
});

test('checkbox controllerAs', async t => {
	t.is(definedCheckBox.controllerAs, undefined);
});

test('checkbox template', async t => {
	const tpl = util.makeTpl(definedCheckBox.template, t);

	t.true(tpl.classList.contains('form-check'));

	const input = util.testInput(tpl, t);
	t.is(input.type, 'checkbox');
	t.true(input.classList.contains('form-check-input'));

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});

test('checkbox template (inlined)', async t => {
	const tpl = util.makeTpl(definedCheckBox.template, t, { inline: true });

	t.true(tpl.classList.contains('form-check-inline'));

	const input = util.testInput(tpl, t);
	t.is(input.type, 'checkbox');
	t.true(input.classList.contains('form-check-input'));

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
