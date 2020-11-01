// tslint:disable:no-async-without-await
import test from 'ava';
import { h } from '../src/render';

test('renderer creates html element', async t => {
	const div = <div></div>;
	t.is(div.classList.length, 0);
	t.is(div.attributes.length, 0);
});

test('renderer creates html element with classes', async t => {
	const div = <div class='test1 test2'></div>;
	t.is(div.classList.length, 2);
	t.true(div.classList.contains('test1'));
	t.true(div.classList.contains('test2'));

	t.is(div.attributes.length, 1); // includes "class" attribute
});

test('renderer creates html element with attributes', async t => {
	// @ts-ignore
	const div = <div test1='test1' test2='test2'></div>;
	t.is(div.classList.length, 0);

	t.is(div.attributes.length, 2);
	t.is(div.getAttribute('test1'), 'test1');
	t.is(div.getAttribute('test2'), 'test2');
});

test('renderer creates html element with classes and attributes', async t => {
	// @ts-ignore
	const div = <div class='test1 test2' test1='test1' test2='test2'></div>;
	t.is(div.classList.length, 2);
	t.true(div.classList.contains('test1'));
	t.true(div.classList.contains('test2'));

	t.is(div.attributes.length, 3); // includes "class" attribute
	t.is(div.getAttribute('test1'), 'test1');
	t.is(div.getAttribute('test2'), 'test2');
});

