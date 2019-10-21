// tslint:disable:no-async-without-await
import test from 'ava';
import { checkBox } from '../../../src/input';
import { InputService } from '../../../src/input/service';
import { NgComponentController } from '../../mocks';
import * as util from '../-util';

const definition = InputService.defineInputComponent(checkBox, document);

let template: Element;
let controller: NgComponentController;
test.beforeEach(async t => {
	template = util.makeTpl(definition.template, t);
	controller = util.mockCtrl(definition.controller, { }, template);
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
	t.true(controller instanceof NgComponentController);
});

test('checkbox controllerAs', async t => {
	t.is(definition.controllerAs, undefined);
});

test('checkbox element', async t => {
	t.is((controller as any).$element, template);
});

test('checkbox template', async t => {
	const tpl = util.makeTpl(definition.template, t);

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
