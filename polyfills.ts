// tslint:disable:no-var-keyword prefer-const
import 'core-js/es/symbol';
import 'core-js/es/map';
import 'core-js/es/set';
import 'core-js/es/promise';
import 'core-js/es/reflect';
import 'core-js/features/array/find';
import 'core-js/features/array/find-index';
import 'core-js/features/array/from';
import 'core-js/features/array/includes';
import 'core-js/features/number/is-integer';
import 'core-js/features/number/is-nan';
import 'core-js/features/object/assign';
import 'core-js/features/object/entries';
import 'core-js/features/object/is';
import 'core-js/features/string/includes';
import 'core-js/features/string/starts-with';
import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

/**
 * @package element-closest
 * @license CC0-1.0
 * @see https://github.com/jonathantneal/closest
 *
 * author: Jonathan T Neal
 */
Element.prototype.matches = function matches(selector: string) {
	// tslint:disable-next-line: no-this-assignment
	var element = this;
	var elements = (element.ownerDocument as Document).querySelectorAll(selector);
	var index = 0;

	while (elements[index] && elements[index] !== element) {
		++index;
	}

	return Boolean(elements[index]);
};

Element.prototype.closest = function closest(selector: string) {
	// tslint:disable-next-line: no-this-assignment
	var element = this;

	while (element && element.nodeType === 1) {
		if (element.matches(selector)) {
			return element;
		}

		element = element.parentElement as Element;
	}

	return null;
};
