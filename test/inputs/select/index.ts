import test from 'ava';
import { selectList } from '../../../src/input/components';
import { InputService } from '../../../src/input/service';
import { NgInputController } from '../../mocks';
import * as util from '../_util';

const definedSelectList = InputService.defineInputComponent(selectList, document);

test('select bindings', async t => {
	t.deepEqual(definedSelectList.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
		list: '<',
	});
});

test('select transclude', async t => {
	t.deepEqual(definedSelectList.transclude, { contain: '?contain' });
});

test('select require', async t => {
	t.deepEqual(definedSelectList.require, { ngModelCtrl: 'ngModel' });
});

test('select controller', async t => {
	t.true(util.mockCtrl(definedSelectList.controller) instanceof NgInputController);
});

test('select controllerAs', async t => {
	t.is(definedSelectList.controllerAs, undefined);
});

test('select template', async t => {
	const tpl = util.makeTpl(definedSelectList.template, t);
	const input = util.testInput(tpl, t, 'SELECT');

	const placeholder = input.firstElementChild as HTMLOptionElement;
	t.is(placeholder.getAttribute('placeholder'), 'true');
	t.is(placeholder.getAttribute('value'), '');

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});

test('select template (multiple)', async t => {
	const tpl = util.makeTpl(definedSelectList.template, t, { multiple: true });
	const input = util.testInput(tpl, t, 'SELECT');

	t.is(input.getAttribute('multiple'), 'true');
	t.is(input.firstElementChild, null);

	util.testLabel(tpl, t);
	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
