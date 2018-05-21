import { IScope, element } from 'angular';
import { IModalService } from 'angular-ui-bootstrap';
import { NgController, NgModalOptions } from '..';
import { NgApp } from './app';

export class NgModalService {
	constructor(private $uibModal: IModalService, private app: NgApp) {}

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

				constructor(public $scope: IScope) {
					super();
				}

				public async $onInit() {
					await $modal.opened;

					const modal = document.querySelector('.modal') as HTMLDivElement;
					modal.classList.add('show');
					modal.style.zIndex = '1050';
					modal.style.color = 'black';

					appendTo.appendChild(backdrop);

					this.onclose = onClose.bind(this);

					const close = (...args: any[]) => {
						modal.classList.remove('show');
						window.removeEventListener('keydown', listener);

						backdrop.classList.remove('modal-backdrop');
						appendTo.removeChild(backdrop);

						setTimeout(() => $modal.close(...args), 100);
					};

					const listener = (e: KeyboardEvent) => {
						if (e.key === 'Escape' || e.key === 'Esc') {
							if (this.onclose(true, close)) {
								this.close();
							}
						}
					};

					window.addEventListener('keydown', listener);

					this.close = (...args: any[]) => {
						// dismiss
						if (args.length === 0) {
							if (this.onclose(true, close)) {
								close();
							}
						} else if (this.onclose()) {
							close(...args);
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

			appendTo: element(appendTo),
			template,
			size,
			controller: ['$scope', extendClass()],
			controllerAs,
		});

		return $modal;
	}
}
