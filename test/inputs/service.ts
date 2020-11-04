// tslint:disable:no-async-without-await
import test from 'ava';
import { makeAttrs } from '../mocks';
import { InputService, NgInputController } from '../../src/inputs';

test('InputService.$validationAttrs', async t => {
	t.deepEqual(InputService.$validationAttrs, [
		'required', 'ngRequired',
		'disabled', 'ngDisabled',
		'readonly', 'ngReadonly',
	]);
});

test('InputService.$validationMessages', async t => {
	t.deepEqual(InputService.$validationMessages, {
		email: 'Email address must be in the following form: email@address.com',
		required: 'This field is required',
		minlength: 'Input is not long enough',
		maxlength: 'Input is too long',
	});
});

test('InputService.$baseDefinition', async t => {
	t.deepEqual(InputService.$baseDefinition, {
		transclude: {
			contain: '?contain',
		},
		require: {
			ngModelCtrl: 'ngModel',
		},
		bindings: {
			ngModel: '=',
			ngModelOptions: '<',
			ngDisabled: '<',
			ngReadonly: '<',
			ngRequired: '<',
		},
	});
});

test('InputService.$baseComponent', async t => {
	const $baseComponent = window.angular.copy(InputService.$BaseComponent);

	t.true($baseComponent.renderLabel instanceof Function);
	t.true($baseComponent.postRender instanceof Function);
	t.true($baseComponent.render instanceof Function);
	t.true(($baseComponent.controller as any).prototype instanceof NgInputController);

	t.like($baseComponent, {
		isRadioOrCheckbox: false,
		labelClass: 'form-control-label',
		templateClass: 'form-group',
		attrs: {},
		type: 'input',
	} as any);

	t.true(typeof InputService.$BaseComponent.renderLabel === 'function');
});

test('InputService.modelIdentifier', async t => {
	t.is(InputService.modelIdentifier(makeAttrs('$ctrl.model.item1')), 'item1');
	t.is(InputService.modelIdentifier(makeAttrs('$ctrl.model')), 'model');
	t.is(InputService.modelIdentifier(makeAttrs('model')), 'model');
});

test('InputService.getDefaultLabelText', async t => {
	t.is(InputService.getDefaultLabelText(makeAttrs('$ctrl.model.item1')), 'Item 1');
	t.is(InputService.getDefaultLabelText(makeAttrs('$ctrl.model')), 'Model');
	t.is(InputService.getDefaultLabelText(makeAttrs('model')), 'Model');
});
