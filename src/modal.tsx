import { h } from '@ledge/jsx';
import { NgController, makeInjectableCtrl } from './controller';
import { NgLogger } from './logger';
import { NgService } from './service';
import { NgHttp } from './http';
import { NgAppConfig } from './options';

const MODAL_SHOW_DELAY = 23;
const MODAL_HIDE_DELAY = 150;

export class NgModal extends NgService {
	protected readonly $backdrop = <div class='modal-backdrop fade in'></div>;
	protected readonly $title = <h5 class='modal-title'></h5> as HTMLHeadingElement;
	protected readonly $header = <header class='modal-header'>{this.$title}</header>;
	protected readonly $main = <main class='modal-body'></main>;
	protected readonly $cancelBtn =
		<button class='btn btn-info' type='button'>Cancel</button> as HTMLButtonElement;
	protected readonly $submitBtn = <input class='btn btn-success' type='submit' /> as HTMLInputElement;
	protected readonly $footer =
		<footer class='modal-footer'>{this.$cancelBtn}{this.$submitBtn}</footer>;
	protected readonly $form =
		<form class='modal-content' role='document'>
			{this.$header}
			{this.$main}
			{this.$footer}
		</form> as HTMLFormElement;
	protected readonly $dialog = <div class='modal-dialog' role='dialog'>{this.$form}</div>;
	protected readonly $container =
		<div class='modal fade in'
			aria-labelledby={this.$title.id}
			aria-live='polite'
			aria-modal='true'
			role='dialog'>{this.$dialog}</div>;

	constructor(
		protected readonly $log: NgLogger,
		protected readonly $http: NgHttp,
		protected readonly $config: NgAppConfig,
		protected readonly $injector: angular.auto.IInjectorService | (() => angular.auto.IInjectorService),
	) {
		super();

		document.body.appendChild(this.$container);
	}

	public open<T extends typeof NgController, Y = undefined>(options: NgModalOptions<T, Y> = {}) {
		const defaultCancelBtnText = 'Cancel';
		const defaultOkBtnText = 'Ok';
		const {
			item,
			title = 'Set the <code>title</code> property to replace me :)',
			template = '<p class="lead">Set the <code>template</code> property to replace me :)</p>',
			cancelBtnText = defaultCancelBtnText,
			okBtnText = defaultOkBtnText,
			controller = NgController,
			show = true,
			onClose = () => {
				return true;
			},
		} = options;

		if (cancelBtnText === false) {
			this.$cancelBtn.hidden = true;
		} else {
			this.$cancelBtn.innerText = cancelBtnText === true ? defaultCancelBtnText : cancelBtnText;
		}
		if (okBtnText === false) {
			this.$submitBtn.hidden = true;
		} else {
			this.$submitBtn.value = okBtnText === true ? defaultOkBtnText : okBtnText;
		}
		this.$footer.hidden = this.$cancelBtn.hidden && this.$submitBtn.hidden;

		this.$title.innerHTML = typeof title === 'function' ? title() : title;
		this.$main.innerHTML =
			typeof template === 'function' ? template() : template;

		const $injector = typeof this.$injector === 'function' ? this.$injector() : this.$injector;
		const $rootScope = $injector.get('$rootScope');
		const $compile = $injector.get('$compile');
		const $scope = $rootScope.$new(true) as Parameters<NgModal['hideModal']>[1];
		const $element = $compile(this.$container)($scope);
		const $ctrl = makeInjectableCtrl(controller, {
			log: this.$log,
			http: this.$http,
			config: () => this.$config,
		});

		$scope.$ctrl = new $ctrl($element, $scope, $injector) as NgController;
		Object.defineProperty($scope.$ctrl, 'item', { value: item });
		$scope.$applyAsync();

		const deferred = $injector.get('$q').defer<Y>();
		const escapeKeyListener = (e: KeyboardEvent) => {
			if (e.key === 'Escape' || e.key === 'Esc') {
				close();
			}
		};
		const dismiss = (shouldReject?: Event | boolean) => {
			removeEventListeners();
			this.hideModal(escapeKeyListener, $scope);
			if (shouldReject !== false) {
				deferred.reject(new Error('NgModal dismissed'));
			}
			$rootScope.$apply();
		};

		if (show) {
			this.showModal(escapeKeyListener);
		}

		const removeEventListeners = () => {
			this.$cancelBtn.removeEventListener('click', dismiss);
			this.$submitBtn.removeEventListener('click', close);
			this.$backdrop.removeEventListener('click', close);
		};

		const close = () => {
			if (onClose()) {
				deferred.resolve(item);
				dismiss(false);
			}
		};
		this.$cancelBtn.addEventListener('click', dismiss);
		this.$submitBtn.addEventListener('click', close);
		this.$backdrop.addEventListener('click', close);

		return {
			close,
			dismiss,
			show: () => this.showModal(escapeKeyListener),
			hide: () => this.hideModal(escapeKeyListener, $scope),
			element: this.$container,
			result: deferred.promise,
		};
	}

	protected showModal(escapeKeyListener: (e: KeyboardEvent) => void) {
		return new Promise<void>(resolve => {
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
				resolve();
			}, MODAL_SHOW_DELAY);
		});
	}

	protected hideModal(
		escapeKeyListener: (e: KeyboardEvent) => void,
		scope: angular.IScope & { $ctrl: NgController; },
	) {
		return new Promise<void>(resolve => {
			this.$backdrop.classList.remove('show');
			this.$container.classList.remove('show');

			scope.$destroy();
			window.removeEventListener('keydown', escapeKeyListener);
			document.body.classList.remove('modal-open');

			setTimeout(() => {
				this.$backdrop.style.setProperty('display', 'none');
				this.$container.style.setProperty('display', 'none');
				resolve();
			}, MODAL_HIDE_DELAY);
		});
	}
}

export interface NgModalOptions<T extends typeof NgController = typeof NgController, Y = undefined> {
	item?: Y;
	/**
	 * String representing the modal's title.
	 */
	title?: string | (() => string);

	/**
	 * Inline template representing the modal's content.
	 */
	template?: string | (() => string);

	/**
	 * Submit button text. Set to `false` to hide. Defaults to `'Ok'`.
	 */
	okBtnText?: string | boolean;

	/**
	 * Cancel button text. Set to `false` to hide. Defaults to `'Cancel'`.
	 */
	cancelBtnText?: string | boolean;

	/**
	 * Whether to immediately show the modal. Defaults to `true`.
	 */
	show?: boolean;

	/**
	 * A controller for a modal instance.
	 */
	controller?: T;

	onClose?(): boolean;
}
