import { copy, equals } from 'angular';
import { app, models } from 'core';
import { NgController } from 'core/ng/controller';

interface CoreControllerOptions {
	domain: string;
	entity: string;
	keys?: string[];
	reset?: any;
}

export abstract class CoreController<T extends models.CoreModel = models.CoreModel> extends NgController {
	protected $http = app.http();
	protected $cache = app.cache();

	protected item: T;
	protected list: T[];
	protected searchList: T[];

	protected domain: string;
	protected entity: string;
	protected keys: string[];
	protected reset: any;

	constructor(options: CoreControllerOptions) {
		super();

		this.domain = options.domain;
		this.entity = options.entity;
		this.keys = options.keys || [];
		this.reset = options.reset || { Description: '' };

		this.$cache.setOnExpire(async () => await this.getList());
	}

	public async $onInit() {
		this.resetItem();
		this.$timeout();

		this.$scope.$watchCollection(
			_ => this.item,
			next => this.updateSearchList(next),
		);

		this.$scope.$watchCollection(
			_ => this.list,
			_ => this.updateSearchList(),
		);

		await this.getList();
	}

	public updateSearchList(params = this.item) {
		if (params != null || this.keys.every(k => params[k])) {
			const trueKeys = this.keys.filter(k => params[k] === true);
			this.searchList = trueKeys.reduce((x, y) =>
				x = x.filter(i => i[y] === true), [...(this.list || [])]);
		} else {
			this.searchList = copy(this.list);
		}
	}

	public async add() {
		const item = copy<T>(this.item);
		this.list.push(item);
		this.resetItem();
		try {
			const st = await this.save(item);
			if (st != null) {
				this.list[this.list.length - 1].Id = (st as any).Id;
			} else {
				throw new Error();
			}
		} catch (err) {
			this.item = this.list.pop();
			this.$log.error(`Failed to delete ${item.Description}`);
		}
	}

	public delete(item: T, searchListIndex: number) {
		this.$log.confirm(async _ => {
			const searchListRemoved = this.searchList.splice(searchListIndex, 1);
			const listIndex = this.list.findIndex(x => x.Id === item.Id);
			const listRemoved = this.list.splice(listIndex, 1);
			try {
				if (item.Id != null) {
					await this.$http.Post<T>(`${this.url}/${item.Id}`);
				}
				this.$log.success(`Deleted ${item.Description}`);
			} catch (err) {
				this.list.splice(listIndex, 0, listRemoved[0]);
				this.searchList.splice(searchListIndex, 0, searchListRemoved[0]);
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
		const list = await this.$http.Get<T[]>(this.url, []);

		if (equals(list, this.list) === false) {
			this.list = list;
			this.$cache.put(this.url, this.list);
		}

		this.$timeout();
	}

	protected get url() {
		const url = (this.domain || '') + '/' + (this.entity || '');
		return url === '/' ? null : url;
	}
}
