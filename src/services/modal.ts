import { NgController } from '../controller';
import { NgLogger } from './logger';
import { NgService } from './base';

export class NgModalService extends NgService {
	public backdrop: HTMLDivElement;
	public container: HTMLDivElement;
	public content: HTMLDivElement;
	public dialog: HTMLDivElement;
	public header: HTMLDivElement;
	public headerCloseButton: HTMLButtonElement;
	public title: HTMLHeadingElement;
	public body: HTMLDivElement;
	public footer: HTMLDivElement;
	public footerCloseButton: HTMLButtonElement;
	public footerSaveButton: HTMLButtonElement;

	constructor(
		private $log: NgLogger,
		private $compile: angular.ICompileService,
		private $controller: angular.IControllerService,
		private $rootScope: angular.IRootScopeService,
	) {
		super();

		this.backdrop = this.makeBackdrop();
		document.appendChild(this.backdrop);

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
		this.footerCloseButton = this.makeFooterCloseButton();
		this.footer.appendChild(this.footerCloseButton);

		this.footerSaveButton = this.makeFooterSaveButton();
		this.footer.appendChild(this.footerSaveButton);

		this.content.appendChild(this.footer);

		this.dialog = this.makeDialog();
		this.dialog.appendChild(this.content);

		this.container = this.makeContainer();
		this.container.appendChild(this.dialog);
	}

	public open<T extends NgController>(options: NgModalOptions<T>) {
		const { $log, hideModal } = this;
		const {
			title = 'Set the <code>template</code> property to replace me :)',
			template = '<p class="lead">Set the <code>template</code> property to replace me :)</p>',
			size = 'lg',
			controller = NgController,
			onSave = () => {
				return true;
			},
			onDismiss = () => {
				return true;
			},
		} = options;

		this.title.innerText = typeof title === 'function' ? title() : title;
		this.content.innerHTML = template;
		this.container.classList.add(`modal-${size}`);

		const $scope = Object.assign(this.$rootScope.$new(true), {
			$ctrl: this.$controller<T>(controller as any),
		});
		this.$compile(this.container)($scope);

		const escapeKeyListener = (e: KeyboardEvent) => {
			if (e.key === 'Escape' || e.key === 'Esc') {
				if (onDismiss.call({ $log })) {
					dismiss();
				}
			}
		};
		const dismiss = hideModal.bind(null, escapeKeyListener, $scope);

		this.showModal(escapeKeyListener);

		const closeModalButton = () => {
			this.headerCloseButton.removeEventListener('click', closeModalButton);
			this.footerCloseButton.removeEventListener('click', closeModalButton);
			dismiss();
		};
		this.headerCloseButton.addEventListener('click', closeModalButton);
		this.footerCloseButton.addEventListener('click', closeModalButton);

		const save = () => {
			if (onSave.call({ $log }, controller as T)) {
				this.footerSaveButton.removeEventListener('click', save);
				dismiss();
			}
		};
		this.footerSaveButton.addEventListener('click', save);
	}

	protected showModal(escapeKeyListener: (e: KeyboardEvent) => void) {
		this.backdrop.classList.add('show');
		this.container.classList.add('show');
		this.container.removeAttribute('aria-hidden');
		this.container.setAttribute('aria-modal', 'true');
		this.container.style.setProperty('display', 'block');
		this.container.style.setProperty('padding-right', '17px');
		window.addEventListener('keydown', escapeKeyListener);
	}

	protected hideModal(
		escapeKeyListener: (e: KeyboardEvent) => void,
		scope: angular.IScope,
	) {
		this.backdrop.classList.remove('show');
		this.container.classList.remove('show');
		this.container.style.removeProperty('padding-right');
		this.container.style.setProperty('display', 'none');

		scope.$destroy();
		window.removeEventListener('keydown', escapeKeyListener);
	}

	protected makeBackdrop() {
		const backdrop = document.createElement('div');
		backdrop.classList.add('modal-backdrop');
		backdrop.style.setProperty('opacity', '0.5');
		return backdrop;
	}

	protected makeContainer() {
		const container = document.createElement('div');
		container.classList.add('fade');
		container.classList.add('modal');
		container.setAttribute('aria-hidden', 'true');
		container.setAttribute('aria-labelledby', 'modal-title');
		container.setAttribute('role', 'dialog');
		container.setAttribute('tabindex', '-1');
		container.style.setProperty('color', 'black');
		container.style.setProperty('display', 'none');
		container.style.setProperty('z-index', '1050');
		return container;
	}

	protected makeDialog() {
		const dialog = document.createElement('div');
		dialog.classList.add('modal-dialog');
		dialog.setAttribute('role', 'document');
		return dialog;
	}

	protected makeContent() {
		const content = document.createElement('div');
		content.classList.add('modal-content');
		return content;
	}

	protected makeHeader() {
		const header = document.createElement('div');
		header.classList.add('modal-header');
		return header;
	}

	protected makeHeaderCloseButton() {
		const btn = document.createElement('button');
		btn.classList.add('close');
		btn.setAttribute('aria-label', 'Close');
		btn.setAttribute('type', 'button');

		const headerCloseButtonText = document.createElement('span');
		headerCloseButtonText.setAttribute('aria-hidden', 'true');
		btn.textContent = '&times;';

		btn.appendChild(headerCloseButtonText);
		return btn;
	}

	protected makeTitle() {
		const title = document.createElement('h5');
		title.setAttribute('id', 'modal-title');
		title.classList.add('modal-title');
		return title;
	}

	protected makeBody() {
		const body = document.createElement('div');
		body.classList.add('modal-body');
		return body;
	}

	protected makeFooter() {
		const footer = document.createElement('div');
		footer.classList.add('modal-footer');
		return footer;
	}

	protected makeFooterCloseButton() {
		const btn = document.createElement('button');
		btn.classList.add('btn', 'btn-warning');
		btn.setAttribute('type', 'button');
		btn.textContent = 'Close';
		return btn;
	}

	protected makeFooterSaveButton() {
		const btn = document.createElement('button');
		btn.classList.add('btn', 'btn-success');
		btn.setAttribute('type', 'button');
		btn.textContent = 'Save';
		return btn;
	}
}

export interface NgModalOptions<T extends NgController> {
	/**
	 * String representing the modal's title
	 */
	title?: string | (() => string);

	/**
	 * Inline template representing the modal's content
	 */
	template?: string;

	/**
	 * Optional suffix of modal window class. The value used is appended to the `modal-` class, i.e. a value of `sm` gives `modal-sm`.
	 */
	size?: 'sm' | 'md' | 'lg';

	/**
	 * A controller for a modal instance.
	 */
	controller?: T;

	onSave?(this: { $log: NgLogger }, controller: T): boolean;

	onDismiss?(this: { $log: NgLogger }): boolean;
}
