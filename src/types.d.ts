declare namespace JSX {
	interface Element extends HTMLElement { }
	interface HTMLElementIndex {
		[key: string]:
		((this: GlobalEventHandlers, e?: Event) => any) |
		string |
		number |
		boolean |
		null |
		undefined
	}
	type IntrinsicElementTagNameMap = {
		[Tag in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[Tag]> & HTMLElementIndex;
	};
	interface IntrinsicElements extends IntrinsicElementTagNameMap {
		[element: string]: Partial<HTMLElement> & HTMLElementIndex;
	}
}
