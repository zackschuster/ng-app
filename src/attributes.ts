import { Indexed } from '@ledge/types';

export class NgAttributes {
	[name: string]: any;
	public readonly $attr: Indexed<string> = { };

	public PREFIX_REGEXP = /^((?:x|data)[:\-_])/i;
	public SPECIAL_CHARS_REGEXP = /[:\-_]+(.)/g;

	constructor(private readonly $$element: Element, attrs: Indexed = { }) {
		for (const { name: key, value } of Array.from($$element.attributes)) {
			this.$record(key, value);
		}

		for (const [key, value] of Object.entries(attrs)) {
			this.$record(key, value);
		}
	}

	/**
	 * Converts an attribute name (e.g. dash/colon/underscore-delimited string, optionally prefixed with x- or data-) to its normalized, camelCase form.
	 *
	 * Also there is special case for Moz prefix starting with upper case letter.
	 *
	 * For further information check out the guide on @see https://docs.angularjs.org/guide/directive#matching-directives
	 */
	public $normalize(name: string) {
		return name
			.replace(this.PREFIX_REGEXP, '')
			.replace(this.SPECIAL_CHARS_REGEXP, (_, letter, offset) => offset ? letter.toUpperCase() : letter);
	}

	/**
	 * Checks if the CSS class value is present on the element.
	 */
	public $hasClass(className: string) {
		return this.$$element.classList.contains(className);
	}

	/**
	 * Adds the specified CSS class value to the element.
	 * If animations are enabled then an animation will be triggered for the class addition.
	 */
	public $addClass(className: string) {
		if (this.$hasClass(className)) {
			this.$$element.classList.add(className);
		}
	}

	/**
	 * Removes the specified CSS class value from the element.
	 * If animations are enabled then an animation will be triggered for the class removal.
	 */
	public $removeClass(className: string) {
		if (this.$hasClass(className)) {
			this.$$element.classList.remove(className);
		}
	}

	/**
	 * Adds and removes CSS class values to the element based on the difference between
	 * two space-delimited strings of CSS class values.
	 *
	 * @param newClasses: The space-delimited list of CSS classes to add or retain
	 * @param oldClasses: The space-delimited list of CSS classes to remove if not contained within newClasses
	 */
	public $updateClass(newClasses: string, oldClasses: string) {
		const nu = newClasses.split(/\s/g).filter(x => x.length > 0);
		const old = oldClasses.split(/\s/g).filter(x => x.length > 0);

		for (const o of old) {
			if (nu.includes(o)) {
				continue;
			}
			this.$removeClass(o);
		}

		for (const n of nu) {
			this.$addClass(n);
		}
	}

	/**
	 * Set DOM element attribute value.
	 */
	public $set(key: string, value: any) {
		this.$$element.setAttribute(key, value);
	}

	/**
	 * @deprecated
	 */
	public $observe<T>(_: string, __: (value?: T) => any) {
		// tslint:disable-next-line:no-console
		console.warn('$observe is a noop');
		return () => { return; };
	}

	protected $record(key: string, value: string) {
		const normalized = this.$normalize(key);
		this[normalized] = value;
		this.$attr[key] = normalized;
	}
}
