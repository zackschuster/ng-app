import 'element-closest';
import * as Choices from 'choices.js';
import { IAttributes } from 'angular';
import { NgController } from '../../controller';
import { InputComponentOptions } from '../../..';

function isMultiple($attrs: IAttributes) {
	return $attrs.hasOwnProperty('multiple') || $attrs.type === 'multiple';
}

class SelectController extends NgController {
	public list: any[];
	public choices: Choices;
	private isMultiple: boolean;

	public $postLink() {
		const $el = (this.$element as any)[0] as HTMLElement;
		const $select = $el.querySelector('select') as HTMLElement;

		this.isMultiple = isMultiple(this.$attrs);
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

		const value = this.$attrs.value || 'Value';
		const text = this.$attrs.text || 'Text';

		this.choices = new Choices(el, {
			removeItemButton: true,
			itemSelectText: '',
			placeholderValue: this.$attrs.placeholder,
		});

		this.choices.setChoices(list, value, text);
		this.choices.passedElement.addEventListener('change', this.changeEvent.bind(this));

		// tslint:disable-next-line:triple-equals
		if (list.includes(this.ngModel) || list.find(x => x[value] == this.ngModel) != null) {
			this.choices.setValueByChoice(this.ngModel);
		}
	}

	public changeEvent(event: any) {
		const { value } = event.detail;
		if (this.ngModel != null && this.isMultiple ? this.ngModel.includes(value) : this.ngModel === value) {
			return;
		}
		this.ngModel = this.isMultiple ? [value].concat(this.ngModel || []) : value;
	}
}

export const selectList: InputComponentOptions = {
	type: 'input',
	render(h) {
		const input = h.createElement('select');

		// tslint:disable-next-line:no-invalid-this
		if (isMultiple(this.$attrs)) {
			input.setAttribute('multiple', 'true');
		}

		return input;
	},
	ctrl: SelectController,
	bindings: {
		list: '<',
	},
};
