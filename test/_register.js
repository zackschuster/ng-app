// @ts-ignore
require('ts-node').register({ transpileOnly: true, ignore: [] });
// @ts-ignore
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
