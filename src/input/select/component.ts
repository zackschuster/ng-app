// tslint:disable:no-invalid-this
import 'element-closest';
import * as Choices from 'choices.js';
import { IAttributes } from 'angular';
import { Callback } from '@ledge/types';
import { NgComponentController } from '../../controller';
import { InputComponentOptions } from '../../..';

class SelectController extends NgComponentController {
	public static Placeholder = '----Select One----';
	public static IsMultiple($attrs: IAttributes) {
		return $attrs.hasOwnProperty('multiple') || $attrs.type === 'multiple';
	}

	public list: any[];
	public showChoices: boolean;
	public choices: Choices;

	private isMultiple: boolean;
	private text: string;
	private value: string;
	private onChange: Callback;

	public $postLink() {
		this.isMultiple = SelectController.IsMultiple(this.$attrs);
		this.value = this.$attrs.value || 'Value';
		this.text = this.$attrs.text || 'Text';

		const $select = this.$element.getElementsByTagName('select').item(0);

		this.$scope.$watch(
			_ => this.list,
			_ => this.makeSelectList($select, this.list),
			true,
		);
	}

	public makeSelectList(el: HTMLSelectElement, list: any[]) {
		if (this.choices != null) {
			this.choices.destroy();
		}

		if (Array.isArray(list)) {
			this.$timeout().finally(() => {
				this.choices = this.makeChoices(el);
				this.choices.setChoices(list, this.value, this.text);

				this.showChoices = true;

				this.$scope.$watch(
					_ => this.ngModel,
					_ => {
						let current: any = this.choices.getValue();
						if (!Array.isArray(current)) {
							current = current.value;
						}

						const isReset = _ == null || (this.isMultiple ? _.length === 0 : !_);

						if (isReset) {
							if (this.isMultiple) {
								this.choices.removeActiveItems();
							} else if (current !== '') {
								this.choices.setValueByChoice('');
							}
						} else if (current !== _ && this.list.find(x => (x[this.value] || x) === _) != null) {
							this.choices.setValueByChoice(_);
						}

						if (this.onChange != null) {
							this.onChange(_);
						}
					},
				);
			});
		}
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

	private makeChoices(el: HTMLSelectElement, isMultiple: boolean = this.isMultiple) {
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
		const input = h.createElement('select', [], [
			['name', '{{id}}'], ['id', '{{id}}'],
			['ng-show', '$ctrl.showChoices === true'],
		]);

		if (SelectController.IsMultiple(this.$attrs)) {
			input.setAttribute('multiple', 'true');
		} else {
			const placeholder = h.createElement('option', [], [['placeholder', 'true']]);
			placeholder.innerText = SelectController.Placeholder;
			placeholder.value = '';
			input.appendChild(placeholder);
		}

		return input;
	},
	ctrl: SelectController,
	bindings: {
		list: '<',
		onChange: '<',
	},
};
