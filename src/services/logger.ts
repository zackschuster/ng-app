import { autobind } from 'core-decorators';
import { NgService } from './base';
import { NgRenderer } from './renderer';

type LogType = '$log' | '$warn' | '$error' | '$info' | '$success';
enum LogTypeToastBackgrounds {
	$log = 'white',
	$success = 'success',
	$info = 'info',
	$warn = 'warning',
	$error = 'danger',
}

export class NgToast {
	protected type: Parameters<NgLogger['notify']>[1];
	protected readonly toast: HTMLDivElement;
	protected readonly toastHeader: HTMLDivElement;
	protected readonly toastBody: HTMLDivElement;
	protected readonly toastHeaderTimestamp: HTMLElement;

	constructor(protected readonly $renderer: NgRenderer) {
		this.toast = this.$renderer.createHtmlElement('div', ['toast', 'animated', 'row', 'justify-content-between', 'w-100'], [['role', 'alert'], ['aria-live', 'assertive'], ['aria-atomic', 'true']]);
		this.toast.style.setProperty('cursor', 'pointer');
		this.toast.style.setProperty('transition', 'opacity 500ms');
		this.toast.style.setProperty('opacity', '0');

		this.toastBody = this.$renderer.createHtmlElement('div', ['toast-body', 'h5', 'col', 'mb-0', 'pb-3']);
		this.toastHeader = this.$renderer.createHtmlElement('div', ['toast-header']);
		this.toastHeader.style.setProperty('border-bottom', 'none');

		this.toastHeaderTimestamp = this.$renderer.createHtmlElement('strong', ['text-dark']);

		this.toastHeader.appendChild(this.toastHeaderTimestamp);
		this.toast.appendChild(this.toastHeader);
		this.toast.appendChild(this.toastBody);
	}
	public appendChild(el: HTMLElement) {
		this.toast.appendChild(el);
		return this;
	}

	public onHide(cb: () => void) {
		cb();
		return this;
	}

	public setBodyText(text: string) {
		this.toastBody.innerHTML = text;
	}

	public setType(type: Parameters<NgLogger['notify']>[1]) {
		if (this.type != null) {
			this.toast.classList.remove(`bg-${LogTypeToastBackgrounds[this.type]}`);
		}
		this.type = type;
		this.toast.classList.add(`bg-${LogTypeToastBackgrounds[this.type]}`);
		if (type === '$log') {
			this.toastHeader.classList.add('bg-info');
			this.toastHeaderTimestamp.classList.remove('text-dark');
			this.toastHeaderTimestamp.classList.add('text-white');
		} else if (type !== '$warn') {
			this.toast.classList.add('text-white');
		}
	}

	public show(container: HTMLElement) {
		this.toastHeaderTimestamp.innerText = new Date().toLocaleTimeString(navigator.language).replace(/(:\d{2})(?=\s[AP]M$)/, '');
		container.appendChild(this.toast);
		this.toast.addEventListener('click', this.hide);
		setTimeout(() => this.toast.style.setProperty('opacity', '1'), 23);
	}

	@autobind
	public hide() {
		this.toast.removeEventListener('click', this.hide);
		this.toast.style.setProperty('opacity', '0');
		setTimeout(() => this.toast.remove(), 500);
	}
}

export class NgConsole extends NgService {
	// tslint:disable:no-console
	public $debug(...items: any[]) {
		console.debug(...items);
	}
	public $error(...items: any[]) {
		console.error(...items);
	}
	public $info(...items: any[]) {
		console.info(...items);
	}
	public $warn(...items: any[]) {
		console.warn(...items);
	}
	public $log(...items: any[]) {
		console.log(...items);
	}
	public $success(...items: any[]) {
		this.$log(...items);
	}
	// tslint:enable:no-console
}

export class NgLogger extends NgConsole {
	protected readonly container: HTMLDivElement;
	protected readonly toasts: NgToast[] = [];

	constructor(private $renderer: NgRenderer, private isProd = false) {
		super();

		this.container = this.$renderer.createHtmlElement('div', ['position-fixed', 'd-block', 'p-2']);
		this.container.style.setProperty('top', '0.1rem');
		this.container.style.setProperty('right', '-1rem');
		this.container.style.setProperty('width', '100%');
		this.container.style.setProperty('max-width', '23rem');

		document.body.appendChild(this.container);
	}

	/**
	 * Clear all active notifications
	 */
	public clear() {
		this.toasts.forEach(x => x.hide());
	}

	/**
	 * Prompt the user to confirm intent for a previous action
	 */
	public confirm(msg = 'Please confirm your action') {
		const okBtn = this.$renderer.createHtmlElement('button', ['btn', 'w-50', 'btn-success', 'rounded-0']);
		okBtn.innerText = 'Yes';
		const cancelBtn = this.$renderer.createHtmlElement('button', ['btn', 'w-50', 'btn-dark', 'rounded-0']);
		cancelBtn.innerText = 'No';

		const footer = this.$renderer.createHtmlElement('div', ['w-100']);
		footer.appendChild(cancelBtn);
		footer.appendChild(okBtn);

		const toast = this.notify(msg, '$log', false);
		toast.appendChild(footer);

		return new Promise((resolve, reject) => {
			const removeListeners = () => {
				okBtn.removeEventListener('click', ok);
				cancelBtn.removeEventListener('click', cancel);
			};

			const ok = () => {
				toast.hide();
				removeListeners();
				resolve();
			};

			const cancel = () => {
				toast.hide();
				removeListeners();
				reject();
			};

			okBtn.addEventListener('click', ok);
			cancelBtn.addEventListener('click', cancel);
		});
	}

	/**
	 * Display an error notification
	 *
	 * @param text Display text
	 * @param isTemporary Whether the notification should disappear automatically (false by default)
	 */
	public error(text: string, isTemporary = false) {
		this.notify(text, '$error', isTemporary && undefined);
	}

	/**
	 * Display an informational notification
	 *
	 * @param text Display text
	 * @param isTemporary Whether the notification should disappear automatically (true by default)
	 */
	public info(text: string, isTemporary = true) {
		this.notify(text, '$info', isTemporary && undefined);
	}

	/**
	 * Display a success notification
	 *
	 * @param text Display text
	 * @param isTemporary Whether the notification should disappear automatically (true by default)
	 */
	public success(text: string, isTemporary = true) {
		this.notify(text, '$success', isTemporary && undefined);
	}

	/**
	 * Display a warning notification
	 *
	 * @param text Display text
	 * @param isTemporary Whether the notification should disappear automatically (true by default)
	 */
	public warning(text: string, isTemporary = true) {
		this.notify(text, '$warn', isTemporary && undefined);
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
	public notify(text: string, type: LogType, timeout: false | number = 2323) {
		this[type](`${type}: ${text}`);

		const toast = new NgToast(this.$renderer);
		toast.setBodyText(text);
		toast.setType(type);
		toast.show(this.container);
		toast.onHide(() => {
			const index = this.toasts.findIndex(x => Object.is(x, toast));
			this.toasts.splice(index, 1);
		});

		this.toasts.push(toast);

		if (typeof timeout === 'number') {
			setTimeout(toast.hide, timeout);
		}

		return toast;
	}
}
