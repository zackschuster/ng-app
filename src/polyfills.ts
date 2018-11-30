// element-closest | CC0-1.0 | github.com/jonathantneal/closest
if (typeof Element.prototype.closest !== 'function') {
	Element.prototype.closest = function closest(selector: string) {
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
