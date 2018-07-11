// @ts-nocheck
if (typeof module !== 'undefined' && module.exports) {
	require('browser-env')({ resources: 'usable' });
	require('angular/angular.js');
	require('angular-mocks');
	global.angular = window.angular;
	// taken from https://github.com/PeculiarVentures/node-webcrypto-ossl/blob/6ca13d14243901bb52c195ee0fee70bc4e58fd84/lib/webcrypto.ts#L39
	global.crypto = {
		getRandomValues(array) {
			if (array) {
				if (array.byteLength > 65536) {
					const error = new Error(`ERR_RANDOM_VALUE_LENGTH ${array.byteLength}`);
					error.code = 22;
					throw error;
				}
				const bytes = require('crypto').randomBytes(array.byteLength);
				array.set(new (array.constructor)(bytes.buffer));
				return array;
			}
			return null;
		}
	}
	require('angular-ui-bootstrap');
}
