// tslint:disable:ban-types
import { element } from 'angular';
import { NgController } from '../controller';
import { NgLogger } from './logger';
import { NgService } from './base';

export class NgModalService extends NgService {
	constructor(
		private $uibModal: UiModalService,
		private $log: NgLogger,
	) {
		super();
	}

	public open({
		appendTo = document.body,
		template = '<h1>Set the <code>template</code> property to replace me :)</h1>',
		size = 'lg',
		controller = NgController,
		controllerAs = '$ctrl',
		onClose = () => {
			return true;
		},
	}: NgModalOptions = { }) {
		const { $log } = this;

		function makeModalCtrl() {
			return class extends controller {
				public close: (...args: any[]) => void;
				public $log = $log;

				protected onclose: typeof onClose;

				constructor(public $scope: angular.IScope) {
					super();
				}

				public $onInit() {
					$modal.opened.then(() => {
						const modal = document.querySelector('.modal') as HTMLDivElement;
						modal.classList.add('show');
						modal.style.zIndex = '1050';
						modal.style.color = 'black';

						appendTo.appendChild(backdrop);

						this.onclose = onClose.bind({ $log: this.$log });

						const close = (...args: any[]) => {
							modal.classList.remove('show');
							window.removeEventListener('keydown', listener);

							backdrop.classList.remove('modal-backdrop');
							appendTo.removeChild(backdrop);

							setTimeout(() => $modal.close(...args), 100);
						};

						const listener = (e: KeyboardEvent) => {
							if (e.key === 'Escape' || e.key === 'Esc') {
								if (this.onclose({ isDismiss: true, close })) {
									this.close();
								}
							}
						};

						window.addEventListener('keydown', listener);

						this.close = (...args: any[]) => {
							const param = {
								isDismiss: args.length === 0,
								close,
								item: null,
							};

							if (param.isDismiss === false) {
								param.item = args.length === 1 ? args[0] : args;
								if (this.onclose(param)) {
									close(...args);
								}
							} else if (this.onclose(param)) {
								close();
							}
						};
					});
				}
			};
		}

		const backdrop = document.createElement('div');

		backdrop.classList.add('modal-backdrop');
		backdrop.classList.add('show');
		backdrop.style.opacity = '0.5';

		const $modal = this.$uibModal.open({
			animation: true,
			backdrop: false,
			keyboard: false,

			ariaLabelledBy: 'modal-title',
			ariaDescribedBy: 'modal-body',

			appendTo: element(appendTo) as angular.IAugmentedJQuery,
			template,
			size,
			controller: ['$scope', makeModalCtrl()],
			controllerAs,
		});

		return $modal;
	}
}

export interface NgModalOptions {
	template?: string;
	appendTo?: Element;
	size?: 'sm' | 'md' | 'lg';
	controller?: new () => any;
	controllerAs?: string;
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
		 * a path to a template representing modal's content
		 */
		templateUrl?: string | (() => string);

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
		 * Set to false to disable animations on new modal/backdrop. Does not toggle animations for modals/backdrops that are already displayed.
		 */
		animation?: boolean;

		/**
		 * controls the presence of a backdrop
		 * Allowed values:
		 *   - true (default)
		 *   - false (no backdrop)
		 *   - 'static' backdrop is present but modal window is not closed when clicking outside of the modal window
		 */
		backdrop?: boolean | string;

		/**
		 * indicates whether the dialog should be closable by hitting the ESC key
		 */
		keyboard?: boolean;

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
		 * Appends the modal to a specific element.
		 */
		appendTo?: angular.IAugmentedJQuery;

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
