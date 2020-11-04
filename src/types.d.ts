declare namespace JSX {
	interface Element extends HTMLElement { }
	type IntrinsicElementTagNameMap = {
		[Tag in keyof HTMLElementTagNameMap]: Partial<HTMLElementTagNameMap[Tag]> &
		{ class?: string, for?: string, role?: string };
	};
	interface IntrinsicElements extends IntrinsicElementTagNameMap {
		[element: string]: Partial<HTMLElement> & { class?: string, for?: string, role?: string };
	}
}
