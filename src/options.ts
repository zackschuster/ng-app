import { IConfig } from '@ledge/types';
import { autobind } from 'core-decorators';
import { NgController } from './controller';

@autobind
export class NgAppConfig implements IConfig {
	public readonly IS_PROD: boolean;
	public readonly IS_DEV: boolean;
	public readonly IS_STAGING: boolean;

	/**
	 * The name of the library or application.
	 */
	public readonly NAME: string;

	/**
	 * The current library or application version, either as a string (e.g. 1.0.0 or v1) or as a number (e.g. 1 or 2.3)
	 */
	public readonly VERSION: string | number;

	/**
	 * The host environment for the library or application.
	 */
	public readonly ENV: string;

	/**
	 * A key/value map of prefixes for outgoing data requests.
	 */
	public readonly PREFIX: {
		API: string;
		TEMPLATE?: string;
	};

	constructor({
		NAME = 'ng-app',
		ENV = '',
		PREFIX = { API: '' },
	} = { }) {
		if (ENV == null || ENV.length === 0) {
			ENV = process.env.NODE_ENV as string;
		}
		this.ENV = ENV;
		this.IS_PROD = ENV === 'production';
		this.IS_DEV = ENV === 'development';
		this.IS_STAGING = ENV === 'staging';

		this.NAME = NAME;
		this.PREFIX = PREFIX;
	}

	public getApiPrefix() {
		const { PREFIX = { } as NgAppConfig['PREFIX'] } = this;
		const { API = '' } = PREFIX;

		if (typeof API !== 'string') {
			throw new Error('config.PREFIX.API not set to a string.');
		}

		return API;
	}
}

export interface NgComponentOptions extends angular.IComponentOptions {
	/**
	 * Use this instead of controller, as ng-app will disregard the controller prop for type safety reasons.
	 */
	ctrl?: new () => NgController;

	/**
	 * @deprecated use `ctrl` instead
	 *
	 * Controller constructor function that should be associated with newly created scope or the name of a registered
	 * controller if passed as a string. Empty function by default.
	 * Use the array form to define dependencies (necessary if strictDi is enabled and you require dependency injection)
	 */
	controller?: undefined;
}
