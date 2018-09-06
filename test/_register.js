require('esm');
require('ts-node').register({ transpileOnly: true, ignore: [] });
require('browser-env')({ resources: 'usable' });
// @ts-ignore
require('angular/angular.js');
require('angular-mocks');

Object.defineProperty(global, 'angular', {
	configurable: false,
	enumerable: true,
	writable: false,
	value: /** @type {*} */(window).angular,
});

// tslint:disable-next-line:max-line-length
// taken from https://github.com/PeculiarVentures/node-webcrypto-ossl/blob/6ca13d14243901bb52c195ee0fee70bc4e58fd84/lib/webcrypto.ts#L39
Object.defineProperty(global, 'crypto', {
	configurable: false,
	enumerable: true,
	writable: false,
	value: {
		getRandomValues(array) {
			if (array) {
				if (array.byteLength > 65536) {
					const error = new Error(`ERR_RANDOM_VALUE_LENGTH ${array.byteLength}`);
					/** @type {*} */
					(error).code = 22;
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
