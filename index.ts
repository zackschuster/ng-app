import { StateProvider } from '@uirouter/angularjs';

import * as inputs from './src/input';
import { NgApp } from './src/app';

import 'angular-animate';
import 'angular-messages';
import 'angular-elastic';
import 'angular-ui-bootstrap';

import '@uirouter/angularjs';
import 'element-closest';

export const app = new NgApp()
	.addComponents(inputs)
	.addDependencies([
		'ngAnimate',
		'ngMessages',
		'ui.bootstrap',
		'ui.router',
		'monospaced.elastic',
	])
	.addHttpInterceptor(
		['$q', ($q: angular.IQService) => {
			return {
				responseError(err: angular.IHttpPromiseCallbackArg<any>) {
					const { data, status, statusText, config = { url: '' } } = err;
					const { url = '' } = config;

					switch (status) {
						case 404:
							app.log.error(`Route '${url}' not found`);
							break;
						case 400:
							if (typeof data === 'string') {
								app.log.error(data);
							} else if (data != null && data.toString() === '[object Object]') {
								app.log.error(Object.keys(data).map(x => `${x}: ${data[x]}`).join('\n\n'));
							}
							break;
						case 401:
						case 403:
						case 500:
							app.log.warning(statusText);
							break;
						case -1:
							app.log.warning('Server timed out.');
							break;
						default:
							app.log.error(`The request to '${url}' returned an error (code: ${status})`);
							break;
					}

					return $q.reject(err);
				},
			};
		}],
	);

app
	.module
	.config(['$stateProvider', ($stateProvider: StateProvider) => {
		if (app.router == null) {
			return app.log.devWarning('app.setRouter(ngRouter) must be run before bootstrap');
		}

		for (const definition of app.router.getRoutes()) {
			$stateProvider.state(definition);
		}
	}]);

export function wrapCtrl(controller: new() => any) {
	return app._makeNgComponentController(controller);
}

export * from './src/app';
export * from './src/service';
export * from './src/controller';
export * from './src/http';
export * from './src/logger';
export * from './src/modal';
export * from './src/renderer';
export * from './src/router';
export * from './src/input';
