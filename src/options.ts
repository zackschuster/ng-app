import { IConfig, Indexed } from '@ledge/types';
import { autobind } from 'core-decorators';
import { NgAttributes, NgController, makeInjectableCtrl } from './controller';

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

/**
 * Component definition object (a simplified directive definition object)
 */
export interface NgComponentOptions<T = typeof NgController> {
	/**
	 * Controller constructor function that should be associated with newly created scope or the name of a registered
	 * controller if passed as a string. Empty function by default.
	 * Use the array form to define dependencies (necessary if strictDi is enabled and you require dependency injection)
	 */
	controller?: T | ['$element', '$scope', '$injector', ReturnType<typeof makeInjectableCtrl>];

	/**
	 * @deprecated For consistency this will always be the historical default `$ctrl`. ng-app's architecture ensures all scopes are isolates, so there's no risk of scope leakage.
	 *
	 * An identifier name for a reference to the controller. If present, the controller will be published to its scope under
	 * the specified name. If not present, this will default to `$ctrl`.
	 */
	controllerAs?: never;

	/**
	 * html template as a string or a function that returns an html template as a string which should be used as the
	 * contents of this component. Empty string by default.
	 * If template is a function, then it is injected with the following locals:
	 * $element - Current element
	 * $attrs - Current attributes object for the element
	 * Use the array form to define dependencies (necessary if strictDi is enabled and you require dependency injection)
	 */
	template?: string | (() => string) | (string | (($element: [HTMLElement], $attrs: NgAttributes) => string))[];

	/**
	 * Path or function that returns a path to an html template that should be used as the contents of this component.
	 * If templateUrl is a function, then it is injected with the following locals:
	 * $element - Current element
	 * $attrs - Current attributes object for the element
	 * Use the array form to define dependencies (necessary if strictDi is enabled and you require dependency injection)
	 */
	templateUrl?: never;

	/**
	 * Define DOM attribute binding to component properties. Component properties are always bound to the component
	 * controller and not to the scope.
	 */
	bindings?: Indexed<string>;

	/**
	 * Whether transclusion is enabled. Disabled by default.
	 */
	transclude?: boolean | Indexed<string>;

	/**
	 * Requires the controllers of other directives and binds them to this component's controller.
	 * The object keys specify the property names under which the required controllers (object values) will be bound.
	 * Note that the required controllers will not be available during the instantiation of the controller,
	 * but they are guaranteed to be available just before the $onInit method is executed!
	 */
	require?: Indexed<string>;
}
