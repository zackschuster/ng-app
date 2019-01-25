// tslint:disable:ban-types
// import { NgController } from '../controller';
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

	constructor(private $log: NgLogger) {
		super();

		this.backdrop = this.makeBackdrop();
		this.container = this.makeContainer();
		this.dialog = this.makeDialog();
		this.content = this.makeContent();
		this.header = this.makeHeader();
		this.headerCloseButton = this.makeHeaderCloseButton();
		this.title = this.makeTitle();
		this.body = this.makeBody();
		this.footer = this.makeFooter();
		this.footerCloseButton = this.makeFooterCloseButton();
		this.footerSaveButton = this.makeFooterSaveButton();

		document.appendChild(this.backdrop);

		this.header.appendChild(this.title);
		this.header.appendChild(this.headerCloseButton);
		this.content.appendChild(this.header);
		this.content.appendChild(this.body);
		this.footer.appendChild(this.footerCloseButton);
		this.footer.appendChild(this.footerSaveButton);
		this.content.appendChild(this.footer);
		this.dialog.appendChild(this.content);
		this.container.appendChild(this.dialog);
	}

	public open({
		title = 'Set the <code>template</code> property to replace me :)',
		template = '<p class="lead">Set the <code>template</code> property to replace me :)</p>',
		size = 'lg',
		// controller = NgController,
		onClose = () => {
			return true;
		},
	}: NgModalOptions = { }) {
		const { $log } = this;

		this.title.innerText = typeof title === 'function' ? title() : title;
		this.content.innerHTML = template;
		this.container.classList.add(`modal-${size}`);

		const escapeKeyListener = (e: KeyboardEvent) => {
			if (e.key === 'Escape' || e.key === 'Esc') {
				if (onClose.call({ $log }, { isDismiss: true, close: this.hideModal })) {
					this.hideModal(escapeKeyListener);
				}
			}
		};

		this.showModal(escapeKeyListener);

		// const close = (...args: any[]) => {
		// 	const isDismiss = args.length === 0;
		// 	const param = {
		// 		isDismiss,
		// 		close,
		// 		item: isDismiss
		// 			? null
		// 			: args.length === 1
		// 				? args[0]
		// 				: args,
		// 	};

		// 	if (onClose.call({ $log }, param)) {
		// 		close(...args);
		// 	}
		// };

		// const $modal = this.$uibModal.open({
		// 	ariaLabelledBy: 'modal-title',
		// 	ariaDescribedBy: 'modal-body',

		// 	template,
		// 	size,
		// 	controller: ['$scope', makeModalCtrl()],
		// 	controllerAs: '$ctrl',
		// });

		// return $modal;
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

	protected hideModal(escapeKeyListener: (e: KeyboardEvent) => void) {
		this.backdrop.classList.remove('show');
		this.container.classList.remove('show');
		this.container.style.removeProperty('padding-right');
		this.container.style.setProperty('display', 'none');
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

export interface NgModalOptions {
	/**
	 * string representing the modal's title
	 */
	title?: string | (() => string);
	template?: string;
	appendTo?: Element;
	size?: 'sm' | 'md' | 'lg';
	controller?: new () => any;
	controllerAs?: string;
	onOpen?(
		this: { $log: NgLogger },
		args: {
			item?: any,
			open(...args: any[]): void,
		},
	): boolean;
	onClose?(
		this: { $log: NgLogger },
		args: {
			item?: any,
			isDismiss: boolean,
			close(...args: any[]): void,
		},
	): boolean;
}

export interface UiModalService {
	getPromiseChain(): angular.IPromise<any>;
	open(options: UIModalSettings): UIModalInstanceService;
}

export interface UIModalSettings {
		/**
		 * inline template representing the modal's content
		 */
		template?: string | (() => string);

		/**
		 * a scope instance to be used for the modal's content (actually the $modal service is going to create a child scope of a provided scope).
		 * Defaults to `$rootScope`.
		 */
		scope?: angular.IScope;

		/**
		 * a controller for a modal instance - it can initialize scope used by modal.
		 * A controller can be injected with `$modalInstance`
		 * If value is an array, it must be in Inline Array Annotation format for injection (strings followed by factory method)
		 */
		controller?: string | Function | (string | Function)[];

		/**
		 *  an alternative to the controller-as syntax, matching the API of directive definitions.
		 *  Requires the controller option to be provided as well
		 */
		controllerAs?: string;

		/**
		 * When used with controllerAs and set to true, it will bind the controller properties onto the $scope directly.
		 */
		bindToController?: boolean;

		/**
		 * members that will be resolved and passed to the controller as locals; it is equivalent of the `resolve` property for AngularJS routes
		 * If property value is an array, it must be in Inline Array Annotation format for injection (strings followed by factory method)
		 */
		resolve?: { [key: string]: string | Function | (string | Function)[] | Object };

		/**
		 * additional CSS class(es) to be added to a modal backdrop template
		 */
		backdropClass?: string;

		/**
		 * additional CSS class(es) to be added to a modal window template
		 */
		windowClass?: string;

		/**
		 * Optional suffix of modal window class. The value used is appended to the `modal-` class, i.e. a value of `sm` gives `modal-sm`.
		 */
		size?: string;

		/**
		 * a path to a template overriding modal's window template
		 */
		windowTemplateUrl?: string;

		/**
		 * The  class added to the body element when the modal is opened.
		 */
		openedClass?: string;

		/**
		 * CSS class(es) to be added to the top modal window.
		 */
		windowTopClass?: string;

		/**
		 * A string reference to the component to be rendered that is registered with Angular's compiler. If using a directive, the directive must have `restrict: 'E'` and a template or templateUrl set.
		 *
		 * It supports these bindings:
		 *   - `close` - A method that can be used to close a modal, passing a result. The result must be passed in this format: `{$value: myResult}`
		 *   - `dismiss` - A method that can be used to dismiss a modal, passing a result. The result must be passed in this format: `{$value: myRejectedResult}`
		 *   - `modalInstance` - The modal instance. This is the same `$uibModalInstance` injectable found when using `controller`.
		 *   - `resolve` - An object of the modal resolve values. See [UI Router resolves] for details.
		 */
		component?: string;

		/**
		 * Sets the `aria-describedby` property on the modal.
		 * The string should be an id (without the leading '#') pointing to the element that describes your modal.
		 * @memberOf IModalSettings
		 */
		ariaDescribedBy?: string;

		/**
		 * Sets the `aria-labelledby` property on the modal.
		 * The string should be an id (without the leading '#') pointing to the element that labels your modal.
		 * @memberOf IModalSettings
		 */
		ariaLabelledBy?: string;
}

export interface UIModalInstanceService {

		/**
		 * A promise that is resolved when a modal is closed and rejected when a modal is dismissed.
		 */
		result: angular.IPromise<any>;

		/**
		 * A promise that is resolved when a modal gets opened after downloading content's template and resolving all variables.
		 */
		opened: angular.IPromise<any>;

		/**
		 * A promise that is resolved when a modal is rendered.
		 */
		rendered: angular.IPromise<any>;

		/**
		 * A promise that is resolved when a modal is closed and the animation completes.
		 */
		closed: angular.IPromise<any>;
		/**
		 * A method that can be used to close a modal, passing a result. If `preventDefault` is called on the `modal.closing` event then the modal will remain open.
		 */
		close(result?: any): void;

		/**
		 * A method that can be used to dismiss a modal, passing a reason. If `preventDefault` is called on the `modal.closing` event then the modal will remain open.
		 */
		dismiss(reason?: any): void;
}
