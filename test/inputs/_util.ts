import { writeFileSync } from 'fs';
import { join } from 'path';
import { ExecutionContext } from 'ava';
import { app, wrapCtrl } from '../..';
import { $controller, $ctrl, $element, $invokeTemplate, $scope } from '../mocks';
import { InputService } from '../../src/input/service';

const idRe = /\w[_]{{\$ctrl.uniqueId}}/;

export function mockCtrl(ctrl: any) {
	app.config = {
		PREFIX: {
			API: '',
		},
	};

	return $controller(
		wrapCtrl(ctrl) as any, {
			$scope,
			$element,
			$attrs: {},
			$timeout: {},
			$injector: {},
			$state: {},
			$http: {},
		},
	);
}

export function makeTpl(
	template: angular.IComponentOptions['template'],
	folder: string,
	$attrs: Partial<angular.IAttributes> = {},
) {
	$attrs.ngModel = 'ngModel';
	$attrs.required = true;

	const el = document.createElement('div');
	el.innerHTML = $invokeTemplate(template, $attrs);

	writeFileSync(join(__dirname, folder, `snapshot.html`), el.innerHTML);

	return el.firstElementChild as Element;
}

export function testInput(tpl: Element, t: ExecutionContext, tagName = 'INPUT') {
	const input = tpl.querySelector(tagName.toLowerCase()) as HTMLInputElement;

	t.is(input.tagName, tagName);
	t.is(input.getAttribute('ng-model'), '$ctrl.ngModel');
	t.is(input.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
	t.is(input.getAttribute('ng-blur'), '$ctrl.ngModelCtrl.$setTouched()');

	t.regex(input.getAttribute('ng-attr-id') as string, idRe);
	t.regex(input.getAttribute('ng-attr-name') as string, idRe);
	t.is(input.getAttribute('ng-class'), `{ 'is-invalid': ${InputService.$validationExps.$isInvalid} }`);

	return input;
}

export function testLabel(tpl: Element, t: ExecutionContext) {
	const label = tpl.querySelector('label') as HTMLLabelElement;
	const ngAttrFor = label.getAttribute('ng-attr-for') as string;
	t.regex(ngAttrFor, idRe);

	const required = label.querySelector('span') as HTMLSpanElement;
	t.is(required.innerHTML, ' *');
	t.true(required.classList.contains('text-danger'));

	const transclude = label.querySelector('ng-transclude') as HTMLUnknownElement;
	t.is(transclude.tagName, 'NG-TRANSCLUDE');
	t.is(transclude.innerHTML, $ctrl.splitByCapitalLetter(ngAttrFor.split('_')[0]));

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
