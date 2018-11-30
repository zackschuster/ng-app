import 'core-js/es6/symbol';
import 'core-js/es6/map';
import 'core-js/es6/set';
import 'core-js/es6/promise';
import 'core-js/fn/array/from';
import 'core-js/fn/array/includes';
import 'core-js/fn/object/assign';
import 'core-js/fn/object/entries';
import 'core-js/fn/string/includes';
import 'core-js/fn/string/starts-with';

// element-closest | CC0-1.0 | github.com/jonathantneal/closest
if (typeof Element.prototype.closest !== 'function') {
	Element.prototype.closest = function closest(selector: string) {
		// tslint:disable-next-line: no-this-assignment
		let element = this;

		while (element && element.nodeType === 1) {
			if (element.matches(selector)) {
				return element;
			}

			element = element.parentElement as Element;
		}

		return null;
	};
}