test('renderer creates text input by default', async t => {
	const input =
		<input class='form-control'
			ng-attr-id='{{id}}_{{$ctrl.uniqueId}}'
			ng-attr-name='{{id}}_{{$ctrl.uniqueId}}'
			ng-model='$ctrl.ngModel'
			ng-model-options='$ctrl.ngModelOptions'
			type='text'
			maxLength={'{{maxlength}}' as never}
			placeholder='{{placeholder}}' /> as HTMLInputElement;

	t.is(input.classList.length, 1);
	t.true(input.classList.contains('form-control'));

	t.is(input.attributes.length, 8); // includes "class" attribute
	t.is(input.type, 'text');
	t.is(input.getAttribute('ng-attr-id'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(input.getAttribute('ng-attr-name'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(input.getAttribute('ng-model'), '$ctrl.ngModel');
	t.is(input.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
	t.is(input.getAttribute('maxlength'), '{{maxlength}}');
	t.is(input.getAttribute('placeholder'), '{{placeholder}}');
});

test('renderer creates radio input', async t => {
	const radio =
		<input class='form-check-input'
			ng-attr-name='{{id}}_{{$ctrl.uniqueId}}'
			ng-model='$ctrl.ngModel'
			ng-model-options='$ctrl.ngModelOptions'
			type='radio' /> as HTMLInputElement;

	t.is(radio.classList.length, 1);
	t.true(radio.classList.contains('form-check-input'));

	t.is(radio.attributes.length, 5); // includes "class" attribute
	t.is(radio.type, 'radio');
	t.is(radio.getAttribute('ng-attr-name'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(radio.getAttribute('ng-model'), '$ctrl.ngModel');
	t.is(radio.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
});

test('renderer creates checkbox input', async t => {
	const checkbox =
		<input class='form-check-input'
			ng-attr-id='{{id}}_{{$ctrl.uniqueId}}'
			ng-attr-name='{{id}}_{{$ctrl.uniqueId}}'
			ng-model='$ctrl.ngModel'
			ng-model-options='$ctrl.ngModelOptions'
			type='checkbox' /> as HTMLInputElement;

	t.is(checkbox.classList.length, 1);
	t.true(checkbox.classList.contains('form-check-input'));

	t.is(checkbox.attributes.length, 6); // includes "class" attribute
	t.is(checkbox.type, 'checkbox');
	t.is(checkbox.getAttribute('ng-attr-id'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(checkbox.getAttribute('ng-attr-name'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(checkbox.getAttribute('ng-model'), '$ctrl.ngModel');
	t.is(checkbox.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
});

test('renderer creates range input', async t => {
	const range =
		<input class='custom-range'
			ng-attr-id='{{id}}_{{$ctrl.uniqueId}}'
			ng-attr-name='{{id}}_{{$ctrl.uniqueId}}'
			ng-model='$ctrl.ngModel'
			ng-model-options='$ctrl.ngModelOptions'
			type='range' /> as HTMLInputElement;

	t.is(range.classList.length, 1);
	t.true(range.classList.contains('custom-range'));

	t.is(range.attributes.length, 6); // includes "class" attribute
	t.is(range.type, 'range');
	t.is(range.getAttribute('ng-attr-id'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(range.getAttribute('ng-attr-name'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(range.getAttribute('ng-model'), '$ctrl.ngModel');
	t.is(range.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
});

test('renderer creates textarea', async t => {
	const input =
		<textarea class='form-control'
			ng-attr-id='{{id}}_{{$ctrl.uniqueId}}'
			ng-attr-name='{{id}}_{{$ctrl.uniqueId}}'
			ng-model='$ctrl.ngModel'
			ng-model-options='$ctrl.ngModelOptions'
			maxLength={'{{maxlength}}' as never}
			placeholder='{{placeholder}}' /> as HTMLTextAreaElement;

	t.is(input.tagName.toLowerCase(), 'textarea');

	t.is(input.classList.length, 1);
	t.true(input.classList.contains('form-control'));

	t.is(input.attributes.length, 7); // includes "class" attribute
	t.is(input.type, 'textarea');
	t.is(input.getAttribute('ng-attr-id'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(input.getAttribute('ng-attr-name'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(input.getAttribute('ng-model'), '$ctrl.ngModel');
	t.is(input.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
	t.is(input.getAttribute('maxlength'), '{{maxlength}}');
	t.is(input.getAttribute('placeholder'), '{{placeholder}}');
});

test('renderer creates icon', async t => {
	const icon = <span class='fa fa-test'></span>;
	t.is(icon.tagName.toLowerCase(), 'span');

	t.is(icon.classList.length, 2);
	t.true(icon.classList.contains('fa'));
	t.true(icon.classList.contains('fa-test'));
});

test('renderer creates fixed-width icon', async t => {
	const icon = <span class='fa fa-fw fa-test' aria-hidden='true'></span>;
	t.is(icon.tagName.toLowerCase(), 'span');

	t.is(icon.classList.length, 3);
	t.true(icon.classList.contains('fa'));
	t.true(icon.classList.contains('fa-test'));
	t.true(icon.classList.contains('fa-fw'));

	t.is(icon.attributes.length, 2); // includes "class" attribute
	t.is(icon.getAttribute('aria-hidden'), 'true');
});

test('renderer creates label', async t => {
	const label = <label class='test' ng-attr-for='{{id}}_{{$ctrl.uniqueId}}'></label>;
	t.is(label.tagName.toLowerCase(), 'label');

	t.is(label.classList.length, 1);
	t.true(label.classList.contains('test'));

	t.is(label.attributes.length, 2); // includes "class" attribute
	t.is(label.getAttribute('ng-attr-for'), '{{id}}_{{$ctrl.uniqueId}}');
});

test('renderer creates label with sr-only class', async t => {
	const label = <label class='sr-only' ng-attr-for='{{id}}_{{$ctrl.uniqueId}}'></label>;
	t.is(label.classList.length, 1);
	t.true(label.classList.contains('sr-only'));

	t.is(label.attributes.length, 2); // includes "class" attribute
});

test('renderer creates label with required asterisk', async t => {
	const label = <label><span class='text-danger'> *</span></label>;
	t.is(label.classList.length, 0);

	const span = label.querySelector('span') as HTMLSpanElement;
	t.truthy(span);
	t.is(span.classList.length, 1);
	t.true(span.classList.contains('text-danger'));
	t.is(span.textContent, ' *');
});

test('renderer creates radio label without required asterisk', async t => {
	const label = <label></label>;
	t.is(label.classList.length, 0);
	t.falsy(label.querySelector('span'));
});

test('renderer creates anonymous transclusion slot', async t => {
	const slot = <ng-transclude></ng-transclude>;
	t.is(slot.tagName.toLowerCase(), 'ng-transclude');
	t.is(slot.classList.length, 0);
	t.is(slot.attributes.length, 0);
});

test('renderer creates named transclusion slot', async t => {
	const slot = <div ng-transclude='test'></div>;
	t.is(slot.tagName.toLowerCase(), 'div');

	t.is(slot.classList.length, 0);
	t.is(slot.attributes.length, 1);
	t.is(slot.getAttribute('ng-transclude'), 'test');
});

test('renderer creates icon input', async t => {
	const input =
		<input class='form-control'
			ng-attr-id='{{id}}_{{$ctrl.uniqueId}}'
			ng-attr-name='{{id}}_{{$ctrl.uniqueId}}'
			ng-model-options='$ctrl.ngModelOptions'
			type='text'
			maxLength={'{{maxlength}}' as never}
			placeholder='{{placeholder}}'
			data-input='true'
		/>;

	const iconInput =
		<div class='input-group'>
			<div class='input-group-prepend' data-toggle='true' style={'cursor: pointer;' as never}>
				<span class='input-group-text'>
					<span class='fa fa-calendar' aria-hidden='true'></span>
				</span>
			</div>
			{input}
		</div>;

	t.truthy(iconInput.querySelector('.fa-calendar'));
	t.true((iconInput.querySelector('input') as HTMLInputElement).isEqualNode(input));
});
