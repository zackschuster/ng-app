// tslint:disable:no-async-without-await
import test from 'ava';
import { selectList } from '../../../src/input';
import { InputService } from '../../../src/input/service';
import { NgComponentController } from '../../mocks';
import * as util from '../-util';

const definition = InputService.defineInputComponent(selectList, document);

let template: Element;
let controller: NgComponentController;
test.beforeEach(async t => {
	template = util.makeTpl(definition.template, t);
	controller = util.mockCtrl(definition.controller, { }, template);
});

test('select bindings', async t => {
	t.deepEqual(definition.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
		list: '<',
	});
});

test('select transclude', async t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('select require', async t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('select controller', async t => {
	t.true(controller instanceof NgComponentController);
});

test('select controllerAs', async t => {
	t.is(definition.controllerAs, undefined);
});

test('select element', async t => {
	t.is((controller as any).$element, template);
});

test('select template', async t => {
	const tpl = util.makeTpl(definition.template, t);
	const input = util.testInput(tpl, t, 'SELECT');

	const placeholder = input.firstElementChild as HTMLOptionElement;
	t.is(placeholder.getAttribute('placeholder'), 'true');
	t.is(placeholder.getAttribute('value'), '');

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});

test('select template (multiple)', async t => {
	const tpl = util.makeTpl(definition.template, t, { multiple: true });
	const input = util.testInput(tpl, t, 'SELECT');

	t.is(input.getAttribute('multiple'), 'true');
	t.is(input.firstElementChild, null);

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
