// tslint:disable:no-invalid-this
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

	public async makeSelectList(el: HTMLSelectElement, list: any[]) {
		if (this.choices != null) {
			this.choices.destroy();
		}

		const value = this.$attrs.value || 'Value';
		const text = this.$attrs.text || 'Text';

		const isMultiple = SelectController.IsMultiple(this.$attrs);

		this.$timeout().finally(() => {
			this.choices = this.makeChoices(el, isMultiple);

			if (Array.isArray(list)) {
				if (isMultiple) {
					this.choices.setChoices(list, value, text);
				}

				const item = list[0];
				const isObjectArray = item != null && item.toString() === '[object Object]';
				const isValueNumber = isObjectArray ? Number.isInteger(item[value]) : Number.isInteger(item);
				const ngModel = isValueNumber ? Number(this.ngModel) : this.ngModel.toString();

				const choice = list.find(x => {
					const val = isObjectArray ? x[value] : x;
					return val === ngModel;
				});

				if (choice != null) {
					this.choices.setValueByChoice(ngModel.toString());
				}
			}
		});
	}

	private addItem(event: any) {
		const { value } = event.detail;
		const isMultiple = SelectController.IsMultiple(this.$attrs);
		if (this.ngModel != null && (isMultiple ? this.ngModel.includes(value) : this.ngModel === value)) {
			return;
		}
		this.ngModel = isMultiple ? [value].concat(this.ngModel || []) : value;
		this.$timeout();
	}

	private removeItem(event: any) {
		if (SelectController.IsMultiple(this.$attrs)) {
			if (this.ngModel.length === 0) return;

			const { value } = event.detail;
			this.ngModel = this.ngModel.filter((x: any) => x !== value);
		} else {
			this.ngModel = undefined;
		}
		this.$timeout();
	}

	private makeChoices(el: HTMLSelectElement, isMultiple: boolean) {
		const opts: Choices.Options = { removeItemButton: true, itemSelectText: '' };

		if (isMultiple) {
			opts.placeholderValue = this.$attrs.placeholder || SelectController.Placeholder;
		}

		const choices = new Choices(el, opts);

		choices.passedElement.addEventListener('addItem', this.addItem.bind(this));
		choices.passedElement.addEventListener('removeItem', this.removeItem.bind(this));

		return choices;
	}
}

export const selectList: InputComponentOptions = {
	type: 'input',
	render(h) {
		const input = h.createElement('select', [], [['name', '{{id}}'], ['id', '{{id}}']]);

		if (SelectController.IsMultiple(this.$attrs)) {
			input.setAttribute('multiple', 'true');
		} else {
			const placeholder = h.createElement('option', [], [['placeholder', 'true']]);
			placeholder.innerText = SelectController.Placeholder;
			placeholder.value = '';
			input.appendChild(placeholder);

			const repeaterOption = h.createElement('option', [], [
				['ng-repeat', 'item in $ctrl.list'],
				['ng-value', `{{item.${this.$attrs.value || 'Value'}}}`],
			]);
			repeaterOption.innerText = `{{item.${this.$attrs.text || 'Text'}}}`;
			input.appendChild(repeaterOption);

			input.classList.add('form-control', 'choices__input');
		}

		return input;
	},
	ctrl: SelectController,
	bindings: {
		list: '<',
	},
};
