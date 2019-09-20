import { Indexed } from '@ledge/types';
import data = require('@primer/octicons/build/data.json');

const icons = { } as {
	[K in keyof typeof data]: (typeof data)[K] &
	{
		symbol: string;
		options: {
			version: string;
			width: number;
			height: number;
			readonly viewBox: string;
			class: string;
			'aria-hidden': string;
		};
		toSvg(options: any): string;
	}
};

for (const key of Object.keys(data) as (keyof typeof data)[]) {
	const icon = {
		...data[key],
		symbol: '',
		options: {
			version: '1.1',
			width: 0,
			height: 0,
			get viewBox() {
				return `0 0 ${this.width} ${this.height}`;
			},
			class: `octicon octicon-${key}`,
			'aria-hidden': 'true',
		},

		/**
		 * Returns a string representation of html attributes
		 */
		htmlAttributes(options: Indexed = { }) {
			const attributes: string[] = [];
			const attrObj: Indexed = { };

			// if the user passed in options
			if (options) {
				// if any of the width or height is passed in
				if (options.width || options.height) {
					attrObj.width = options.width ? options.width : (parseInt(options.height, 10) * icon.width / icon.height);
					attrObj.height = options.height ? options.height : (parseInt(options.width, 10) * icon.height / icon.width);
				}

				// if the user passed in class
				attrObj.class = options.class ? `${this.options.class} ${options.class.trim()}` : this.options.class;

				// if the user passed in aria-label
				if (options['aria-label']) {
					attrObj['aria-label'] = options['aria-label'];
					attrObj.role = 'img';

					// un-hide the icon
					delete attrObj['aria-hidden'];
				}
			}

			return attributes
				.concat(Object.keys(attrObj).map(option => `${option}="${attrObj[option]}"`))
				.join(' ')
				.trim();
		},
		toSvg(options: any) {
			return `<svg ${this.htmlAttributes(options)}>${this.path}</svg>`;
		},
	};

	icons[key] = icon;
}

export { icons };
