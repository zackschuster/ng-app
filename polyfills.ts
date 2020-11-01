// tslint:disable:no-var-keyword prefer-const no-this-assignment
import 'core-js/es/map';
import 'core-js/es/set';
import 'core-js/es/promise';
import 'core-js/features/array/find-index';
import 'core-js/features/object/assign';
import 'core-js/features/object/entries';
import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 */

if (!Element.prototype.matches) {
	Element.prototype.matches =
		(Element.prototype as any).msMatchesSelector ||
		Element.prototype.webkitMatchesSelector;
}

if (!Element.prototype.closest) {
	Element.prototype.closest = function closest(s: string) {
		var el = this;

		do {
			if (Element.prototype.matches.call(el, s)) return el;
			el = el.parentElement || el.parentNode as typeof el;
		} while (el !== null && el.nodeType === 1);
		return null;
	};
}
