import Noty from 'noty';
import { ILogCall, ILogService } from 'angular';
import { config } from 'app/core/config';

export class Logger {
	public log: ILogCall;
	private noty: Noty;

	/* @ngInject */
	constructor(private $log: ILogService) {
		this.log = this.$log.log;
		this.noty = new Noty({ theme: 'metroui' });
	}

	public error(msg: string) {
		this.noty.setText(msg);
		this.noty.setType('error');
		this.noty.show();

		this.$log.error(`error: ${msg}`);
	}

	public info(msg: string) {
		this.noty.setText(msg);
		this.noty.setType('info');
		this.noty.show();

		this.$log.info(`info: ${msg}`);
	}

	public success(msg: string) {
		this.noty.setText(msg);
		this.noty.setType('success');
		this.noty.show();

		this.$log.info(`success: ${msg}`);
	}

	public warning(msg: string) {
		this.noty.setText(msg);
		this.noty.setType('warning');
		this.noty.show();

		this.$log.warn(`warn: ${msg}`);
	}

	public devWarning(msg: string) {
		// tslint:disable-next-line:curly
		if (config.ENV === 'production') return;

		this.warning(`[DEV] ${msg}`);
	}
}
