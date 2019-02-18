// tslint:disable:file-name-casing no-magic-numbers
require('esm');
require('ts-node').register({ transpileOnly: true, ignore: [] });
require('browser-env')({ pretendToBeVisual: true });
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

const angular = /** @type {Window & { angular: import('angular') }} */(window).angular;
const fetch = require('node-fetch');
const { Request, Response } = fetch;

defineGlobal('angular', angular);
defineGlobal('fetch', fetch);
defineGlobal('Request', Request);
defineGlobal('Response', Response);

require('@uirouter/angularjs');
