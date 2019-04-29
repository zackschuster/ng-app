// tslint:disable:file-name-casing
	// required for ava to ignore

import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ExecutionContext } from 'ava';

// @ts-ignore
import pretty = require('pretty');

import { $element, $invokeTemplate, $scope, app } from '../-mocks';
import { InputService } from '../../src/inputs';
import { NgController, makeInjectableCtrl } from '../../src/controller';
import { Indexed } from '@ledge/types';
import { NgComponentOptions } from '../../src/options';

const idRe = /\w[_]{{\$ctrl.uniqueId}}/;

export function mockCtrl<T extends NgController>(
	ctrl: new () => T,
	$attrs: Indexed = { },
) {
	const Controller = makeInjectableCtrl(ctrl, {
		log: app.log,
		http: app.http,
		renderer: app.renderer,
		attrs: $attrs,
		config: () => app.config,
	});
	return new Controller($element, $scope, app.$injector);
}

export function makeTpl(
	template: NgComponentOptions['template'],
	t: ExecutionContext,
	$attrs: Indexed = { },
) {
	Object.assign($attrs, {
		ngModel: 'ngModel',
		required: true, ngRequired: true,
		disabled: true, ngDisabled: true,
		readonly: true, ngReadonly: true,
	});

	const el = document.createElement('div');
	el.innerHTML = $invokeTemplate(template, $attrs);

	let path = join(__dirname, t.title.split(' ')[0], 'snapshot.html');
	let exists = existsSync(path);
	let i = 1;
	while (exists) {
		path = path.replace(/snapshot([-]\d)?/, `snapshot-${i}`);
		exists = existsSync(path);
		i++;
	}

	writeFileSync(path, pretty(el.innerHTML));

	return el.firstElementChild as Element;
}

export function testInput(
	tpl: Element,
	t: ExecutionContext,
	tagName: 'INPUT' | 'TEXTAREA' | 'SELECT' = 'INPUT',
) {
	const input = tpl.querySelector(tagName.toLowerCase()) as HTMLInputElement;

	t.is(input.tagName, tagName);

	t.is(input.getAttribute('required'), 'true');
	t.is(input.getAttribute('ng-required'), '$ctrl.ngRequired');
	t.is(input.getAttribute('disabled'), 'true');
	t.is(input.getAttribute('ng-disabled'), '$ctrl.ngDisabled');
	t.is(input.getAttribute('readonly'), 'true');
	t.is(input.getAttribute('ng-readonly'), '$ctrl.ngReadonly');

	if (tagName !== 'SELECT') {
		// date-input currently uses flatpickr in `wrap` mode, which requires `data-input` to be set on the input
		if (input.hasAttribute('data-input') === false) {
			t.is(input.getAttribute('ng-model'), '$ctrl.ngModel');
		}
		t.is(input.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
		t.is(input.getAttribute('ng-blur'), '$ctrl.ngModelCtrl.$setTouched()');
		t.is(input.getAttribute('ng-class'), `{ 'is-invalid': ${InputService.$validationExps.$isInvalid} }`);
	}

	t.regex(input.getAttribute('ng-attr-id') as string, idRe);
	t.regex(input.getAttribute('ng-attr-name') as string, idRe);

	return input;
}

export function testLabel(tpl: Element, t: ExecutionContext) {
	const label = tpl.querySelector('label') as HTMLLabelElement;
	const ngAttrFor = label.getAttribute('ng-attr-for') as string;
	t.regex(ngAttrFor, idRe);

	const input = tpl.querySelector('input');
	if (input != null && input.type !== 'radio') {
		const required = label.querySelector('span') as HTMLSpanElement;
		t.is(required.innerHTML, ' *');
		t.true(required.classList.contains('text-danger'));

		const transclude = label.querySelector('ng-transclude') as HTMLUnknownElement;
		t.is(transclude.tagName, 'NG-TRANSCLUDE');
		t.is(transclude.innerHTML, app.splitByCapitalLetter(ngAttrFor.split('_')[0]));
	}

	return label;
}

export function testNgMessages(tpl: Element, t: ExecutionContext) {
	const ngMessages = tpl.querySelector('[ng-messages]') as HTMLDivElement;
	t.is(ngMessages.tagName, 'DIV');
	t.is(ngMessages.getAttribute('role'), 'alert');
	t.is(ngMessages.getAttribute('ng-messages'), InputService.$validationExps.$error);
	t.is(ngMessages.getAttribute('ng-show'), InputService.$validationExps.$isInvalid);

	const required = ngMessages.querySelector('[ng-message="required"]') as HTMLDivElement;
	t.true(required.classList.contains('text-danger'));

	return ngMessages;
}

export function testNgTranscludeContain(tpl: Element, t: ExecutionContext) {
	const ngTranscludeContain = tpl.querySelector('[ng-transclude="contain"]') as HTMLDivElement;
	t.is(ngTranscludeContain.tagName, 'DIV');

	return ngTranscludeContain;
}
