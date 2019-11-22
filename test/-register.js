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
	// tslint:disable-next-line:object-literal-sort-keys
	value: /** @type {*} */(window).angular,
});

require('@uirouter/angularjs');
