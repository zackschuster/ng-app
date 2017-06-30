import test from 'ava';
import { NgRenderer } from '../src/renderer';

const h = new NgRenderer(new (require('window'))().document);

test('renderer creates bare element', t => {
	const div = h.createElement('div');
	t.true(div.classList.length === 0);
	// accommodates [Symbol(NamedNodeMap internal)] attribute
	t.true(div.attributes.length === 1);
});
