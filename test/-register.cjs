// tslint:disable:no-var-requires
const fetch = require('node-fetch');

Object.assign(globalThis, { fetch, Request: fetch.Request, Response: fetch.Response });
Object.defineProperty(globalThis, 'window', { value: require('browser-env')() });

// @ts-expect-error -- we don't need the type info
require('angular/angular.js'); require('angular-mocks');
globalThis.angular = window.angular;

// run tests against bundle (intended for prepublisOnly script)
if (process.title === '../build/ng-app.cjs') {
	require(process.title);
	require.cache[require.resolve('../index.ts')] = require.cache[require.resolve(process.title)];
} else {
	require('@uirouter/angularjs');
}
