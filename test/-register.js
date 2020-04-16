import { createRequire } from 'module';
import { join } from 'path';
import browserenv from 'browser-env';
import fetch from 'node-fetch';
import tsnode from 'ts-node';

tsnode.register({ transpileOnly: true, ignore: [] });

Object.defineProperty(globalThis, 'window', { configurable: false, enumerable: true, writable: false, value: browserenv() });

const ørequirePath = join(process.cwd(), 'node_modules');
const ørequire = createRequire(ørequirePath);

ørequire('angular/angular.js');
ørequire('angular-mocks');

globalThis.angular = window.angular;
globalThis.fetch = fetch;
globalThis.Request = /** @type {never} */(fetch.Request);
globalThis.Response = /** @type {never} */(fetch.Response);

ørequire('@uirouter/angularjs');
