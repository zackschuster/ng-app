import 'angular';
import 'angular-messages';

import uirouter from '@uirouter/angularjs';
import { HttpStatusCode } from '@ledge/types/http';

import { NgApp } from './src/app';
import { inputs } from './src/inputs';
import { misc } from './src/misc';

export const app = new NgApp()
	.addComponents(inputs)
	.addComponents(misc)
	.addDependencies([
		'ngMessages',
		uirouter,
	])
	.addHttpInterceptor({
		async responseError(response, err) {
			const { status, statusText, url } = response;
			const data = await response.json();

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

export * from './src/app';
export * from './src/attributes';
export * from './src/controller';
export * from './src/http';
export * from './src/logger';
export * from './src/modal';
export * from './src/options';
export * from './src/dom';
export * from './src/router';
export * from './src/service';

export * from './src/inputs';
export * from './src/misc';
