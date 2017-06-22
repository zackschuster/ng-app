import { element } from 'angular';
import { IModalService } from 'angular-ui-bootstrap';

import { models } from '../..';

export class NgModalService {
	constructor(private $uibModal: IModalService) {}

	public open(options: models.ModalOptions) {
		const defaults = { appendTo: document.body, template: '', size: 'lg', controllerAs: '$ctrl' };
		const { template, size, controller, controllerAs, appendTo } = Object.assign(defaults, options);

		controller.prototype.$onInit = async () => {
				await $modal.opened;

				const modal = document.querySelector('.modal') as HTMLDivElement;
				modal.classList.add('show');
				modal.style.zIndex = '1050';

				appendTo.appendChild(backdrop);

				controller.prototype.close = () => {
					modal.classList.remove('show');

					setTimeout(() => {
						backdrop.classList.remove('modal-backdrop');
						appendTo.removeChild(backdrop);
						$modal.close();
					}, 100);
				};
			};

		const backdrop = document.createElement('div');

		backdrop.classList.add('modal-backdrop');
		backdrop.classList.add('show');
		backdrop.style.opacity = '0.5';

		const $modal = this.$uibModal.open({
			animation: !false,
			backdrop: false,

			ariaLabelledBy: 'modal-title',
			ariaDescribedBy: 'modal-body',

			appendTo: element(appendTo),
			template,
			size,
			controller,
			controllerAs,
		});

		return $modal;
	}

}
