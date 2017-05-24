import { ITimeoutService, copy } from 'angular';
import { Indexed } from '@ledge/types';
import { DataService } from 'core/data/service';
import { Logger } from 'core/logger';
import { ICoreModel } from 'core/interfaces';

interface CoreControllerOptions {
	$timeout: ITimeoutService;
	dataService: DataService;
	logger: Logger;
	keys: string[];
	reset: any;
	domain: string;
	entity: string;
}

export abstract class CoreController<T extends ICoreModel> {
	protected $timeout: ITimeoutService;
	protected dataService: DataService;
	protected logger: Logger;

	protected list: T[];
	protected item: T;

	protected reset: any;
	protected keys: string[];

	protected domain: string;
	protected entity: string;
	protected url: string;

	constructor(options: CoreControllerOptions) {
		Object.assign(this, options);

		this.url = this.domain + '/' + this.entity;
	}

	public async $onInit() {
		this.resetItem();
		this.getList();
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
			this.logger.error(`Failed to delete ${item.Description}`);
		} finally {
			this.$timeout();
		}
	}

	public delete(item: T, index: number) {
		this.logger.confirm(async _ => {
			const original = copy<T[]>(this.list);
			this.list.splice(index, 1);
			try {
				if (item.Id) {
					await this.dataService.Post<T>(`${this.url}/${item.Id}`);
					this.logger.success(`Deleted ${item.Description}`);
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
			const rsp = await this.dataService.Post<T>(this.url, item);
			this.logger.success('Saved');
			return rsp;
		} catch (err) {
			return this.logger.devWarning(err);
		}
	}

	protected resetItem() {
		this.item = copy<T>(this.reset);
		this.$timeout();
	}

	protected async getList() {
		this.list = await this.dataService.Get<T[]>(this.url, []);
		this.$timeout();
	}
}
