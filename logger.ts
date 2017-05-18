import Noty, { NotyType } from 'noty';
import { ILogCall, ILogService } from 'angular';
import { config } from 'app/core/config';
import { Callback, Indexed } from '@ledge/types';

export class Logger {
	public log: ILogCall;
	private noty: Noty;
	private typeMap: Indexed<string> = {
		warning: 'warn',
		success: 'log',
		info: 'info',
		error: 'error',
	};

	/* @ngInject */
	constructor(private $log: ILogService) {
		this.log = this.$log.log;
		this.noty = new Noty({ theme: 'metroui', timeout: 1000, closeWith: ['click'] });
	}

	public error(msg: string) {
		this.showNotification(msg, 'error');
	}

	public info(msg: string) {
		this.showNotification(msg, 'info');
	}

	public success(msg: string) {
		this.showNotification(msg, 'success');
	}

	public warning(msg: string) {
		this.showNotification(msg, 'warning');
	}

	public devWarning(msg: string) {
		// tslint:disable-next-line:curly
		if (config.ENV === 'production') return;

		this.warning(`[DEV] ${msg}`);
	}

	private showNotification(text: string, type: NotyType) {
		new Noty({ type, text, theme: 'metroui', timeout: 1000, closeWith: ['click'] }).show();

		const logType = this.typeMap[type];
		(this.$log as ILogService & Indexed<Callback>)[logType](`${type}: ${text}`);
	}
}
