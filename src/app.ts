import { Indexed } from '@ledge/types';
import { StateService } from '@uirouter/core';
import { bootstrap, injector, isFunction, module } from 'angular';
import { autobind } from 'core-decorators';

import { NgController, makeInjectableCtrl } from './controller';
import { InputService, NgInputOptions } from './inputs';
import { NgAppConfig, NgComponentOptions } from './options';
import {
	DEFAULT_REQUEST_TIMEOUT,
	NgHttp,
	NgHttpInterceptor,
	NgHttpOptions,
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
				timeout: this.$config.IS_PROD ? DEFAULT_REQUEST_TIMEOUT : undefined,
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
	protected $router: NgRouter;
	protected $config: NgAppConfig;

	protected readonly $module = module(this.$id, this.$dependencies);
	protected readonly $bootstrap = bootstrap;
	protected readonly $components = new Map<string, angular.IComponentOptions>();
	protected readonly $httpInterceptors: NgHttpInterceptor[] = [];

	private _http: ReturnType<NgApp['$http']>;
	private _log: ReturnType<NgApp['$logger']>;
	private _modal: ReturnType<NgApp['$modal']>;

	constructor() {
		this.configure({ })
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
		await this.$injector.get('$rootScope').$applyAsync();
	}

	public async bootstrap({ strictDi }: angular.IAngularBootstrapConfig = { strictDi: true }) {
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
		const entries = components instanceof Map
			? components.entries()
			: Object.entries(components);

		for (let [name, component] of entries) {
			if (this.isInputComponent(component)) {
				component = InputService.defineInputComponent(component);
			}

			if (typeof component.controller !== 'undefined') {
				throw new Error(`[${name} component] 'controller' property not supported. Use the 'ctrl' property instead.`);
			}
			if (typeof component.ctrl === 'function') {
				// i like the explicit typecasting over `as never` or `as any`
				component.controller = this.makeComponentController(component.ctrl) as unknown as undefined;
			}

			this.$components.set(name, component);
		}

		return this;
	}

	public isInputComponent(component: NgComponentOptions & { type?: 'input' }):
		component is NgInputOptions {
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

	public addHttpInterceptor(interceptor: NgHttpInterceptor) {
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

	protected $http(options: NgHttpOptions) {
		if ((typeof options.onFinally === 'function') === false) {
			options.onFinally = this.forceUpdate;
		}
		if (isFunction(options.getConfig) === false) {
			options.getConfig = () => this.config;
		}
		if (Array.isArray(options.interceptors)) {
			for (const interceptor of options.interceptors) {
				this.addHttpInterceptor(interceptor);
			}
		}
		// allow all dataservice instances to share the same interceptor queue
		options.interceptors = this.$httpInterceptors;

		return new NgHttp(options);
	}

	protected $logger() {
		return new NgLogger(this.$injector.get('$log'), this.$config.IS_PROD);
	}
}
