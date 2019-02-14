require('ts-node').register({ transpileOnly: true, ignore: [] });
require('browser-env')({ resources: 'usable' });
// @ts-ignore
require('angular/angular.js');
require('angular-mocks');

const defineGlobal = /**
 * @param {string} name
 * @param {any} value
 */
 (name, value) => {
	Object.defineProperty(global, name, {
		configurable: false,
		enumerable: true,
		writable: false,
		value
	});
}

const fetch = require('node-fetch');
defineGlobal('fetch', fetch);
defineGlobal('Request', fetch.Request);
defineGlobal('Response', fetch.Response);
defineGlobal('angular', /** @type {Window & { angular: import('angular') }} */(window).angular);

require('@uirouter/angularjs');
