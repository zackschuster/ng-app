import test from 'ava';
import { h } from './mocks';

test('renderer creates bare element', async t => {
	const div = h.createElement('div');
	t.is(div.classList.length, 0);
	t.is(div.attributes.length, 0);
});

test('renderer creates element with classes', async t => {
	const div = h.createElement('div', ['test1', 'test2']);
	t.is(div.classList.length, 2);
	t.true(div.classList.contains('test1'));
	t.true(div.classList.contains('test2'));

	t.is(div.attributes.length, 1); // includes "class" attribute
});

test('renderer creates element with attributes', async t => {
	const div = h.createElement('div', [], [['test1', 'test1'], ['test2', 'test2']]);
	t.is(div.classList.length, 0);

	t.is(div.attributes.length, 2);
	t.is(div.getAttribute('test1'), 'test1');
	t.is(div.getAttribute('test2'), 'test2');
});

test('renderer creates element with classes and attributes', async t => {
	const div = h.createElement('div', ['test1', 'test2'], [['test1', 'test1'], ['test2', 'test2']]);
	t.is(div.classList.length, 2);
	t.true(div.classList.contains('test1'));
	t.true(div.classList.contains('test2'));

	t.is(div.attributes.length, 3); // includes "class" attribute
	t.is(div.getAttribute('test1'), 'test1');
	t.is(div.getAttribute('test2'), 'test2');
});

test('renderer creates text input by default', async t => {
	const input = h.createInput();
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

test('renderer creates radio and checkbox inputs', async t => {
	const radio = h.createInput('radio');
	t.is(radio.classList.length, 1);
	t.true(radio.classList.contains('form-check-input'));

	t.is(radio.attributes.length, 5); // includes "class" attribute
	t.is(radio.type, 'radio');
	t.is(radio.getAttribute('ng-attr-name'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(radio.getAttribute('ng-model'), '$ctrl.ngModel');
	t.is(radio.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');

	const checkbox = h.createInput('checkbox');
	t.is(checkbox.classList.length, 1);
	t.true(checkbox.classList.contains('form-check-input'));

	t.is(checkbox.attributes.length, 6); // includes "class" attribute
	t.is(checkbox.type, 'checkbox');
	t.is(checkbox.getAttribute('ng-attr-id'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(checkbox.getAttribute('ng-attr-name'), '{{id}}_{{$ctrl.uniqueId}}');
	t.is(checkbox.getAttribute('ng-model'), '$ctrl.ngModel');
	t.is(checkbox.getAttribute('ng-model-options'), '$ctrl.ngModelOptions');
});

test('renderer creates textarea', async t => {
	const input = h.createTextArea();

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
	const icon = h.createIcon('test');
	t.is(icon.tagName.toLowerCase(), 'span');

	t.is(icon.classList.length, 2);
	t.true(icon.classList.contains('fa'));
	t.true(icon.classList.contains('fa-test'));

	t.is(icon.attributes.length, 2); // includes "class" attribute
	t.is(icon.getAttribute('aria-hidden'), 'true');
});

test('renderer creates fixed-width icon', async t => {
	const icon = h.createIcon('test', true);
	t.is(icon.tagName.toLowerCase(), 'span');

	t.is(icon.classList.length, 3);
	t.true(icon.classList.contains('fa'));
	t.true(icon.classList.contains('fa-test'));
	t.true(icon.classList.contains('fa-fw'));

	t.is(icon.attributes.length, 2); // includes "class" attribute
	t.is(icon.getAttribute('aria-hidden'), 'true');
});

test('renderer creates label', async t => {
	const label = h.createLabel(['test']);
	t.is(label.tagName.toLowerCase(), 'label');

	t.is(label.classList.length, 1);
	t.true(label.classList.contains('test'));

	t.is(label.attributes.length, 2); // includes "class" attribute
	t.is(label.getAttribute('ng-attr-for'), '{{id}}_{{$ctrl.uniqueId}}');
});

test('renderer creates label with sr-only class', async t => {
	const label = h.createLabel([], { isSrOnly: true });
	t.is(label.classList.length, 1);
	t.true(label.classList.contains('sr-only'));

	t.is(label.attributes.length, 2); // includes "class" attribute
});

test('renderer creates label with required asterisk', async t => {
	const label = h.createLabel([], { isRequired: true });
	t.is(label.classList.length, 0);

	const span = label.querySelector('span') as HTMLSpanElement;
	t.truthy(span);
	t.is(span.classList.length, 1);
	t.true(span.classList.contains('text-danger'));
	t.is(span.textContent, ' *');
});

test('renderer creates radio label without required asterisk', async t => {
	const label = h.createLabel([], { isRequired: true, isRadio: true });
	t.is(label.classList.length, 0);

	const span = label.querySelector('span') as HTMLSpanElement;
	t.falsy(span);
});

test('renderer creates anonymous transclusion slot', async t => {
	const slot = h.createSlot();
	t.is(slot.tagName.toLowerCase(), 'ng-transclude');
	t.is(slot.classList.length, 0);
	t.is(slot.attributes.length, 0);
});

test('renderer creates named transclusion slot', async t => {
	const slot = h.createSlot('test');
	t.is(slot.tagName.toLowerCase(), 'div');

	t.is(slot.classList.length, 0);
	t.is(slot.attributes.length, 1);
	t.is(slot.getAttribute('ng-transclude'), 'test');
});

test('renderer creates icon input', async t => {
	const input = h.createInput();
	const iconInput = h.createIconInput(input, 'calendar');
	t.truthy(iconInput.querySelector('.fa-calendar'));
	t.true((iconInput.querySelector('input') as HTMLInputElement).isEqualNode(input));
});
