import { NgController } from 'core/ng/controller';

export class CoreInputController extends NgController {
	public ngModel: any;

	public $postLink() {
		this.$timeout(_ => {
			const el = document.querySelector('[ng-transclude="contain"]');
			if (el.innerHTML === '') {
				el.remove();
			}
		});
	}
}
