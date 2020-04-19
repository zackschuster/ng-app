import { NgController, makeInjectableCtrl } from './controller';
import { NgLogger } from './logger';
import { NgService } from './service';
import { NgHttp } from './http';
import { NgAppConfig } from './options';
import { NgRenderer } from './renderer';
import { NgInjector, NgScope } from './ng';

const MODAL_SHOW_DELAY = 23;
const MODAL_HIDE_DELAY = 150;

export class NgModal extends NgService {
	protected readonly $backdrop: HTMLDivElement;
	protected readonly $container: HTMLDivElement;
	protected readonly $dialog: HTMLDivElement;
	protected readonly $form: HTMLFormElement;
	protected readonly $header: HTMLElement;
	protected readonly $title: HTMLHeadingElement;
	protected readonly $main: HTMLElement;
	protected readonly $footer: HTMLElement;
	protected readonly $cancelBtn: HTMLButtonElement;
	protected readonly $submitBtn: HTMLInputElement;

	protected readonly $compile: (element: Element) => (scope: NgScope) => { [i: number]: HTMLElement };
	protected readonly $rootScope: NgScope;

	constructor(
		protected readonly $renderer: NgRenderer,
		protected readonly $log: NgLogger,
		protected readonly $http: NgHttp,
		protected readonly $config: NgAppConfig,
		protected readonly $injector: NgInjector,
	) {
		super();

		this.$compile = this.$injector.get('$compile');
		this.$rootScope = this.$injector.get('$rootScope');

		this.$backdrop = this.$renderer.createHtmlElement('div', ['modal-backdrop', 'fade']);
		this.$dialog = this.$renderer.createHtmlElement('div', ['modal-dialog'], [['role', 'dialog']]);
		this.$form = this.$renderer.createHtmlElement('form', ['modal-content'], [['role', 'document']]);
		this.$header = this.$renderer.createHtmlElement('header', ['modal-header']);
		this.$title = this.$renderer.createHtmlElement('h5', ['modal-title'], [['id', `modal-title-${this.uniqueId}`]]);
		this.$main = this.$renderer.createHtmlElement('main', ['modal-body']);
		this.$footer = this.$renderer.createHtmlElement('footer', ['modal-footer']);
		this.$cancelBtn = this.$renderer.createHtmlElement('button', ['btn', 'btn-info'], [['type', 'button']]);
		this.$submitBtn = this.$renderer.createHtmlElement('input', ['btn', 'btn-success'], [['type', 'submit']]);

		this.$title.id = `modal-title-${this.uniqueId}`;
		this.$cancelBtn.innerText = 'Cancel';

		this.$container = this.$renderer.createHtmlElement('div', ['fade', 'modal'], [
			['aria-labelledby', this.$title.id],
			['aria-live', 'polite'],
			['aria-modal', 'true'],
			['role', 'dialog'],
		]);

		this.$header.appendChild(this.$title);
		this.$footer.appendChild(this.$cancelBtn);
		this.$footer.appendChild(this.$submitBtn);
		this.$form.appendChild(this.$header);
		this.$form.appendChild(this.$main);
		this.$form.appendChild(this.$footer);
		this.$dialog.appendChild(this.$form);
		this.$container.appendChild(this.$dialog);

		document.body.appendChild(this.$container);
	}

	public open<T extends typeof NgController>(options: NgModalOptions<T> = { }) {
		const { $log } = this;
		const {
			title = 'Set the <code>title</code> property to replace me :)',
			template = '<p class="lead">Set the <code>template</code> property to replace me :)</p>',
			controller = NgController,
			onClose = () => {
				return true;
			},
		} = options;

		const defaultCancelBtnText = 'Cancel';
		const defaultOkBtnText = 'Ok';
		let {
			cancelBtnText = defaultCancelBtnText,
			okBtnText = defaultOkBtnText,
		} = options;

		if (cancelBtnText !== false) {
			if (cancelBtnText === true) {
				cancelBtnText = defaultCancelBtnText;
			}
			this.$cancelBtn.innerText = cancelBtnText;
		}
		if (okBtnText !== false) {
			if (okBtnText === true) {
				okBtnText = defaultOkBtnText;
			}
			this.$submitBtn.value = okBtnText;
		}

		this.$title.innerHTML = typeof title === 'function' ? title() : title;
		this.$main.innerHTML =
			typeof template === 'function' ? template() : template;

		const $scope = this.$rootScope.$new(true) as Parameters<NgModal['hideModal']>[1];
		const $element = this.$compile(this.$container)($scope);
		const $ctrl = makeInjectableCtrl(controller, {
			log: this.$log,
			http: this.$http,
			renderer: this.$renderer,
			config: () => this.$config,
		});

		$scope.$ctrl = new $ctrl($element, $scope, this.$injector) as NgController;
		$scope.$applyAsync();

		const escapeKeyListener = (e: KeyboardEvent) => {
			if (e.key === 'Escape' || e.key === 'Esc') {
				close();
			}
		};
		const dismiss = () => {
			removeEventListeners();
			this.hideModal(escapeKeyListener, $scope);
		};

		this.showModal(escapeKeyListener);

		const removeEventListeners = () => {
			this.$cancelBtn.removeEventListener('click', dismiss);
			this.$submitBtn.removeEventListener('click', close);
			this.$backdrop.removeEventListener('click', close);
		};

		const close = () => {
			if (onClose.call({ $log }, controller as T)) {
				dismiss();
			}
		};
		this.$cancelBtn.addEventListener('click', dismiss);
		this.$submitBtn.addEventListener('click', close);
		this.$backdrop.addEventListener('click', close);

		return { close, dismiss };
	}

	protected showModal(escapeKeyListener: (e: KeyboardEvent) => void) {
		this.$backdrop.style.setProperty('display', 'block');

		this.$container.style.setProperty('display', 'block');
		this.$container.classList.remove('show');
		this.$container.removeAttribute('aria-hidden');
		this.$container.setAttribute('aria-modal', 'true');
		this.$container.style.setProperty('padding-right', '17px');
		this.$container.style.setProperty('pointer-events', 'none');

		window.addEventListener('keydown', escapeKeyListener);
		document.body.appendChild(this.$backdrop);
		document.body.classList.add('modal-open');

		setTimeout(() => {
			this.$backdrop.classList.add('show');
			this.$container.classList.add('show');
		}, MODAL_SHOW_DELAY);
	}

	protected hideModal(
		escapeKeyListener: (e: KeyboardEvent) => void,
		scope: NgScope & { $ctrl: NgController; },
	) {
		this.$backdrop.classList.remove('show');
		this.$container.classList.remove('show');

		setTimeout(() => {
			this.$container.style.setProperty('display', 'none');
			this.$backdrop.style.setProperty('display', 'none');
		}, MODAL_HIDE_DELAY);

		scope.$destroy();
		window.removeEventListener('keydown', escapeKeyListener);
		document.body.classList.remove('modal-open');
	}
}

export interface NgModalOptions<T extends typeof NgController> {
	/**
	 * String representing the modal's title
	 */
	title?: string | (() => string);

	/**
	 * Inline template representing the modal's content
	 */
	template?: string | (() => string);

	/**
	 * Ok button text (false to hide)
	 */
	okBtnText?: string | boolean;

	/**
	 * Cancel button text (false to hide, true for default)
	 */
	cancelBtnText?: string | boolean;

	/**
	 * A controller for a modal instance.
	 */
	controller?: T;

	onClose?(this: { $log: NgLogger }, controller: T): boolean;
}
