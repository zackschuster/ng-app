// tslint:disable:no-async-without-await
import test from 'ava';
import { textBox } from '../../../src/input';
import { InputService } from '../../../src/input/service';
import { NgComponentController } from '../../mocks';
import * as util from '../-util';

const definition = InputService.defineInputComponent(textBox, document);

let template: Element;
let controller: NgComponentController;
test.beforeEach(async t => {
	template = util.makeTpl(definition.template, t);
	controller = util.mockCtrl(definition.controller, { }, template);
});

test('textbox bindings', async t => {
	t.deepEqual(definition.bindings, {
		ngModel: '=',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
	});
});

test('textbox transclude', async t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('textbox require', async t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('textbox controller', async t => {
	t.true(controller instanceof NgComponentController);
});

test('textbox controllerAs', async t => {
	t.is(definition.controllerAs, undefined);
});

test('textbox template', async t => {
	const input = util.testInput(template, t, 'TEXTAREA');
	t.true(input.classList.contains('form-control'));
	t.is(input.getAttribute('msd-elastic'), '');
	t.is(input.getAttribute('placeholder'), '');
	t.is(input.getAttribute('maxlength'), '3000');

	const label = util.testLabel(template, t);
	t.true(label.classList.contains('form-control-label'));

	const ngMessages = util.testNgMessages(template, t);
	const maxlength = ngMessages.querySelector('[ng-message="maxlength"]') as HTMLDivElement;
	t.true(maxlength.classList.contains('text-danger'));

	util.testNgTranscludeContain(template, t);
});
