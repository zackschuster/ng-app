import { IConfig } from '@ledge/types';
import { bootstrap, copy, injector, module } from 'angular';
import { autobind } from 'core-decorators';

import { NgDataService } from './http';
import { NgLogger } from './logger';
import { NgModalService } from './modal';
import { NgRouter, NgStateService } from './router';

import { InputComponentOptions } from './input/options';
import { InputService } from './input/service';

export interface NgConfig extends IConfig {
	readonly IS_PROD: boolean;
	readonly IS_DEV: boolean;
	readonly IS_STAGING: boolean;
}

@autobind
export class NgApp {
	public get module() {
		return this.$module;
	}

	public get router() {
		return this.$router;
	}

	public get config() {
		return this.$config != null
			? copy(this.$config)
			: Object.create(null);
	}

	public get components() {
		return new Set(this.$components.keys());
	}

	public get dependencies() {
		return new Set(this.$dependencies);
	}

	public get http() {
		if (this._http == null) {
			this._http = this.$http();
		}
		return this._http;
	}

	public get log() {
		if (this._log == null) {
			this._log = this.$logger();
		}
		return this._log;
	}

	public get modal() {
		if (this._modal == null) {
			this._modal = this.$modal();
		}
		return this._modal;
	}

	public readonly $id = '$core';
	public $injector = injector(['ng']);

	protected $dependencies: string[] = [];

	protected readonly $module = module(this.$id, this.$dependencies);
	protected readonly $bootstrap = bootstrap;

	protected $router: NgRouter;
	protected $config: NgConfig;

	protected readonly $components: Map<string, angular.IComponentOptions> = new Map();

	// tslint:disable:variable-name
	private _http: ReturnType<NgApp['$http']>;
	private _log: ReturnType<NgApp['$logger']>;
	private _modal: ReturnType<NgApp['$modal']>;
	// tslint:enable:variable-name

	constructor() {
		this.configure({})
			.$module
			.config([
				'$compileProvider', '$locationProvider', '$qProvider',
				(
					$compileProvider: angular.ICompileProvider,
					$locationProvider: angular.ILocationProvider,
					$qProvider: angular.IQProvider,
				) => {
					const { IS_DEV, IS_STAGING } = this.$config;

					$compileProvider
						.debugInfoEnabled(!!(IS_DEV || IS_STAGING))
						.commentDirectivesEnabled(false)
						.cssClassDirectivesEnabled(false);

					$locationProvider.html5Mode(true);
					$qProvider.errorOnUnhandledRejections(false);
			}])
			.run([
				'$injector', '$animate', '$templateCache',
				(
					$injector: angular.auto.IInjectorService,
					$animate: angular.animate.IAnimateService,
					$templateCache: angular.ITemplateCacheService,
				) => {
					['day', 'month', 'year'].forEach(x => {
						const templateUrl = `uib/template/datepicker/${x}.html`;
						const template = $templateCache.get<string>(templateUrl);
						if (template != null) {
							$templateCache.put(templateUrl, template.replace(/glyphicon/g, 'fa'));
						}
					});

					this.$injector = $injector;
					$animate.enabled(true);
				}]);
	}

	/**
	 * Force the application to run an update cycle
	 */
	public async forceUpdate() {
		this.$injector.get('$rootScope').$applyAsync();
	}

	public bootstrap({ strictDi }: angular.IAngularBootstrapConfig = { strictDi: true }) {
		for (const [name, definition] of this.$components) {
			this.$module.component(name, definition);
		}

		setTimeout(() => document.body.classList.add('bootstrapped'));
		this.$bootstrap(document.body, [this.$id], { strictDi });
	}

	public configure(ngConfig: Partial<NgConfig>) {
		const env = process.env.NODE_ENV;

		this.$config = Object.assign(ngConfig, {
			ENV: env,
			IS_PROD: env === 'production',
			IS_DEV: env === 'development',
			IS_STAGING: env === 'staging',
		} as NgConfig);

		return this;
	}

	public setRouter(router: NgRouter) {
		this.$router = router;
		return this;
	}

	public addComponents(components: Map<string, angular.IComponentOptions>) {
		for (let [name, component] of components) {
			if (this.isInputComponent(component)) {
				component = InputService.defineInputComponent(component);
			}

			if (typeof component.controller === 'string') {
				throw new Error('String controller references not supported');
			} else if (typeof component.controller === 'function') {
				component.controller = this._makeNgComponentController(component.controller);
			}

			this.$components.set(name, component);
		}

		return this;
	}

	public isInputComponent(component: angular.IComponentOptions & { type?: 'input' }):
		component is InputComponentOptions {
			return component.type === 'input';
		}

	public addDependency(moduleName: string) {
		this.$dependencies.push(moduleName);
		return this;
	}

	public addDependencies(moduleNames: string[]) {
		moduleNames.forEach(moduleName => this.addDependency(moduleName));
		return this;
	}

	public addHttpInterceptor(interceptor: angular.Injectable<angular.IHttpInterceptorFactory>) {
		this.$module.config(['$httpProvider', ($httpProvider: angular.IHttpProvider) => {
			$httpProvider.interceptors.push(interceptor);
		}]);
		return this;
	}

	public _makeNgComponentController($controller: angular.IControllerConstructor) {
		const { config, http, $logger, _verifyApiPrefix: getApiPrefix } = this;
		const { IS_PROD, IS_DEV, IS_STAGING } = this.$config;

		// Force `this` to always refer to the class instance, no matter what
		autobind($controller);

		// tslint:disable-next-line:max-classes-per-file
		class InternalController extends ($controller as new (...args: any[]) => angular.IController) {
			public $log = $logger();
			public $http = http;
			public $config = config as Required<NgConfig>;
			public $element: HTMLElement;

			public isProduction = IS_PROD;
			public isDevelopment = IS_DEV;
			public isStaging = IS_STAGING;
			public apiPrefix = getApiPrefix();

			constructor(
				$element: JQLite,
				public $scope: angular.IScope,
				public $attrs: angular.IAttributes,
				public $timeout: angular.ITimeoutService,
				public $injector: angular.auto.IInjectorService,
				public $state: NgStateService,
			) {
				super();

				this.$element = $element[0];
			}
		}

		return [
			'$element', '$scope', '$attrs', '$timeout', '$injector', '$state',
			InternalController,
		];
	}

	protected $modal() {
		return new NgModalService(this.$injector.get('$uibModal'), this.$logger());
	}

	protected $timeout() {
		return this.$injector.get('$timeout');
	}

	protected $http(options: angular.IRequestShortcutConfig = {
		timeout: this.$config.IS_PROD ? 10000 : undefined,
		withCredentials: true,
	}) {
		return new NgDataService(
			this.$injector.get('$http'),
			this.$timeout(),
			this._verifyApiPrefix(),
			options,
		);
	}

	protected $logger() {
		return new NgLogger(this.$injector.get('$log'), this.$config.IS_PROD);
	}

	protected _verifyApiPrefix(config = this.$config) {
		const { PREFIX = {} } = config;
		const { API = '' } = PREFIX;

		if (typeof API !== 'string') {
			this.log.devWarning('config.PREFIX.API not set to a string.');
		}

		return API;
	}
}
