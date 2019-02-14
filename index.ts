import { StateProvider } from '@uirouter/angularjs';

import { NgApp } from './src/app';
import { inputs } from './src/inputs';
import { misc } from './src/misc';

import ngAnimate from 'angular-animate';
// @ts-ignore
import ngMessages from 'angular-messages';
import uirouter from '@uirouter/angularjs';

const app = new NgApp();

app
	.addComponents(inputs)
	.addComponents(misc)
	.addDependencies(
		ngAnimate,
		ngMessages,
		uirouter,
	)
	.addHttpInterceptor({
		async responseError(response, err) {
			const { status, statusText, url } = response;
			const data = await response.json();

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

			return err;
		},
	});

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

export { app };

export function makeNgCtrl(controller: new () => any) {
	return app.makeComponentController(controller);
}

export * from './src/app';
export * from './src/controller';
export * from './src/inputs';
export * from './src/misc';
export * from './src/services';
