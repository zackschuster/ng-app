import 'element-closest';
import Choices from 'choices.js';
import { NgController } from '../../controller';
import { InputComponentOptions } from '../../..';

class SelectController extends NgController {
	public list: any[];

	public $postLink() {
		const $el = (this.$element as any)[0] as HTMLElement;
		const $select = $el.querySelector('select');

		let choices = new Choices($select);
		this.$scope.$watch(
			(_: any) => this.list,
			(_: any) => {
				if (Array.isArray(this.list)) {
					if (this.list[0].Id > 0) {
						this.list.unshift({ Id: 0, Description: '--- SELECT ONE ---' });
					}
					choices.destroy();
					choices = new Choices($select);
					choices.setChoices(this.list, 'Id', 'Description');
				}
			},
			true,
		);

		this.$timeout(() => {
			const contain = $el.closest('[ng-transclude="contain"]');
			if (contain == null) {
				this.$element.find('label').addClass('sr-only');
			}

			const el = this.$element.find('[ng-transclude="contain"]');
			if (el.empty()) {
				el.detach();
			}
		});
	}
}

export const selectList: InputComponentOptions = {
	type: 'input',
	render(h) {
		const select = h.createElement('select');

		const option = h.createElement('option');

		option.setAttribute('disabled', 'true');
		option.setAttribute('selected', 'true');
		option.setAttribute('value', '0');

		return select;
	},
	ctrl: SelectController,
	bindings: {
		list: '<',
	},
};
