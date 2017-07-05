import 'element-closest';
import Choices from 'choices.js';
import { NgController } from '../../controller';
import { InputComponentOptions } from '../../..';

class SelectController extends NgController {
	public list: any[];
	public choices: Choices;

	public $postLink() {
		const $el = (this.$element as any)[0] as HTMLElement;
		const $select = $el.querySelector('select');

		this.makeSelectList($select, this.list);

		this.$scope.$watch(
			(_: any) => this.list,
			(_: any) => {
				if (Array.isArray(this.list)) {
					this.makeSelectList($select, this.list);
				}
			},
			true,
		);
	}

	public makeSelectList(el: HTMLSelectElement, list: any[]) {
		if (this.choices != null) {
			this.choices.destroy();
		}

		this.choices = new Choices(el);
		this.choices.setChoices(list, 'Id', 'Description');
		this.choices.passedElement.addEventListener('change', this.changeEvent);
	}

	public changeEvent(event: any) {
		this.ngModel = event.detail.value;
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
