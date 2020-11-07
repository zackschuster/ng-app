import { Indexed } from '@ledge/types';
import { ExecutionContext } from 'ava';
import { element } from 'angular';

import { $config, $http, $injector, $invokeTemplate, $log, $svc } from '../mocks';
import { InputService, NgComponentOptions, NgInputOptions, makeInjectableCtrl } from '../../index';

const idRe = /(\w[_]){{\$ctrl.uniqueId}}/;

export function mockInputCtrl<T extends NgInputOptions>(definition: T, $attrs: Partial<angular.IAttributes> = {}) {
	Object.assign($attrs, {
		ngModel: '$ctrl.ngModel',
		required: true, ngRequired: true,
		disabled: true, ngDisabled: true,
		readonly: true, ngReadonly: true,
	});

	const el = document.createElement('div');
	const html = $injector.invoke(
		definition.template as angular.Injectable<(...args: any[]) => string>,
		{},
		{ $element: element(el), $attrs },
	);

	const controller = makeInjectableCtrl(definition.controller as any, {
		log: $log,
		http: $http,
		attrs: $attrs,
		config: () => $config,
	});

	const $element = element(html);

	return {
		controller: new controller($element, $injector.get('$rootScope').$new(true), $injector) as InstanceType<NonNullable<T['controller']>>,
		template: $element[0],
	};
}

export function makeTpl(
	template: NgComponentOptions['template'],
	t: ExecutionContext,
	$attrs: Indexed = {},
) {
	Object.assign($attrs, {
		ngModel: '$ctrl.ngModel',
		required: true, ngRequired: true,
		disabled: true, ngDisabled: true,
		readonly: true, ngReadonly: true,
	});

	const child = document.createElement('div');

	const html = $invokeTemplate(
		template as angular.Injectable<(...args: any[]) => string>,
		$attrs,
	);
	t.snapshot(html);

	child.innerHTML = html;
	return child.firstElementChild as Element;
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
		t.is(input.getAttribute('ng-model'), '$ctrl.ngModel');
		t.is(input.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
		t.is(input.getAttribute('ng-blur'), '$ctrl.ngModelCtrl.$setTouched()');
		t.is(input.getAttribute('ng-class'), `{ 'is-invalid': ${InputService.$ValidationExpressions.$IsInvalid} }`);
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
	if (input?.type !== 'radio') {
		const required = label.querySelector('span') as HTMLSpanElement;
		t.is(required.innerHTML, ' *');
		t.true(required.classList.contains('text-danger'));

		const transclude = label.querySelector('ng-transclude') as HTMLUnknownElement;
		t.is(transclude.tagName, 'NG-TRANSCLUDE');
		t.is(transclude.innerHTML, $svc.splitByCapitalLetter(ngAttrFor.split('_')[0]));
	}

	return label;
}

export function testNgMessages(tpl: Element, t: ExecutionContext) {
	const ngMessages = tpl.querySelector('[ng-messages]') as HTMLDivElement;
	t.is(ngMessages.tagName, 'DIV');
	t.is(ngMessages.getAttribute('role'), 'alert');
	t.is(ngMessages.getAttribute('ng-messages'), InputService.$ValidationExpressions.$Error);
	t.is(ngMessages.getAttribute('ng-show'), InputService.$ValidationExpressions.$IsInvalid);

	const required = ngMessages.querySelector('[ng-message="required"]') as HTMLDivElement;
	t.true(required.classList.contains('text-danger'));

	return ngMessages;
}

export function testNgTranscludeContain(tpl: Element, t: ExecutionContext) {
	const ngTranscludeContain = tpl.querySelector('[ng-transclude="contain"]') as HTMLDivElement;
	t.is(ngTranscludeContain.tagName, 'DIV');

	return ngTranscludeContain;
}
