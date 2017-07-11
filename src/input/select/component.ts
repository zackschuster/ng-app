import 'element-closest';
import Choices from 'choices.js';
import { NgController } from '../../controller';
import { InputComponentOptions } from '../../..';

class SelectController extends NgController {
	public list: any[];
	public choices: Choices;

	public $postLink() {
		const $el = (this.$element as any)[0] as HTMLElement;
		const $select = $el.querySelector('select,input') as HTMLElement;

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

	public makeSelectList(el: HTMLElement, list: any[]) {
		if (this.choices != null) {
			this.choices.destroy();
		}

		this.choices = new Choices(el, { removeItemButton: true });
		this.choices.setChoices(list, this.$attrs.value || 'Value', this.$attrs.text || 'Text');
		this.choices.passedElement.addEventListener('change', this.changeEvent);
	}

	public changeEvent(event: any) {
		this.ngModel = event.detail.value;
	}
}

export const selectList: InputComponentOptions = {
	type: 'input',
	render(h) {
		// tslint:disable-next-line:no-invalid-this
		return this.$attrs.hasOwnProperty('multiple') || this.$attrs.type === 'multiple'
			? h.createInput('select-multiple')
			: h.createElement('select');
	},
	ctrl: SelectController,
	bindings: {
		list: '<',
	},
};
