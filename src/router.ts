import { Indexed } from '@ledge/types';
import { ParamType, StateDeclaration, StateService, TargetState, Transition } from '@uirouter/core';

import { NgService } from './service';

export abstract class NgRouter<T extends NgRoute = NgRoute> extends NgService {
	public routes: T[] = [];

	public getRoutes() {
		return this.routes;
	}

	public registerRoute(partial: Partial<T>) {
		const { name, parent, url } = this.generateRouteMeta(partial);

		const state = Object.assign({
			name,
			parent,
			url,
		}, partial);

		this.routes.push(state as T);

		return state as T;
	}

	public async isAuthorized() {
		return true;
	}

	public generateIntIdParam() {
		const param = {
			type: new ParamType({
				decode(value) {
					return parseInt(value, 10);
				},
				encode(value) {
					return value && value.toString();
				},
				equals(a, b) {
					return this.is(a) && a === b;
				},
				is(value) {
					return Number.isInteger(this.decode(value));
				},
			}),
		};

		param.type.name = 'path';
		return param;
	}

	public generateIntQueryParam() {
		const param = {
			type: new ParamType({
				decode(value) {
					return parseInt(value, 10);
				},
				encode(value) {
					return value && value.toString();
				},
				equals(a, b) {
					return this.is(a) && a === b;
				},
				is(value) {
					return Number.isInteger(this.decode(value));
				},
			}),
		};

		param.type.name = 'query';
		return param;
	}

	protected annotateResolveFunctions({ resolve = { } }: NgRoute) {
		for (const [ id, resolveFn ] of Object.entries(resolve)) {
			if (typeof resolveFn !== 'function') {
				throw new Error('resolve methods must be a function');
			}
			resolve[id] = ['$transition$', resolveFn];
		}

		return resolve;
	}

	protected generateRouteMeta(
		{
			params = { },
			data = { },
			name = '',
			component = '',
			parent = '',
		}: Partial<T>,
	) {
		name = (name || component);

		let url = `/${data.isBase ? name : name.split(/(?=[A-Z])/).join('/').toLowerCase()}`
			.replace(/View$/, '');

		for (const [key, { type = { } }] of Object.entries<any>(params)) {
			url += type.name === 'path' ? '/:' : (url.includes('?') ? '&' : '?');
			url += key;
		}

		return { name, parent, url };
	}
}

/**
 * @internalapi
 * an intermediate interface.
 *
 * Used to reset typings to `any` so the NgRoute interface can then narrow them
 */
// tslint:disable-next-line:class-name
interface _NgStateService extends StateService {
	current: any;
}

export interface NgStateService extends _NgStateService {
	current: NgRoute;
	label: string;
	parent: string;
}

/**
 * @internalapi
 * an intermediate interface.
 *
 * Used to reset typings to `any` so the NgRoute interface can then narrow them
 */
// tslint:disable-next-line:class-name
interface _NgRoute extends StateDeclaration {
	onExit?: any;
	onRetain?: any;
	onEnter?: any;
	views?: any;
	resolve?: any;
}

export type NgResolveFn<T = any> = ($trans: Transition) => Promise<T>;
export type NgAnnotatedResolveFn<T = any> = [string, NgResolveFn<T>];
export type NgTransition = NgResolveFn<TargetState | Transition> | NgAnnotatedResolveFn<TargetState | Transition>;

export interface NgRoute extends _NgRoute {
	/**
	 * The name of the component to use for this view.
	 */
	component?: string;

	/**
	 * An object which maps `resolve`s to component `bindings`.
	 *
	 * When using a component declaration (`component: 'myComponent'`),
	 * each input binding for the component is supplied data from a resolve of
	 * the same name, by default.
	 *
	 * You may supply data from a different resolve name by mapping it here.
	 */
	bindings?: {
		[key: string]: string;
	};

	resolve?: Indexed<NgResolveFn | NgAnnotatedResolveFn | undefined>;

	/**
	 * Injected function which returns the HTML template.
	 * The template will be used to render the corresponding component.
	 *
	 * #### Examples:
	 * ```ts
	 * {
	 * 	// other props
	 * 	template: require('./template.pug');
	 * }
	 * ```
	 * ```ts
	 * {
	 * 	// other props
	 * 	template: '<div>Hello, world!</div>';
	 * }
	 * ```
	 */
	template?: string | ((...args: any[]) => void);

	url: string;
	parent: string;
	label: string;

	onEnter?: NgTransition;
	onExit?: NgTransition;
	onRetain?: NgTransition;
}
