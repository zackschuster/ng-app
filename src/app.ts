import { IConfig, Indexed } from '@ledge/types';
import { bootstrap, copy, injector, module } from 'angular';
import { autobind } from 'core-decorators';

import { NgDataService } from './http';
import { NgLogger } from './logger';
import { NgModalService } from './modal';
import { NgRouter, NgStateService } from './router';

import { InputComponentOptions } from './input/options';
import { InputService } from './input/service';
import { StateService } from '@uirouter/core';

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
			: Object.create(null) as NgConfig;
	}

	public get components() {
		return new Set(this.$components.keys());
	}

	public get dependencies() {
		return new Set(this.$dependencies);
	}

	public get state() {
		return this.$injector.get<StateService>('$state');
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
	protected readonly $httpInterceptors: angular.IHttpInterceptor[] = [];

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
		const { NODE_ENV } = process.env;

		this.$config = Object.assign(ngConfig, {
			ENV: NODE_ENV,
			IS_PROD: NODE_ENV === 'production',
			IS_DEV: NODE_ENV === 'development',
			IS_STAGING: NODE_ENV === 'staging',
		} as NgConfig);

		return this;
	}

	public setRouter(router: NgRouter) {
		this.$router = router;
		return this;
	}

	public addComponents(
		components: Map<string, angular.IComponentOptions> | Indexed<angular.IComponentOptions>,
	) {
		const entries = components instanceof Map
			? components.entries()
			: Object.entries(components);

		for (let [name, component] of entries) {
			if (this.isInputComponent(component)) {
				component = InputService.defineInputComponent(component);
			}

			if (typeof component.controller === 'string') {
				throw new Error('String controller references not supported');
			} else if (typeof component.controller === 'function') {
				component.controller = this.makeComponentController(component.controller);
			}

			this.$components.set(name, component);
		}

		return this;
	}

	public isInputComponent(component: angular.IComponentOptions & { type?: 'input' }):
		component is InputComponentOptions {
			return component.type === 'input';
		}

	public addDependencies(...moduleNames: string[]) {
		this.$dependencies.push(...moduleNames);
		return this;
	}

	public addHttpInterceptor(interceptor: angular.IHttpInterceptor) {
		this.$httpInterceptors.push(interceptor);
		return this;
	}

	public makeComponentController($controller: angular.IControllerConstructor): [
		'$element', '$scope', '$attrs', '$timeout', '$injector', '$state',
		new (...args: any) => angular.IController
	] {
		const { config, http, log, getApiPrefix } = this;
		const { IS_PROD, IS_DEV, IS_STAGING } = this.$config;

		// Force `this` to always refer to the class instance, no matter what
		autobind($controller);

		// tslint:disable-next-line:max-classes-per-file
		class InternalController extends ($controller as new (...args: any[]) => angular.IController) {
			public $log = log;
			public $http = http;
			public $config = config;
			public $element: HTMLElement;

			public isProduction = IS_PROD;
			public isDevelopment = IS_DEV;
			public isStaging = IS_STAGING;

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
				this.apiPrefix = getApiPrefix();
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
			this.$httpInterceptors,
			this.forceUpdate,
			this.getApiPrefix,
			options,
		);
	}

	protected $logger() {
		return new NgLogger(this.$injector.get('$log'), this.$config.IS_PROD);
	}

	protected getApiPrefix() {
		const { PREFIX = {} } = this.$config;
		const { API = '' } = PREFIX;

		if (typeof API !== 'string') {
			this.log.devWarning('config.PREFIX.API not set to a string.');
		}

		return API;
	}
}
