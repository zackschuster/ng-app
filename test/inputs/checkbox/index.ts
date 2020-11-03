// tslint:disable:no-async-without-await
import test from 'ava';
import * as util from '../-util';
import { InputService, NgInputController, inputs } from '../../..';

const definition = InputService.defineInputComponent(inputs.checkBox);
const { controller, template } = util.mockInputCtrl(definition);

test.after(async t => {
	t.snapshot(template.outerHTML);
});

test('checkbox bindings', async t => {
	t.deepEqual(definition.bindings, {
		ngModel: '=',
		ngChecked: '<',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	});
});

test('checkbox transclude', async t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('checkbox require', async t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('checkbox controller', async t => {
	t.true(controller instanceof NgInputController);
});

test('checkbox controllerAs', async t => {
	t.is(definition.controllerAs, undefined);
});

test('checkbox element', async t => {
	t.is((controller as any).$element, template);
});

test('checkbox template', async t => {
	t.true(template.classList.contains('form-check'));

	const input = util.testInput(template, t);
	t.is(input.type, 'checkbox');
	t.true(input.classList.contains('form-check-input'));

	const label = util.testLabel(template, t);
	t.true(label.classList.contains('form-check-label'));

	util.testNgMessages(template, t);
	util.testNgTranscludeContain(template, t);
});

test('checkbox template (inlined)', async t => {
	const tpl = util.makeTpl(definition.template, t, { inline: true });

	t.true(tpl.classList.contains('form-check-inline'));

	const input = util.testInput(tpl, t);
	t.is(input.type, 'checkbox');
	t.true(input.classList.contains('form-check-input'));

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
