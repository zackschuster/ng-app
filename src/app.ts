import { Indexed } from '@ledge/types';
import { StateService } from '@uirouter/core';
import { StateProvider } from '@uirouter/angularjs';

import { NgController, makeInjectableCtrl } from './controller';
import { DEFAULT_REQUEST_TIMEOUT, NgHttp, NgHttpInterceptor, NgHttpOptions } from './http';
import { InputService, NgInputOptions } from './inputs';
import { NgLogger } from './logger';
import { NgModal } from './modal';
import { NgAppConfig, NgComponentOptions } from './options';
import { NgRouter } from './router';

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
		return Object.keys(this.$components);
	}

	public get dependencies() {
		return [...this.$dependencies];
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
	public $injector = window.angular.injector(['ng']);

	protected $dependencies: string[] = [];
	protected $router!: NgRouter;
	protected $config!: NgAppConfig;

	protected readonly $module = window.angular.module(this.$id, this.$dependencies);
	protected readonly $components: Indexed<NgComponentOptions> = {};
	protected readonly $httpInterceptors: NgHttpInterceptor[] = [];

	private _http!: NgHttp;
	private _log!: NgLogger;
	private _modal!: NgModal;

	constructor() {
		this.configure({})
			.$module
			.config([
				'$compileProvider', '$locationProvider', '$qProvider',
				(
					$compileProvider: {
						debugInfoEnabled(active: boolean): any;
						commentDirectivesEnabled(active: boolean): any;
						cssClassDirectivesEnabled(active: boolean): any;
					},
					$locationProvider: {
						html5Mode(active: boolean): any;
					},
					$qProvider: {
						errorOnUnhandledRejections(active: boolean): any,
					},
				) => {
					const { IS_DEV, IS_STAGING } = this.$config;

					$compileProvider.debugInfoEnabled(!!(IS_DEV || IS_STAGING));
					$compileProvider.commentDirectivesEnabled(false);
					$compileProvider.cssClassDirectivesEnabled(false);

					$locationProvider.html5Mode(true);
					$qProvider.errorOnUnhandledRejections(false);
				},
			])
			.config([
				'$stateProvider',
				($stateProvider: StateProvider) => {
					if (this.router == null) {
						return this.log.$warn('No router. Use `app.setRouter(r)` to disable this warning.');
					}

					for (const definition of this.router.getRoutes()) {
						$stateProvider.state(definition);
					}
				},
			])
			.run([
				'$injector', '$animate',
				($injector: angular.auto.IInjectorService, $animate: { enabled(active: boolean): any }) => {
					this.$injector = $injector;
					$animate.enabled(true);
				},
			]);
	}

	/**
	 * Force the application to run an update cycle
	 */
	public async forceUpdate() {
		await this.$injector.get('$rootScope').$applyAsync();
	}

	public async bootstrap({ strictDi }: { strictDi?: boolean; } = { strictDi: true }) {
		for (const name of Object.keys(this.$components)) {
			this.$module.component(name, this.$components[name]);
		}
		if (this.$router == null) {
			this.$router = new (class extends NgRouter { })();
		}

		setTimeout(() => document.body.classList.add('bootstrapped'));
		return window.angular.bootstrap(document.body, [this.$id], { strictDi });
	}

	public configure(config: Partial<NgAppConfig>) {
		this.$config = new NgAppConfig(config);
		return this;
	}

	public setRouter(router: NgRouter) {
		this.$router = router;
		return this;
	}

	public addComponents(components: Indexed<NgComponentOptions>) {
		for (const name of Object.keys(components)) {
			let component = components[name];

			if (this.isInputComponent(component)) {
				component = InputService.defineInputComponent(component);
			}

			if (typeof component.controller === 'function') {
				component.controller = this.makeComponentController(component.controller);
			}

			this.$components[name] = component;
		}

		return this;
	}

	public isInputComponent(component: NgComponentOptions & { type?: 'input' })
		: component is NgInputOptions {
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
		if (this.$httpInterceptors.every(x => x != null)) {
			this.$httpInterceptors.push(interceptor);
		} else {
			for (let i = 0; i < this.$httpInterceptors.length; i++) {
				const current = this.$httpInterceptors[i];
				if (current == null) {
					this.$httpInterceptors[i] = interceptor;
					break;
				}
			}
		}
		return this;
	}

	public removeHttpInterceptor(interceptor: NgHttpInterceptor) {
		const i = this.$httpInterceptors.findIndex(x => x === interceptor);
		if (i > -1) {
			if (i === (this.$httpInterceptors.length - 1)) {
				this.$httpInterceptors.pop();
			} else {
				this.$httpInterceptors.splice(i, 1);
			}
		}
		return this;
	}

	public makeComponentController<T extends NgController>(ctrl: new () => T) {
		const componentCtrl = makeInjectableCtrl<T>(ctrl, {
			log: this.log,
			http: this.http,
			config: () => this.config,
		});

		type NonReadonly<R> = { -readonly [P in keyof R]: R[P] };
		const injectable = ['$element', '$scope', '$injector', componentCtrl] as const;
		return injectable as NonReadonly<typeof injectable>;
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
		if (typeof options.getConfig !== 'function') {
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
		return new NgLogger(this.$config.IS_PROD);
	}
}
