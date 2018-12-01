// tslint:disable:file-name-casing no-magic-numbers
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
require('angular-ui-bootstrap');
