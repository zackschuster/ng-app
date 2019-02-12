import Noty from 'noty';
import { NgService } from './base';

export enum LogTypeMap {
	warning = 'warn',
	success = 'log',
	information = 'info',
	info = 'info',
	error = 'error',
	alert = 'error',
}

type Type = Noty.Type;
type Button = Noty.Button;

export class NgLogger extends NgService {
	constructor(private $log: angular.ILogService, private isProd = false) {
		super();
	}

	/**
	 * Clear all active notifications
	 */
	public clear() {
		Noty.closeAll();
	}

	/**
	 * Prompt the user to confirm intent for a previous action
	 */
	public confirm(action: (...args: any[]) => any, msg = 'Please confirm your action') {
		const text = '<p class="h5 mb-0 ml-0">\
		<i class="fa fa-exclamation-triangle text-warning mr-1"></i>' + msg + '</p>';

		const noty = this.notify(text, 'alert', false, [
			Noty.button('No', 'btn btn-outline-danger mb-2 pull-right', () => noty.close()),
			Noty.button('Yes', 'btn btn-outline-success mr-1 pull-right', () => {
				action();
				noty.close();
			}),
		]);
	}

	/**
	 * Display an error notification
	 *
	 * @param text Display text
	 * @param isTemporary Whether the notification should disappear automatically (false by default)
	 */
	public error(text: string, isTemporary = false) {
		this.notify(text, 'error', isTemporary && undefined);
	}

	/**
	 * Display an informational notification
	 *
	 * @param text Display text
	 * @param isTemporary Whether the notification should disappear automatically (true by default)
	 */
	public info(text: string, isTemporary = true) {
		this.notify(text, 'info', isTemporary && undefined);
	}

	/**
	 * Display a success notification
	 *
	 * @param text Display text
	 * @param isTemporary Whether the notification should disappear automatically (true by default)
	 */
	public success(text: string, isTemporary = true) {
		this.notify(text, 'success', isTemporary && undefined);
	}

	/**
	 * Display a warning notification
	 *
	 * @param text Display text
	 * @param isTemporary Whether the notification should disappear automatically (true by default)
	 */
	public warning(text: string, isTemporary = true) {
		this.notify(text, 'warning', isTemporary && undefined);
	}

	/**
	 * Display a warning notification (disabled when `process.env.NODE_ENV === 'production'`)
	 *
	 * @param text Display text
	 */
	public devWarning(text: string) {
		if (this.isProd === false) {
			this.warning(`[DEV] ${text}`, false);
		}
	}

	/**
	 * Show a customizable notification to the user
	 *
	 * @param text Display text
	 * @param type Display type
	 * @param timeout Length in ms before notification disappears (`false` to set permanently)
	 * @param buttons Interaction points for the user
	 */
	public notify(text: string, type: Type, timeout: false | number = 1000, buttons: Button[] = []) {
		const logType = LogTypeMap[type];
		this.$log[logType](`${type}: ${text}`);

		const noty = new Noty({
			type,
			text,
			theme: 'metroui',
			progressBar: false,
			timeout,
			buttons,
			closeWith: ['click'],
		});

		noty.show();

		return noty;
	}
}
