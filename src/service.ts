import isIE11 from '@ledge/is-ie-11';

export class NgService {
	public static IsMobile() {
		return typeof window === 'object' && window.innerWidth < 767;
	}
	protected get isMobile() {
		return NgService.IsMobile();
	}
	protected get isIE11() {
		return isIE11();
	}

	/**
	 * Separates words in a string by capital letters. Also capitalizes the first letter.
	 * If string is all-caps, it's returned as-is.
	 *
	 * @param item - The string value to be split
	 */
	public splitByCapitalLetter(item: string) {
		const split = item.split(/(?=[A-Z])/);
		return split.every(x => x.length === 1)
			? item
			: split
					.map(x => x.trim())
					.map(x => x.charAt(0).toUpperCase() + x.substring(1))
					.join(' ');
	}
}
