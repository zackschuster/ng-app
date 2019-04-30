import test from 'ava';
import { radioList } from '../../../src/inputs/radio-list';
import { NgInputController } from '../../../src/inputs';
import * as util from '../-util';
import { app } from '../../-mocks';

const definedRadioList = app.inputs.defineInputComponent(radioList);
const radioNgIdRe = /\w([_]{{\$ctrl.uniqueId}}[_]{{\$index}})/;

test('radio bindings', async t => {
	t.deepEqual(definedRadioList.bindings, {
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
	t.deepEqual(definedRadioList.transclude, { contain: '?contain' });
});

test('radio require', async t => {
	t.deepEqual(definedRadioList.require, { ngModelCtrl: 'ngModel' });
});

test('radio controller', async t => {
	t.true(util.mockCtrl(definedRadioList.controller) instanceof NgInputController);
});

test('radio controllerAs', async t => {
	t.is(definedRadioList.controllerAs, undefined);
});

test('radio template', async t => {
	const tpl = util.makeTpl(definedRadioList.template, t);
	t.true(tpl.classList.contains('form-group'));

	const formCheck = tpl.firstElementChild as Element;
	t.true(formCheck.classList.contains('form-check'));
	t.is(formCheck.getAttribute('ng-repeat'), 'item in $ctrl.list track by $index');

	const input = util.testInput(tpl, t);
	t.true(input.classList.contains('form-check-input'));
	t.is(input.type, 'radio');
	t.is(input.style.cursor, 'pointer');
	t.is(input.getAttribute('ng-value'), 'item.Value');
	t.regex(input.getAttribute('ng-attr-id') as string, radioNgIdRe);

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));
	t.is(label.style.cursor, 'pointer');
	t.is(label.innerHTML, '{{item.Text}}');
	t.regex(label.getAttribute('ng-attr-for') as string, radioNgIdRe);

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});

test('radio template (inlined)', async t => {
	const tpl = util.makeTpl(definedRadioList.template, t, { inline: true });
	t.true(tpl.classList.contains('form-group'));

	const formCheck = tpl.firstElementChild as Element;
	t.true(formCheck.classList.contains('form-check-inline'));
	t.is(formCheck.getAttribute('ng-repeat'), 'item in $ctrl.list track by $index');

	const input = util.testInput(tpl, t);
	t.true(input.classList.contains('form-check-input'));
	t.is(input.type, 'radio');
	t.is(input.style.cursor, 'pointer');
	t.is(input.getAttribute('ng-value'), 'item.Value');
	t.regex(input.getAttribute('ng-attr-id') as string, radioNgIdRe);

	const label = util.testLabel(tpl, t);
	t.true(label.classList.contains('form-check-label'));
	t.is(label.style.cursor, 'pointer');
	t.is(label.innerHTML, '{{item.Text}}');
	t.regex(label.getAttribute('ng-attr-for') as string, radioNgIdRe);

	util.testNgMessages(tpl, t);
	util.testNgTranscludeContain(tpl, t);
});
