// tslint:disable: no-async-without-await
import test from 'ava';
import { app, makeAttrs } from '../-mocks';
import { NgInputController } from '../../src/inputs';

test('app.inputs.$validationAttrs', async t => {
	t.deepEqual(app.inputs.$validationAttrs, [
		'required', 'ngRequired',
		'disabled', 'ngDisabled',
		'readonly', 'ngReadonly',
	]);
});

test('app.inputs.$validationMessages', async t => {
	t.deepEqual(app.inputs.$validationMessages, new Map<string, string>([
		['email', 'Email address must be in the following form: email@address.com'],
		['required', 'This field is required'],
		['minlength', 'Input is not long enough'],
		['maxlength', 'Input is too long'],
	]));
});

test('app.inputs.$baseDefinition', async t => {
	t.deepEqual(app.inputs.makeBaseOptions(), {
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

test('app.inputs.$baseComponent', async t => {
	const $baseComponent = app.inputs.makeBaseComponent();
	t.true(typeof $baseComponent.renderLabel === 'function');
	t.true(typeof $baseComponent.postRender === 'function');

	t.deepEqual($baseComponent, {
		labelClass: 'form-control-label',
		templateClass: 'form-group',
		attrs: { },
		isRadioOrCheckbox: false,
		controller: NgInputController,
		renderLabel: $baseComponent.renderLabel,
		postRender: $baseComponent.postRender,
	});

});

test('app.inputs.modelIdentifier', async t => {
	t.is(app.inputs.modelIdentifier(makeAttrs('$ctrl.model.item1')), 'item1');
	t.is(app.inputs.modelIdentifier(makeAttrs('$ctrl.model')), 'model');
	t.is(app.inputs.modelIdentifier(makeAttrs('model')), 'model');
});

test('app.inputs.getDefaultLabelText', async t => {
	t.is(app.inputs.getDefaultLabelText(makeAttrs('$ctrl.model.item1')), 'Item 1');
	t.is(app.inputs.getDefaultLabelText(makeAttrs('$ctrl.model')), 'Model');
	t.is(app.inputs.getDefaultLabelText(makeAttrs('model')), 'Model');
});
