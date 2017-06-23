import { NgController } from '../controller';

export class CoreInputController extends NgController {
	public ngModel: any;

	public $postLink() {
		this.$timeout(() => {
			const contain = this.$element.closest('[ng-transclude="contain"]');
			if (contain) {
				this.$element.find('label').addClass('sr-only');
			}

			const el = this.$element.find('[ng-transclude="contain"]');
			if (el.empty()) {
				el.detach();
			}
		});
	}
}
