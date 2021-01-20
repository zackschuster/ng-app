import { Indexed } from '@ledge/types';
import { StateService } from '@uirouter/core';
import { StateProvider } from '@uirouter/angularjs';

import { NgController, makeInjectableCtrl } from './controller';
import { DEFAULT_REQUEST_TIMEOUT, NgHttp, NgHttpOptions } from './http';
import { InputService, NgInputOptions, addSelectListStylesheet } from './inputs';
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
		return this.$dependencies.slice();
	}

	public get state() {
		return this.$injector.get<StateService>('$state');
	}

	public get http() {
		return this._http ??= this.makeHttpService({
			host: () => this.config.API_HOST,
			timeout: () => (this.$config.IS_PROD ? DEFAULT_REQUEST_TIMEOUT : undefined),
		});
	}

	public get log() {
		return this._log ??= this.makeLogger();
	}

	public get modal() {
		return this._modal ??= this.makeModal();
	}

	public readonly $id = '$core';
	public readonly $injector = window.angular.injector(['ng']);

	protected $dependencies: string[] = [];
	protected $router!: NgRouter;
	protected $config!: NgAppConfig;

	protected readonly $module = window.angular.module(this.$id, this.$dependencies);
	protected readonly $components: Indexed<NgComponentOptions> = {};
	protected readonly $httpInterceptors: angular.IHttpInterceptor[] = [];

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
			.config([
				'$httpProvider',
				($httpProvider: angular.IHttpProvider) => {
					for (const interceptor of this.$httpInterceptors) {
						$httpProvider.interceptors.push(() => interceptor);
					}
				},
			])
			.run([
				'$injector', '$animate',
				($injector: angular.auto.IInjectorService, $animate: { enabled(active: boolean): any }) => {
					// @ts-expect-error cheating
					this.$injector = $injector;
					$animate.enabled(true);
				},
			]);
	}

	/**
	 * Force the application to run an update cycle
	 */
	public forceUpdate() {
		return this.$injector.get('$rootScope').$applyAsync();
	}

	public bootstrap({ strictDi }: { strictDi?: boolean; } = { strictDi: true }) {
		if (window.Promise == null) {
			window.Promise = this.$injector.get('$q') as never as typeof Promise;
		}

		for (const name of Object.keys(this.$components)) {
			this.$module.component(name, this.$components[name]);
		}
		if (this.$router == null) {
			this.$router = new (class extends NgRouter { })();
		}

		return new Promise((resolve, reject) => {
			try {
				addSelectListStylesheet();
				setTimeout(() => document.body.classList.add('bootstrapped'));
				resolve(window.angular.bootstrap(document.body, [this.$id], { strictDi }));
			} catch (err) {
				reject(err);
			}
		});
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

	public addHttpInterceptor(interceptor: angular.IHttpInterceptor) {
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

	public removeHttpInterceptor(interceptor: angular.IHttpInterceptor) {
		const i = this.$httpInterceptors.indexOf(interceptor);
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

	public makeHttpService(options: NgHttpOptions) {
		function getRootScope(this: NgApp) {
			return this.$injector.get('$rootScope');
		}
		return new NgHttp(this.$injector.get('$http'), getRootScope.bind(this), options);
	}

	public makeLogger(isProd = this.$config.IS_PROD) {
		return new NgLogger(isProd);
	}

	public makeModal() {
		return new NgModal(
			this.log,
			this.http,
			this.config,
			this.$injector,
		);
	}
}
