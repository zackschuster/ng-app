import anime from 'animejs';
import { NgService } from './service';
import { NgRenderer } from './renderer';

const TRANSLATE_X_BOUND = 500;

type LogType = '$log' | '$warn' | '$error' | '$info' | '$success';
enum LogTypeToastBackgrounds {
	$log = 'white',
	$success = 'success',
	$info = 'info',
	$warn = 'warning',
	$error = 'danger',
}

export class NgToast {
	protected type: LogType;
	protected readonly toast: HTMLDivElement;
	protected readonly toastHeader: HTMLDivElement;
	protected readonly toastBody: HTMLDivElement;
	protected readonly toastHeaderTimestamp: HTMLElement;

	constructor(protected readonly $renderer: NgRenderer, options: {
		text: string,
		type: LogType,
		container: HTMLElement,
	}) {
		this.toast = this.$renderer.createHtmlElement('div', ['toast', 'row', 'justify-content-between', 'w-100'], [['role', 'alert'], ['aria-live', 'assertive'], ['aria-atomic', 'true']]);
		this.toast.style.setProperty('cursor', 'pointer');

		this.toastBody = this.$renderer.createHtmlElement('div', ['toast-body', 'h5', 'col', 'mb-0', 'pb-3']);
		this.toastHeader = this.$renderer.createHtmlElement('div', ['toast-header']);
		this.toastHeader.style.setProperty('border-bottom', 'none');

		this.toastHeaderTimestamp = this.$renderer.createHtmlElement('strong', ['text-dark']);

		this.toastHeader.appendChild(this.toastHeaderTimestamp);
		this.toast.appendChild(this.toastHeader);
		this.toast.appendChild(this.toastBody);

		this.setBodyText(options.text);
		this.setType(options.type);

		options.container.appendChild(this.toast);
	}

	/**
	 * Append a child element to the toast element
	 *
	 * @param el The element to append
	 */
	public appendChild(el: HTMLElement) {
		this.toast.appendChild(el);
		return this;
	}

	/**
	 * Set the inner HTML of the toast's body element
	 *
	 * @param text The HTML to set
	 */
	public setBodyText(text: string) {
		this.toastBody.innerHTML = text;
	}

	/**
	 * Change the look & feel of the toast based on its associated log type
	 *
	 * @param type The log type of toast
	 */
	public setType(type: LogType) {
		if (this.type != null) {
			this.toast.classList.remove(`bg-${LogTypeToastBackgrounds[this.type]}`);
		}

		this.type = type;
		this.toast.classList.add(`bg-${LogTypeToastBackgrounds[this.type]}`);

		if (type === '$log') {
			this.toastHeader.classList.add('bg-dark');
			this.toastHeader.style.setProperty('opacity', '0.75');
			this.toastHeaderTimestamp.classList.remove('text-dark');
			this.toastHeaderTimestamp.classList.add('text-white');
		} else if (type !== '$warn') {
			this.toast.classList.add('text-white');
		}
	}

	/**
	 * Show the toast
	 *
	 * @param timeout Length in ms before toast disappears (`false` to set permanently)
	 * @param container Optional container override
	 */
	public show(timeout: false | number, container?: HTMLElement) {
		if (container != null) {
			this.remove();
			container.appendChild(this.toast);
		}

		anime({
			targets: this.toast,
			translateX: [TRANSLATE_X_BOUND, 0],
			duration: 1000,
			easing: 'easeOutQuint(0.5, 1)',
			begin: () => {
				this.toastHeaderTimestamp.innerText = new Date().toLocaleTimeString(navigator.language).replace(/(:\d{2})(?=\s[AP]M$)/, '');
				this.toast.style.setProperty('opacity', '1');
			},
		});

		return new Promise(resolve => {
			const hideAnimation = anime({
				targets: this.toast,
				translateX: [0, TRANSLATE_X_BOUND],
				duration: 1000,
				autoplay: false,
				easing: 'easeInQuint(0.5, 1)',
				complete: () => {
					this.toast.removeEventListener('click', hideAnimation.play);
					this.toast.removeEventListener('mouseover', resetAnimationOnMouseover);
					this.toast.removeEventListener('mouseout', resumeAnimationOnMouseout);
					this.remove();
					resolve();
				},
			});

			const isAutoClose = typeof timeout === 'number' && Number.isInteger(timeout);
			const makeTimeout = () => (setTimeout as typeof window['setTimeout'])(hideAnimation.play, timeout as number);

			let autoCloseId = isAutoClose ? makeTimeout() : undefined;
			let wasClosing = false;

			const resetAnimationOnMouseover = () => {
				wasClosing = hideAnimation.progress > 0;

				clearTimeout(autoCloseId);
				autoCloseId = undefined;

				hideAnimation.restart();
				hideAnimation.pause();
			};

			const resumeAnimationOnMouseout = () => {
				if (wasClosing) {
					hideAnimation.play();
				} else if (isAutoClose && autoCloseId === undefined) {
					autoCloseId = makeTimeout();
				}
			};

			this.toast.addEventListener('click', hideAnimation.play);
			this.toast.addEventListener('mouseover', resetAnimationOnMouseover);
			this.toast.addEventListener('mouseout', resumeAnimationOnMouseout);
		});
	}

	/**
	 * Hide the toast
	 */
	public hide() {
		this.toast.click();
	}

	/**
	 * Remove the toast from its container
	 */
	public remove() {
		if (this.toast.parentElement != null) {
			this.toast.parentElement.removeChild(this.toast);
		}
	}
}

// tslint:disable:no-console
export class NgConsole extends NgService {
	/**
	 * Invokes `Console.prototype.debug`
	 *
	 * @param items list of items to log
	 */
	public $debug(...items: any[]) {
		console.debug(...items);
	}

	/**
	 * Invokes `Console.prototype.error`
	 *
	 * @param items list of items to log
	 */
	public $error(...items: any[]) {
		console.error(...items);
	}

	/**
	 * Invokes `Console.prototype.info`
	 *
	 * @param items list of items to log
	 */
	public $info(...items: any[]) {
		console.info(...items);
	}

	/**
	 * Invokes `Console.prototype.warn`
	 *
	 * @param items list of items to log
	 */
	public $warn(...items: any[]) {
		console.warn(...items);
	}

	/**
	 * Invokes `Console.prototype.log`
	 *
	 * @param items list of items to log
	 */
	public $log(...items: any[]) {
		console.log(...items);
	}

	/**
	 * Invokes `Console.prototype.log`
	 *
	 * @param items list of items to log
	 */
	public $success(...items: any[]) {
		this.$log(...items);
	}
}
// tslint:enable:no-console

export class NgLogger extends NgConsole {
	protected readonly container: HTMLDivElement;
	protected readonly toasts: NgToast[] = [];

	constructor(private $renderer: NgRenderer, private readonly isProd = false) {
		super();

		this.container = this.$renderer.createHtmlElement('div', ['position-fixed']);
		this.container.style.setProperty('top', '0.5rem');
		this.container.style.setProperty('right', '-1.5rem');
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
	 *
	 * @param msg Confirmation message
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

		const toast = new NgToast(this.$renderer, { text, type, container: this.container });
		toast.show(timeout).then(() => {
			const index = this.toasts.findIndex(x => Object.is(x, toast));
			this.toasts.splice(index, 1);
		});

		this.toasts.push(toast);
		return toast;
	}
}
