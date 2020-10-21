// tslint:disable:no-redundant-jsdoc no-var-requires
const browserenv = require('browser-env');
const fetch = require('node-fetch');
const tsnode = require('ts-node');

tsnode.register({ transpileOnly: true, ignore: [] });

Object.defineProperty(globalThis, 'window', { configurable: false, enumerable: true, writable: false, value: browserenv() });

// @ts-ignore
require('angular/angular.js');
// @ts-ignore
require('angular-mocks');

globalThis.angular = window.angular;
globalThis.fetch = fetch;
globalThis.Request = /** @type never */(fetch.Request);
globalThis.Response = /** @type never */(fetch.Response);

require('@uirouter/angularjs');
