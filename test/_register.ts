// tslint:disable:file-name-casing no-magic-numbers no-var-requires
require('ts-node').register({ transpileOnly: true, ignore: [] });
require('browser-env')({ resources: 'usable' });
require('angular/angular.js');
require('angular-mocks');

Object.defineProperty(global, 'angular', {
	configurable: false,
	enumerable: true,
	writable: false,
	value: window.angular,
});

// taken from https://github.com/PeculiarVentures/node-webcrypto-ossl/blob/6ca13d14243901bb52c195ee0fee70bc4e58fd84/lib/webcrypto.ts#L39
Object.defineProperty(global, 'crypto', {
	configurable: false,
	enumerable: true,
	writable: false,
	value: {
		// @ts-expect-error
		getRandomValues(array) {
			if (array) {
				if (array.byteLength > 65536) {
					const error = new Error(`ERR_RANDOM_VALUE_LENGTH ${array.byteLength}`);
					// @ts-expect-error
					error.code = 22;
					throw error;
				}
				const bytes = require('crypto').randomBytes(array.byteLength);
				array.set(new (array.constructor)(bytes.buffer));
				return array;
			}
			return null;
		},
	},
});
require('angular-ui-bootstrap');
