// tslint:disable:no-async-without-await
import test from 'ava';
import { radioList } from '../../../src/input';
import { InputService } from '../../../src/input/service';
import { NgComponentController } from '../../mocks';
import * as util from '../-util';

const definition = InputService.defineInputComponent(radioList, document);

let template: Element;
let controller: NgComponentController;
test.beforeEach(async t => {
	template = util.makeTpl(definition.template, t);
	controller = util.mockCtrl(definition.controller, { }, template);
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
	t.true(controller instanceof NgComponentController);
});

test('radio controllerAs', async t => {
	t.is(definition.controllerAs, undefined);
});

test('radio element', async t => {
	t.is((controller as any).$element, template);
});

test('radio template', async t => {
	const tpl = util.makeTpl(definition.template, t);
	t.true(tpl.classList.contains('form-group'));

	const formCheck = tpl.firstElementChild as Element;
	t.true(formCheck.classList.contains('form-check'));
	t.is(formCheck.getAttribute('ng-repeat'), 'item in $ctrl.list');

	const input = util.testInput(tpl, t);
	t.true(input.classList.contains('form-check-input'));
	t.is(input.type, 'radio');
	t.is(input.style.cursor, 'pointer');
	t.is(input.getAttribute('ng-value'), 'item.Value');
	t.regex(input.getAttribute('ng-attr-id') as string, radioNgIdRe);

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));
	t.is(label.getAttribute('ng-click'), '$ctrl.ngModel === item.Value');
	t.is(label.style.cursor, 'pointer');
	t.is(label.innerHTML, '{{item.Text}}');
	t.regex(label.getAttribute('ng-attr-for') as string, radioNgIdRe);

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});

test('radio template (inlined)', async t => {
	const tpl = util.makeTpl(definition.template, t, { inline: true });
	t.true(tpl.classList.contains('form-group'));

	const formCheck = tpl.firstElementChild as Element;
	t.true(formCheck.classList.contains('form-check-inline'));
	t.is(formCheck.getAttribute('ng-repeat'), 'item in $ctrl.list');

	const input = util.testInput(tpl, t);
	t.true(input.classList.contains('form-check-input'));
	t.is(input.type, 'radio');
	t.is(input.style.cursor, 'pointer');
	t.is(input.getAttribute('ng-value'), 'item.Value');
	t.regex(input.getAttribute('ng-attr-id') as string, radioNgIdRe);

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));
	t.is(label.getAttribute('ng-click'), '$ctrl.ngModel === item.Value');
	t.is(label.style.cursor, 'pointer');
	t.is(label.innerHTML, '{{item.Text}}');
	t.regex(label.getAttribute('ng-attr-for') as string, radioNgIdRe);

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
