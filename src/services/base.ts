import { isIE11 } from '@ledge/is-ie-11';
import { isMobile } from '@ledge/is-mobile';

export abstract class NgService {
	public static IsMobile() {
		return isMobile();
	}

	/**
	 * @see https://stackoverflow.com/a/2117523
	 */
	public static UUIDv4() {
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
			// tslint:disable:no-bitwise
			const r = Math.random() * 16 | 0;
			const v = c === 'x' ? r : (r & 0x3 | 0x8);
			// tslint:enable:no-bitwise
			return v.toString(16);
		});
	}

	protected get isMobile() {
		return isMobile();
	}

	protected get isIE11() {
		return isIE11();
	}

	/**
	 * Separates words in a string by capital letters. Also capitalizes the first letter.
	 *
	 * The following exceptions apply:
	 * 1) If string is all-caps, it's returned as-is
	 * 2) Any embedded acronyms (such as F.A.Q.) are returned as-is
	 * 3) Consecutive capital letters are returned as-is
	 * 3) Hyphenated words retain concatenation
	 *
	 * @param item - The string value to be split
	 */
	public splitByCapitalLetter(item: string) {
		const split = item.split(/(?=[A-Z])/);
		return split.every(x => x.length === 1)
			? item
			: split
					.map(x => x.trim())
					.map(x =>
						// tslint:disable-next-line: no-magic-numbers
						x.length === 1 || (x.length === 2 && x.charAt(1) === '.')
							// tslint:disable-next-line: prefer-template
							? (x.toUpperCase() + '\uFFFF')
							: (x.charAt(0).toUpperCase() + x.substring(1)),
					)
					.join(' ')
					.replace(
						/\w{1}\.?(\uFFFF){1}\s?/g,
						([first, second]) =>
							second === '.'
								? first + second
								: first,
					)
					.replace(
						/\.{1}\w{2,}/g,
						([first, second, ...rest]) =>
							`${first} ${second.toUpperCase()}${rest.join('')}`,
					)
					.replace(/- /g, '-');
	}
}
