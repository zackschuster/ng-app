// tslint:disable:max-classes-per-file
import { element } from 'angular';
import { NgController } from '../controller';
import { NgLogger } from './logger';
import { NgService } from './base';

export class NgModalService extends NgService {
	constructor(
		private $uibModal: angular.ui.bootstrap.IModalService,
		private $log: NgLogger,
	) {
		super();
	}

	public open({
		appendTo = document.body,
		template = '<h1>Set the <code>template</code> property to replace me :)</h1>',
		size = 'lg',
		controller = class extends NgController {},
		controllerAs = '$ctrl',
		onClose = () => {
			return true;
		},
	}: NgModalOptions = {}) {
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
