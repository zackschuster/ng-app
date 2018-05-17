import test from 'ava';
import { NgRenderer } from '../src/renderer';

const h = new NgRenderer(new (require('window'))().document);

// Attribute tests have minlength of 1 to accomodate [Symbol(NamedNodeMap internal)] attribute
test('renderer creates bare element', t => {
	const div = h.createElement('div');
	t.true(div.classList.length === 0);
	t.true(div.attributes.length === 0);
});

test('renderer creates element with classes', t => {
	const div = h.createElement('div', ['test1', 'test2']);
	t.true(div.classList.contains('test1'));
	t.true(div.classList.contains('test2'));
	t.true(div.attributes.length === 1);
});

test('renderer creates element with attributes', t => {
	const div = h.createElement('div', [], [['test1', 'test1'], ['test2', 'test2']]);
	t.true(div.classList.length === 0);
	t.true(div.attributes.getNamedItem('test1') != null);
	t.true(div.attributes.getNamedItem('test2') != null);
});

test('renderer creates element with classes and attributes', t => {
	const div = h.createElement('div', ['test1', 'test2'], [['test1', 'test1'], ['test2', 'test2']]);
	t.true(div.classList.contains('test1'));
	t.true(div.classList.contains('test2'));
	t.true(div.attributes.length === 3);
});

test('renderer creates text input by default', t => {
	const input = h.createInput();
	t.true(input.type === 'text');
	t.true(input.classList.contains('form-control'));
	t.true(input.attributes.length === 8);
});

test('renderer creates radio and checkbox inputs', t => {
	const radio = h.createInput('radio');
	t.true(radio.type === 'radio');
	t.true(radio.classList.length === 1);
	t.true(radio.classList.contains('form-check-input'));
	t.true(radio.attributes.length === 6);

	const checkbox = h.createInput('checkbox');
	t.true(checkbox.type === 'checkbox');
	t.true(checkbox.classList.length === 1);
	t.true(checkbox.classList.contains('form-check-input'));
	t.true(checkbox.attributes.length === 6);
});

test('renderer creates textarea', t => {
	const input = h.createTextArea();
	t.true(input.tagName.toLowerCase() === 'textarea');
	t.true(input.classList.length === 1);
	t.true(input.classList.contains('form-control'));
	t.true(input.attributes.length === 8);
});

test('renderer creates icon', t => {
	const icon = h.createIcon('test');
	t.true(icon.tagName.toLowerCase() === 'span');
	t.true(icon.classList.length === 2);
	t.true(icon.classList.contains('fa'));
	t.true(icon.classList.contains('fa-test'));
	t.true(icon.attributes.length === 2);
	t.true(icon.hasAttribute('aria-hidden'));
});

test('renderer creates fixed-width icon', t => {
	const icon = h.createIcon('test', true);
	t.true(icon.tagName.toLowerCase() === 'span');
	t.true(icon.classList.length === 3);
	t.true(icon.classList.contains('fa'));
	t.true(icon.classList.contains('fa-test'));
	t.true(icon.classList.contains('fa-fw'));
	t.true(icon.attributes.length === 2);
	t.true(icon.hasAttribute('aria-hidden'));
});

test('renderer creates label', t => {
	const label = h.createLabel(['test']);
	t.true(label.tagName.toLowerCase() === 'label');
	t.true(label.classList.length === 1);
	t.true(label.classList.contains('test'));
	t.true(label.attributes.length === 2);
	t.true(label.hasAttribute('for'));
});

test('renderer creates slot', t => {
	const label = h.createSlot('test');
	t.true(label.tagName.toLowerCase() === 'div');
	t.true(label.classList.length === 0);
	t.true(label.attributes.length === 1);
	t.true(label.getAttribute('ng-transclude') === 'test');
});

test('renderer creates icon input', t => {
	const input = h.createInput();
	const iconInput = h.createIconInput(input, 'calendar');
	t.true(iconInput.querySelectorAll('.fa-calendar').length > 0);
	// tslint:disable-next-line:no-non-null-assertion
	t.true(iconInput.querySelector('input')!.isEqualNode(input));
});
