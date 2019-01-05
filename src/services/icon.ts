import { Indexed } from '@ledge/types';

// tslint:disable:no-var-requires
const data = require('octicons/build/data.json');
const octicons: Indexed = { };

for (const key of Object.keys(data)) {
	const icon = octicons[key] = Object.assign({ }, data[key]);

	// Returns a string representation of html attributes
	const htmlAttributes = (options?: any) => {
		const attributes: string[] = [];
		const attrObj = Object.assign({ }, icon.options, options);

		// If the user passed in options
		if (options) {
			// If any of the width or height is passed in
			if (options.width || options.height) {
				attrObj.width = options.width ? options.width : (parseInt(options.height, 10) * icon.options.width / icon.options.height);
				attrObj.height = options.height ? options.height : (parseInt(options.width, 10) * icon.options.height / icon.options.width);
			}

			// If the user passed in class
			if (options.class) {
				attrObj.class = `octicon octicon-${key} ${options.class}`;
				attrObj.class.trim();
			}

			// If the user passed in aria-label
			if (options['aria-label']) {
				attrObj['aria-label'] = options['aria-label'];
				attrObj.role = 'img';

				// Un-hide the icon
				delete attrObj['aria-hidden'];
			}
		}

		Object.keys(attrObj).forEach(option => {
			attributes.push(`${option}="${attrObj[option]}"`);
		});

		return attributes.join(' ').trim();
	};

	// Set the symbol for easy access
	icon.symbol = key;

	// Set all the default options
	icon.options = {
		version: '1.1',
		width: icon.width,
		height: icon.height,
		viewBox: `0 0 ${icon.width} ${icon.height}`,
		class: `octicon octicon-${key}`,
		'aria-hidden': 'true',
	};

	// Function to return an SVG object
	icon.toSVG = (options: any) => `<svg ${htmlAttributes(options)}>${icon.path}</svg>`;
}

export { octicons };
