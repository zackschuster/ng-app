import 'element-closest';
import * as Choices from 'choices.js';
import { IAttributes } from 'angular';
import { NgComponentController } from '../../controller';
import { InputComponentOptions } from '../../..';

class SelectController extends NgComponentController {
	public static Placeholder = '----Select One----';
	public static IsMultiple($attrs: IAttributes) {
		return $attrs.hasOwnProperty('multiple') || $attrs.type === 'multiple';
	}

	public list: any[];
	public choices: Choices;

	public $postLink() {
		const $el = (this.$element as any)[0] as HTMLElement;
		const $select = $el.querySelector('select');

		this.makeSelectList($select, this.list);

		this.$scope.$watch(
			_ => this.list,
			_ => this.makeSelectList($select, this.list),
			true,
		);
	}

	public makeSelectList(el: HTMLElement, list: any[]) {
		if (this.choices != null) {
			this.choices.destroy();
		}

		this.choices = new Choices(el, {
			removeItemButton: true,
			itemSelectText: '',
			placeholderValue: SelectController.IsMultiple(this.$attrs)
				? this.$attrs.placeholder || SelectController.Placeholder
				: undefined,
		});

		this.choices.passedElement.addEventListener('addItem', this.addItem.bind(this));
		this.choices.passedElement.addEventListener('removeItem', this.removeItem.bind(this));

		if (Array.isArray(list)) {
			const value = this.$attrs.value || 'Value';
			const text = this.$attrs.text || 'Text';

			this.choices.setChoices(list, value, text);

			if (list.includes(this.ngModel) || list.find(x => x[value] === this.ngModel) != null) {
				this.choices.setValueByChoice(this.ngModel);
			}
		}
	}

	public addItem(event: any) {
		const { value } = event.detail;
		const isMultiple = SelectController.IsMultiple(this.$attrs);
		if (this.ngModel != null && isMultiple ? this.ngModel.includes(value) : this.ngModel === value) {
			return;
		}
		this.ngModel = isMultiple ? [value].concat(this.ngModel || []) : value;
		this.$timeout();
	}

	public removeItem(event: any) {
		if (SelectController.IsMultiple(this.$attrs)) {
			if (this.ngModel.length === 0) return;

			const { value } = event.detail;
			this.ngModel = this.ngModel.filter((x: any) => x !== value);
		} else {
			this.ngModel = undefined;
		}
		this.$timeout();
	}
}

export const selectList: InputComponentOptions = {
	type: 'input',
	render(h) {
		const input = h.createElement('select', [], [['name', '{{id}}'], ['id', '{{id}}']]);

		// tslint:disable-next-line:no-invalid-this
		if (SelectController.IsMultiple(this.$attrs)) {
			input.setAttribute('multiple', 'true');
		} else {
			const placeholder = h.createElement('option', [], [['placeholder', 'true']]);
			placeholder.innerText = SelectController.Placeholder;
			input.appendChild(placeholder);
		}

		return input;
	},
	ctrl: SelectController,
	bindings: {
		list: '<',
	},
};
