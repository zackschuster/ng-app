import { NgController, makeInjectableCtrl } from '../controller';
import { NgLogger } from './logger';
import { NgService } from './base';
import { NgHttp } from './http';
import { NgAppConfig } from '../options';
import { NgRenderer } from './renderer';

export class NgModal extends NgService {
	protected readonly backdrop: HTMLDivElement;
	protected readonly container: HTMLDivElement;
	protected readonly content: HTMLDivElement;
	protected readonly dialog: HTMLDivElement;
	protected readonly header: HTMLDivElement;
	protected readonly headerCloseButton: HTMLButtonElement;
	protected readonly title: HTMLHeadingElement;
	protected readonly body: HTMLDivElement;
	protected readonly footer: HTMLDivElement;
	protected readonly footerCancelButton: HTMLButtonElement;
	protected readonly footerOkButton: HTMLButtonElement;

	protected readonly $compile: angular.ICompileService;
	protected readonly $controller: angular.IControllerService;
	protected readonly $rootScope: angular.IRootScopeService;

	constructor(
		protected readonly $renderer: NgRenderer,
		protected readonly $log: NgLogger,
		protected readonly $http: NgHttp,
		protected readonly $config: NgAppConfig,
		protected readonly $injector: angular.auto.IInjectorService,
	) {
		super();

		this.$compile = this.$injector.get('$compile');
		this.$controller = this.$injector.get('$controller');
		this.$rootScope = this.$injector.get('$rootScope');

		this.backdrop = this.makeBackdrop();
		this.header = this.makeHeader();

		this.title = this.makeTitle();
		this.header.appendChild(this.title);

		this.headerCloseButton = this.makeHeaderCloseButton();
		this.header.appendChild(this.headerCloseButton);

		this.content = this.makeContent();
		this.content.appendChild(this.header);

		this.body = this.makeBody();
		this.content.appendChild(this.body);

		this.footer = this.makeFooter();
		this.footerCancelButton = this.makeFooterCancelButton();
		this.footer.appendChild(this.footerCancelButton);

		this.footerOkButton = this.makeFooterOkButton();
		this.footer.appendChild(this.footerOkButton);

		this.content.appendChild(this.footer);

		this.dialog = this.makeDialog();
		this.dialog.appendChild(this.content);

		this.container = this.makeContainer();
		this.container.appendChild(this.dialog);
		document.body.appendChild(this.container);
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
			this.footerCancelButton.innerText = cancelBtnText;
		}
		if (okBtnText !== false) {
			if (okBtnText === true) {
				okBtnText = defaultOkBtnText;
			}
			this.footerOkButton.innerText = okBtnText;
		}

		this.title.innerHTML = typeof title === 'function' ? title() : title;
		this.body.innerHTML =
			typeof template === 'function' ? template() : template;

		const $scope = this.$rootScope.$new(true) as angular.IScope & {
			$ctrl: NgController;
		};
		const $element = this.$compile(this.container)($scope);
		const $ctrl = makeInjectableCtrl(controller, {
			log: this.$log,
			http: this.$http,
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
			this.headerCloseButton.removeEventListener('click', dismiss);
			this.footerCancelButton.removeEventListener('click', dismiss);
			this.footerOkButton.removeEventListener('click', close);
			this.backdrop.removeEventListener('click', close);
		};

		const close = () => {
			if (onClose.call({ $log }, controller as T)) {
				dismiss();
			}
		};
		this.headerCloseButton.addEventListener('click', dismiss);
		this.footerCancelButton.addEventListener('click', dismiss);
		this.footerOkButton.addEventListener('click', close);
		this.backdrop.addEventListener('click', close);

		return { close, dismiss };
	}

	protected showModal(escapeKeyListener: (e: KeyboardEvent) => void) {
		this.backdrop.style.setProperty('display', 'block');

		this.container.style.setProperty('display', 'block');
		this.container.classList.remove('show');
		this.container.removeAttribute('aria-hidden');
		this.container.setAttribute('aria-modal', 'true');
		this.container.style.setProperty('padding-right', '17px');
		this.container.style.setProperty('pointer-events', 'none');

		window.addEventListener('keydown', escapeKeyListener);
		document.body.appendChild(this.backdrop);
		document.body.classList.add('modal-open');

		setTimeout(() => {
			this.backdrop.classList.add('show');
			this.container.classList.add('show');
		}, 23);
	}

	protected hideModal(
		escapeKeyListener: (e: KeyboardEvent) => void,
		scope: angular.IScope,
	) {
		this.backdrop.classList.remove('show');
		this.container.classList.remove('show');
		setTimeout(() => {
			this.container.style.setProperty('display', 'none');
			this.backdrop.style.setProperty('display', 'none');
		}, 150);

		scope.$destroy();
		window.removeEventListener('keydown', escapeKeyListener);
		document.body.classList.remove('modal-open');
	}

	protected makeBackdrop() {
		return this.$renderer.createHtmlElement('div', ['modal-backdrop', 'fade']);
	}

	protected makeContainer() {
		return this.$renderer.createHtmlElement(
			'div',
			['fade', 'modal'],
			[
				['aria-hidden', 'true'],
				['aria-labelledby', 'modal-title'],
				['role', 'dialog'],
				['tabindex', '-1'],
			],
		);
	}

	protected makeDialog() {
		return this.$renderer.createHtmlElement(
			'div',
			['modal-dialog'],
			[['role', 'document']],
		);
	}

	protected makeContent() {
		return this.$renderer.createHtmlElement('div', ['modal-content']);
	}

	protected makeHeader() {
		return this.$renderer.createHtmlElement('div', ['modal-header']);
	}

	protected makeHeaderCloseButton() {
		const btn = this.$renderer.createHtmlElement(
			'button',
			['close'],
			[['type', 'button'], ['aria-label', 'close']],
		);
		btn.innerHTML = '&times;';
		return btn;
	}

	protected makeTitle() {
		return this.$renderer.createHtmlElement(
			'h5',
			['modal-title'],
			[['id', `modal-title-${this.uniqueId}`]],
		);
	}

	protected makeBody() {
		return this.$renderer.createHtmlElement('div', ['modal-body']);
	}

	protected makeFooter() {
		return this.$renderer.createHtmlElement('div', ['modal-footer']);
	}

	protected makeFooterCancelButton() {
		return this.$renderer.createHtmlElement(
			'button',
			['btn', 'btn-info'],
			[['type', 'button']],
		);
	}

	protected makeFooterOkButton() {
		return this.$renderer.createHtmlElement(
			'button',
			['btn', 'btn-success'],
			[['type', 'button']],
		);
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
