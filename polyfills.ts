// tslint:disable:no-var-keyword prefer-const
import 'core-js/es6/symbol';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/promise';
import 'core-js/es6/reflect';
import 'core-js/fn/array/find';
import 'core-js/fn/array/find-index';
import 'core-js/fn/array/from';
import 'core-js/fn/array/includes';
import 'core-js/fn/number/is-integer';
import 'core-js/fn/number/is-nan';
import 'core-js/fn/object/assign';
import 'core-js/fn/object/entries';
import 'core-js/fn/object/is';
import 'core-js/fn/string/includes';
import 'core-js/fn/string/starts-with';

import 'whatwg-fetch';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch';

/**
 * @package element-closest
 * @license CC0-1.0
 * @author Jonathan T Neal
 * @see https://github.com/jonathantneal/closest
 */

Element.prototype.matches = function matches(selector: string) {
	var element = this;
	var elements = (element.ownerDocument as Document).querySelectorAll(selector);
	var index = 0;

	while (elements[index] && elements[index] !== element) {
		++index;
	}

	return Boolean(elements[index]);
};

Element.prototype.closest = function closest(selector: string) {
	var element = this;

	while (element && element.nodeType === 1) {
		if (element.matches(selector)) {
			return element;
		}

		element = element.parentElement as Element;
	}

	return null;
};
