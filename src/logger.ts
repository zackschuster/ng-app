import * as Noty from 'noty';
import { Callback, Indexed } from '@ledge/types';

export class NgLogger {
	public log: angular.ILogCall;
	private typeMap: {
		warning: 'warn',
		success: 'log',
		information: 'info',
		info: 'info',
		error: 'error',
		alert: 'error',
	} = {
		warning: 'warn',
		success: 'log',
		information: 'info',
		info: 'info',
		error: 'error',
		alert: 'error',
	};

	constructor(private $log: angular.ILogService, private isProd = false) {
		this.log = this.$log.log;
	}

	public clear() {
		Noty.closeAll();
	}

	public confirm(action: Callback, msg = 'Please confirm your action') {
		const n = new Noty({
			type: 'alert',
			theme: 'metroui',
			text: '<p class="h5 mb-0 ml-0">\
			<i class="fa fa-exclamation-triangle text-warning mr-1"></i>' + msg + '</p>',
			buttons: [
				Noty.button('No', 'btn btn-outline-danger mb-2 pull-right', (_: any) => n.close()),
				Noty.button('Yes', 'btn btn-outline-success mr-1 pull-right', (_: any) => {
					action();
					n.close();
				}),
			],
		});

		n.show();
	}

	public error(msg: string, isTemporary = false) {
		this.showNotification(msg, 'error', isTemporary && undefined);
	}

	public info(msg: string, isTemporary = true) {
		this.showNotification(msg, 'info', isTemporary && undefined);
	}

	public success(msg: string, isTemporary = true) {
		this.showNotification(msg, 'success', isTemporary && undefined);
	}

	public warning(msg: string, isTemporary = true) {
		this.showNotification(msg, 'warning', isTemporary && undefined);
	}

	public devWarning(msg: string) {
		if (this.isProd === false) {
			this.warning(`[DEV] ${msg}`, false);
		}
	}

	private showNotification(text: string, type: Noty.Type, timeout: false | number = 1000) {
		new Noty({ type, text, theme: 'metroui', progressBar: false, timeout, closeWith: ['click'] }).show();

		const logType = this.typeMap[type];
		(this.$log as angular.ILogService & Indexed<Callback>)[logType](`${type}: ${text}`);
	}
}
