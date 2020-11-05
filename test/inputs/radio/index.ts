// tslint:disable:no-async-without-await
import test from 'ava';
import * as util from '../-util';
import { InputService, NgInputController, inputs } from '../../../index';

const definition = InputService.defineInputComponent(inputs.radioList);
const { controller, template } = util.mockInputCtrl(definition);

test.after(async t => {
	t.snapshot(template.outerHTML);
});

const radioNgIdRe = /\w([_]{{\$ctrl.uniqueId}}[_]{{\$index}})/;

test('radio bindings', async t => {
	t.deepEqual(definition.bindings, {
		ngModel: '=',
		ngChecked: '<',
		ngModelOptions: '<',
		ngDisabled: '<',
		ngReadonly: '<',
		ngRequired: '<',
		list: '<',
	});
});

test('radio transclude', async t => {
	t.deepEqual(definition.transclude, { contain: '?contain' });
});

test('radio require', async t => {
	t.deepEqual(definition.require, { ngModelCtrl: 'ngModel' });
});

test('radio controller', async t => {
	t.true(controller instanceof NgInputController);
});

test('radio controllerAs', async t => {
	t.is(definition.controllerAs, undefined);
});

test('radio element', async t => {
	t.is((controller as any).$element, template);
});

test('radio template', async t => {
	t.true(template.classList.contains('form-group'));

	const formCheck = template.firstElementChild as Element;
	t.true(formCheck.classList.contains('form-check'));
	t.is(formCheck.getAttribute('ng-repeat'), 'item in $ctrl.list track by $index');

	const input = util.testInput(template, t);
	t.true(input.classList.contains('form-check-input'));
	t.is(input.type, 'radio');
	t.is(input.getAttribute('ng-value'), 'item.Value');
	t.regex(input.getAttribute('ng-attr-id') as string, radioNgIdRe);

	const label = util.testLabel(template, t);
	t.true(label.classList.contains('form-check-label'));
	t.is(label.innerHTML, '{{item.Text}}');
	t.regex(label.getAttribute('ng-attr-for') as string, radioNgIdRe);

	util.testNgMessages(template, t);
	util.testNgTranscludeContain(template, t);
});

test('radio template (inlined)', async t => {
	const tpl = util.makeTpl(definition.template, t, { inline: true });
	t.true(tpl.classList.contains('form-group'));

	const formCheck = tpl.firstElementChild as Element;
	t.true(formCheck.classList.contains('form-check-inline'));
	t.is(formCheck.getAttribute('ng-repeat'), 'item in $ctrl.list track by $index');

	const input = util.testInput(tpl, t);
	t.true(input.classList.contains('form-check-input'));
	t.is(input.type, 'radio');
	t.is(input.getAttribute('ng-value'), 'item.Value');
	t.regex(input.getAttribute('ng-attr-id') as string, radioNgIdRe);

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));
	t.is(label.innerHTML, '{{item.Text}}');
	t.regex(label.getAttribute('ng-attr-for') as string, radioNgIdRe);

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
