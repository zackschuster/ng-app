export function h<T extends keyof HTMLElementTagNameMap, E extends HTMLElement & (new () => E)>(
	TagOrElement: T | E,
	props: { [index: string]: any } = {},
	...childNodes: unknown[]
): HTMLElementTagNameMap[T] | E {
	const element = typeof TagOrElement === 'string'
		? document.createElement(TagOrElement)
		: new TagOrElement();

	if (props === null) {
		props = {};
	}

	const setProperty = (key: string, value: any) => {
		if (value == null) {
			return;
		}

		if (typeof value === 'function') {
			element[key as keyof typeof element] = value;
		} else if (key === 'className') {
			element.setAttribute('class', value.toString());
		} else {
			element.setAttribute(key, value.toString());
		}
	};

	for (const key of Object.keys(props)) {
		setProperty(key, props[key]);
	}

	const appendChild = (node: unknown) => {
		if (node instanceof Node) {
			element.appendChild(node);
		} else if (node != null) {
			element.appendChild(document.createTextNode(String(node)));
		}
	};
	for (const node of childNodes) {
		if (Array.isArray(node) && node.some(x => x instanceof Node)) {
			for (const n of node) {
				appendChild(n);
			}
		} else {
			appendChild(node);
		}
	}

	return element;
}

/**
 * @see https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 */
export function closest(el: HTMLElement, s: string) {
	if (typeof Element.prototype.closest === 'function') {
		return el.closest(s);
	}
	do {
		if (el.matches(s)) return el;
		el = el.parentElement || el.parentNode as typeof el;
	} while (el !== null && el.nodeType === 1);
	return null;
}
