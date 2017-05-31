import { Callback, IConfig, Indexed } from '@ledge/types';
import { Cache, CacheOptions } from 'cachefactory';

export interface IApp {
	name: string;
	config: IConfig;
	cache(options?: CacheOptions): Cache;
	http(): IDataService;
	logger(): ILogger;
}

export interface ICoreModel extends Indexed {
	Id?: number;
	Description: string;
}

export interface IDataService {
	Get<T = any>(url: string, defaultReturn?: T): PromiseLike<T>;
	Post<T = any>(url: string, data?: T): PromiseLike<T>;
}

export interface ILogger {
	confirm(action: Callback): void;
	error(msg: string): void;
	info(msg: string): void;
	success(msg: string): void;
	warning(msg: string): void;
	devWarning(msg: string): void;
}
