import { Indexed } from '@ledge/types';
import { StateService } from '@uirouter/core';
import { bootstrap, injector, module } from 'angular';
import { autobind } from 'core-decorators';

import { NgController, makeInjectableCtrl } from './controller';
import { InputService, NgInputOptions } from './inputs';
import { NgAppConfig, NgComponentOptions } from './options';
import {
	NgDataService,
	NgDataServiceOptions,
	NgLogger,
	NgModal,
	NgRouter,
} from './services';

@autobind
export class NgApp {
	public get module() {
		return this.$module;
	}

	public get router() {
		return this.$router;
	}

	public get config() {
		return this.$config;
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
			this._http = this.$http({
				timeout: this.$config.IS_PROD ? 10000 : undefined,
				withCredentials: true,
				getConfig: () => this.$config,
			});
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
	protected readonly $components = new Map<string, angular.IComponentOptions>();
	protected readonly $httpInterceptors: angular.IHttpInterceptor[] = [];

	protected $router: NgRouter;
	protected $config: NgAppConfig;

	// tslint:disable:variable-name
	private _http: ReturnType<NgApp['$http']>;
	private _log: ReturnType<NgApp['$logger']>;
	private _modal: ReturnType<NgApp['$modal']>;
	// tslint:enable:variable-name

	constructor() {
		this.configure({ })
			.$module.config([
				'$compileProvider',
				'$locationProvider',
				'$qProvider',
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
				},
			])
			.run([
				'$injector',
				'$animate',
				(
					$injector: angular.auto.IInjectorService,
					$animate: angular.animate.IAnimateService,
				) => {
					this.$injector = $injector;
					$animate.enabled(true);
				},
			]);
	}

	/**
	 * Force the application to run an update cycle
	 */
	public async forceUpdate() {
		this.$injector.get('$rootScope').$applyAsync();
	}

	public async bootstrap(
		{ strictDi }: angular.IAngularBootstrapConfig = { strictDi: true },
	) {
		for (const [name, definition] of this.$components) {
			this.$module.component(name, definition);
		}

		setTimeout(() => document.body.classList.add('bootstrapped'));
		return this.$bootstrap(document.body, [this.$id], { strictDi });
	}

	public configure(config: {
		NAME?: string,
		ENV?: string,
		PREFIX?: {
			API: string,
			TEMPLATE?: string,
		},
	}) {
		this.$config = new NgAppConfig(config);
		return this;
	}

	public setRouter(router: NgRouter) {
		this.$router = router;
		return this;
	}

	public addComponents(components: Map<string, NgComponentOptions> | Indexed<NgComponentOptions>) {
		const entries =
			components instanceof Map
				? components.entries()
				: Object.entries(components);

		for (let [name, component] of entries) {
			if (this.isInputComponent(component)) {
				component = InputService.defineInputComponent(component);
			}

			if (typeof component.controller !== 'undefined') {
				throw new Error(
					`[${name} component] 'controller' property not supported. Use the 'ctrl' property instead.`,
				);
			}

			if (typeof component.ctrl === 'function') {
				(component as angular.IComponentOptions).controller = this.makeComponentController(component.ctrl);
			}

			this.$components.set(name, component);
		}

		return this;
	}

	public isInputComponent(
		component: angular.IComponentOptions & { type?: 'input' },
	): component is NgInputOptions {
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

	public makeComponentController($controller: new () => NgController): [
		'$element',
		'$scope',
		'$injector',
		ReturnType<typeof makeInjectableCtrl>
	] {
		const componentCtrl = makeInjectableCtrl($controller, {
			log: this.log,
			http: this.http,
			config: () => this.config,
		});

		return [
			'$element',
			'$scope',
			'$injector',
			componentCtrl,
		];
	}

	protected $modal() {
		return new NgModal(
			this.log,
			this.http,
			this.config,
			this.$injector,
		);
	}

	protected $http(options: NgDataServiceOptions) {
		if ((typeof options.onFinally === 'function') === false) {
			options.onFinally = this.forceUpdate;
		}
		if (Array.isArray(options.interceptors)) {
			for (const interceptor of options.interceptors) {
				this.addHttpInterceptor(interceptor);
			}
		}
		// allow all dataservice instances to share the same interceptor queue
		options.interceptors = this.$httpInterceptors;

		return new NgDataService(this.$injector.get('$http'), options);
	}

	protected $logger() {
		return new NgLogger(this.$injector.get('$log'), this.$config.IS_PROD);
	}
}
