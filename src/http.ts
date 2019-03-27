import { PatchPayload } from '@ledge/types/patch';
import { NgService } from './service';
import { NgAppConfig } from './options';

export interface NgHttpInterceptor {
	request?(config: Request): Request | Promise<Request>;
	response?(response: any): any;
	responseError?<T extends Error>(response: Response, err: T): void;
}

// tslint:disable:no-redundant-jsdoc
export interface NgHttpOptions extends RequestInit {
	/**
	 *
	 * @default `location.host`
	 */
	host?: string;

	/**
	 * If true, use `https://`. Otherwise, use `http://`
	 * @default false
	 */
	ssl?: boolean;

	/**
	 * How many milliseconds to wait before aborting the request
	 * @default 10000
	 */
	timeout?: number;

	interceptors?: NgHttpInterceptor[];

	/**
	 * Unsupported
	 */
	referrer?: never;

	/**
	 * Unsupported
	 */
	signal?: never;

	onFinally?(): void;
	getConfig(): NgAppConfig;
}
// tslint:enable:no-redundant-jsdoc

export class NgHttp extends NgService {
	private interceptors: {
		request: ((config: Request) => Request | Promise<Request>)[];
		response: ((response: any) => any)[];
		responseError: (<T extends Error>(
			response: Response,
			err: T,
		) => void)[];
	};

	constructor(private options: NgHttpOptions) {
		super();
		const { interceptors = [] } = options;
		this.interceptors = {
			request: interceptors
				.map(x => x.request)
				.filter(x => typeof x === 'function') as ((
				config: Request,
			) => Request | Promise<Request>)[],
			response: interceptors
				.map(x => x.response)
				.filter(x => typeof x === 'function') as ((response: any) => any)[],
			responseError: interceptors
				.map(x => x.responseError)
				.filter(x => typeof x === 'function') as (<T extends Error>(
				response: Response,
				err: T,
			) => void)[],
		};
	}

	public async Get<T = any>(url: string) {
		return this.fetch<T>(url, 'GET');
	}

	public async Post<T = any>(url: string, data: any = null) {
		return this.fetch<T>(url, 'POST', data);
	}

	public async Patch<T = any>(url: string, data: PatchPayload) {
		return this.fetch<T>(url, 'PATCH', data);
	}

	public async Put<T = any>(url: string, data: T) {
		return this.fetch(url, 'PUT', data);
	}

	public async Delete<T = any>(url: string) {
		return this.fetch<T>(url, 'DELETE');
	}

	public async Jsonp<T = any>(url: string) {
		return this.fetch<T>(url, 'JSONP');
	}

	public getFullUrl(uri: string, host: string, ssl: boolean) {
		return new URL(uri, `http${ssl ? 's' : ''}://${host}`).toJSON();
	}

	private async fetch<T>(
		uri: string,
		method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE' | 'JSONP',
		data?: any,
	) {
		let response = new Response();
		try {
			const {
				host = this.options.getConfig().API_HOST,
				ssl = location.protocol === 'https:',
				cache = 'no-store',
				credentials = 'include',
				headers,
				integrity,
				keepalive = false,
				mode = 'cors',
				redirect = 'manual',
				referrerPolicy = 'origin-when-cross-origin',
				timeout = 10000,
				window,
			} = this.options;

			const url = this.getFullUrl(uri, host, ssl);
			const abortCtrl = new AbortController();

			let request = new Request(url, {
				method,
				cache,
				credentials,
				headers,
				integrity,
				keepalive,
				mode,
				redirect,
				referrerPolicy,
				signal: abortCtrl.signal,
				window,
				body: JSON.stringify(data),
			});

			for (const onRequest of this.interceptors.request) {
				request = await onRequest(request);
			}

			const abortTimer = setTimeout(abortCtrl.abort, timeout);
			response = await fetch(request);
			clearTimeout(abortTimer);

			if (response.ok) {
				let value: T = await response.json();
				for (const onResponse of this.interceptors.response) {
					value = await onResponse(value);
				}
				return value;
			}

			throw new Error();
		} catch (err) {
			for (const onResponseError of this.interceptors.responseError) {
				await onResponseError(response.clone(), err);
			}
			throw err;
		} finally {
			if (typeof this.options.onFinally === 'function') {
				this.options.onFinally();
			}
		}
	}
}
