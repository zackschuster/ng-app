import { element } from 'angular';
import { NgApp } from './app';
import { NgController } from './controller';
import { NgLogger } from './logger';

export class NgModalService {
	constructor(private $uibModal: angular.ui.bootstrap.IModalService, private app: NgApp) {}

	public open(options: NgModalOptions) {
		const defaults: NgModalOptions = {
			appendTo: document.body,
			template: '',
			size: 'lg',
			controller: NgController,
			controllerAs: '$ctrl',
			onClose() {
				return true;
			},
		};

		const {
			template,
			size,
			controller,
			controllerAs,
			appendTo,
			onClose,
		} = Object.assign(defaults, options) as Required<NgModalOptions>;

		const app = this.app;
		function extendClass() {
			// tslint:disable-next-line:max-classes-per-file
			return class extends (controller as typeof NgController) {
				public close: (...args: any[]) => void;
				public $http = app.http();
				public $timeout = app.timeout();
				public $log = app.logger();

				protected onclose: typeof onClose;

				constructor(public $scope: angular.IScope) {
					super();
				}

				public async $onInit() {
					await $modal.opened;

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
			controller: ['$scope', extendClass()],
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
