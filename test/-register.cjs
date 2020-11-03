// tslint:disable:no-var-requires
Object.defineProperty(globalThis, 'window', { value: require('browser-env')() });
// @ts-ignore
require('angular/angular.js');
// @ts-ignore
require('angular-mocks');

const fetch = require('node-fetch');

Object.assign(globalThis, {
	fetch,
	Request: fetch.Request,
	Response: fetch.Response,
	angular: window.angular,
});

// @ts-ignore
require('../build/ng-app.cjs');
require.cache[require.resolve('../index.ts')] = require.cache[require.resolve('../build/ng-app.cjs')];
