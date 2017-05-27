import { copy } from 'angular';
import { Indexed } from '@ledge/types';
import { ICoreModel, app } from 'core';

interface CoreControllerOptions {
	domain: string;
	entity: string;
	keys?: string[];
	reset?: any;
}

export abstract class CoreController<T extends ICoreModel> {
	protected $cache = app.cache();
	protected $http = app.http();
	protected $log = app.logger();
	protected $scope = app.scope();
	protected $timeout = app.timeout();

	protected item: T;
	protected list: T[];

	protected domain: string;
	protected entity: string;
	protected keys: string[];
	protected reset: any;

	constructor(options: CoreControllerOptions) {
		this.domain = options.domain;
		this.entity = options.entity;
		this.keys = options.keys || [];
		this.reset = options.reset || { Description: '' };
	}

	public async $onInit() {
		this.resetItem();
		await this.getList();
		this.$timeout();
	}

	public search(params: Indexed) {
		if (params == null || this.keys.every(k => !params[k])) {
			return this.list;
		}

		const trueKeys = this.keys.filter(k => params[k] === true);

		const set = trueKeys.reduce((x, y) =>
			x = x.filter(i => i[y] === true), [...this.list]);

		return set;
	}

	public async add() {
		const item = copy<T>(this.item);
		this.list.push(item);
		this.resetItem();
		try {
			const st = await this.save(item);
			if (st != null) {
				this.list.pop();
				this.list.push(st as T);
			} else {
				throw new Error();
			}
		} catch (err) {
			this.item = this.list.pop();
			this.$log.error(`Failed to delete ${item.Description}`);
		} finally {
			this.$timeout();
		}
	}

	public delete(item: T, index: number) {
		this.$log.confirm(async _ => {
			const original = copy<T[]>(this.list);
			this.list.splice(index, 1);
			try {
				if (item.Id) {
					await this.$http.Post<T>(`${this.url}/${item.Id}`);
					this.$log.success(`Deleted ${item.Description}`);
				}
			} catch (err) {
				this.list = original;
			} finally {
				this.$timeout();
			}
		});
	}

	public async save(item: T) {
		// tslint:disable-next-line:curly
		if (!item || !item.Description) return;

		try {
			const rsp = await this.$http.Post<T>(this.url, item);
			this.$log.success('Saved');
			return rsp;
		} catch (err) {
			return this.$log.devWarning(err);
		}
	}

	protected resetItem() {
		this.item = copy<T>(this.reset);
	}

	protected async getList() {
		this.list = this.$cache.get(this.url);
		if (this.list == null) {
			this.list = await this.$http.Get<T[]>(this.url, []);
			this.$cache.put(this.url, this.list);
		}
	}

	protected get url() {
		return this.domain + '/' + this.entity;
	}
}
