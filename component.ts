import { ITimeoutService, copy } from 'angular';
import { Indexed } from '@ledge/types';

interface BaseControllerOptions {
	keys: string[];
	reset: any;
	timeout: ITimeoutService;
	service: any;
	listFn: string;
}

export abstract class BaseController<T extends Indexed> {
	protected listFn: string;
	protected service: any;
	protected $timeout: ITimeoutService;
	protected list: T[];
	protected item: T;
	protected reset: any;
	protected keys: string[];

	constructor(options: BaseControllerOptions) {
		this.keys = options.keys || [];
		this.reset = options.reset;
		this.service = options.service;
		this.listFn = options.listFn;
		this.$timeout = options.timeout;

		this.resetItem();
	}

	public async $onInit() {
		this.list = await this.service[this.listFn]();
		this.$timeout();
	}

	public resetItem() {
		this.item = copy(this.reset);
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
		const item = copy(this.item);
		this.list.push(item);
		this.reset();
		try {
			const st = await this.save(item);
			if (st != null) {
				this.list.pop();
				this.list.push(st as T);
			}
		} catch (err) {
			this.item = this.list.pop();
		} finally {
			this.$timeout();
		}
	}

	public abstract delete(item: T, id: number): void;

	public abstract save(item: T): PromiseLike<T>;
}
