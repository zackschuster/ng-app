import { ILogCall, ILogService } from 'angular';
import Noty, { NotyType } from 'noty';
import { Callback, Indexed } from '@ledge/types';
import { config } from '../../index';
import { Logger } from '../../types';

export class NgLogger implements Logger {
	public log: ILogCall;
	private typeMap: Indexed<string> = {
		warning: 'warn',
		success: 'log',
		info: 'info',
		error: 'error',
	};

	/* @ngInject */
	constructor(private $log: ILogService) {
		this.log = this.$log.log;
	}

	public confirm(action: Callback) {
		const n = new Noty({
			type: 'alert',
			theme: 'metroui',
			text: 'Do you want to continue?',
			buttons: [
				Noty.button('Yes', 'btn btn-success', (_: any) => {
					action();
					n.close();
				}),
				Noty.button('No', 'btn btn-danger', (_: any) => n.close()),
			],
		});

		n.show();
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
		this.showNotification(msg, 'warning', false);
	}

	public devWarning(msg: string) {
		// tslint:disable-next-line:curly
		if (config.ENV === 'production') return;

		this.warning(`[DEV] ${msg}`);
	}

	private showNotification(text: string, type: NotyType, timeout: false | number = 1000) {
		new Noty({ type, text, theme: 'metroui', progressBar: false, timeout, closeWith: ['click'] }).show();

		const logType = this.typeMap[type];
		(this.$log as ILogService & Indexed<Callback>)[logType](`${type}: ${text}`);
	}
}
