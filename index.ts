import { StateProvider } from '@uirouter/angularjs';
import { HttpStatusCode } from '@ledge/types/http';

import { NgApp } from './src/app';
import { inputs } from './src/input';

import 'angular-animate';
import 'angular-messages';
import 'angular-ui-bootstrap';

// tslint:disable-next-line:no-duplicate-imports
import '@uirouter/angularjs';

const app = new NgApp()
	.addComponents(new Map(Object.entries(inputs)))
	.addDependencies([
		'ngAnimate',
		'ngMessages',
		'ui.bootstrap',
		'ui.router',
	])
	.addHttpInterceptor({
		responseError(err) {
			const { data, status, statusText, config = { url: '' } } = err;
			const { url = '' } = config;

			switch (status) {
				case HttpStatusCode.NotFound:
					app.log.error(`Route '${url}' not found`);
					break;
				case HttpStatusCode.BadRequest:
					if (typeof data === 'string') {
						app.log.error(data);
					} else if (data != null && data.toString() === '[object Object]') {
						app.log.error(Object.keys(data).map(x => `${x}: ${data[x]}`).join('\n\n'));
					}
					break;
				case HttpStatusCode.Unauthorized:
				case HttpStatusCode.Forbidden:
				case HttpStatusCode.InternalServerError:
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

export function makeNgCtrl(controller: new() => any) {
	return app._makeNgComponentController(controller);
}

export * from './src/app';
export * from './src/controller';
export * from './src/input';
export * from './src/services';
