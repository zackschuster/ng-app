import Choices, { Choices as _Choices } from 'choices.js';
import { isMobile } from '@ledge/is-mobile';
import { IAttributes } from 'angular';

import { InputComponentOptions } from '../options';
import { NgComponentController } from '../../controller';

class SelectController extends NgComponentController {
	public static readonly SinglePlaceholder = '----Select One----';
	public static readonly MultiplePlaceholder = '----Select All That Apply----';

	public static IsMultiple($attrs: IAttributes) {
		return $attrs.hasOwnProperty('multiple') || $attrs.type === 'multiple';
	}

	public static GetPlaceholder($attrs: IAttributes) {
		return $attrs.placeholder || SelectController.IsMultiple($attrs)
			? SelectController.MultiplePlaceholder
			: SelectController.SinglePlaceholder;
	}

	protected list: any[];
	protected choices: Choices;

	private text: string;
	private value: string;
	private destroyCurrentWatcher: () => void;

	private get isMultiple() {
		return SelectController.IsMultiple(this.$attrs);
	}

	public $onInit() {
		const { value = 'Value', text = 'Text' } = this.$attrs;

		this.value = value;
		this.text = text;
	}

	public $postLink() {
		const select = this.$element.querySelector('select') as HTMLSelectElement;
		this.$scope.$watchCollection(
			_ => this.list,
			_ => {
				this.makeSelectList(select, this.list);
			},
		);
	}

	public makeSelectList(el: HTMLSelectElement, list: any[]) {
		if (this.choices != null) {
			this.choices.destroy();
			this.destroyCurrentWatcher();
		}

		if (el.getAttribute('ng-options') != null) {
			return;
		}

		if (Array.isArray(list)) {
			this.$timeout().finally(() => {
				const opts: Partial<_Choices.Options> = {
					removeItemButton: true,
					itemSelectText: '',
					addItemText: '',
				};

				if (this.isMultiple) {
					opts.placeholderValue = this.$attrs.placeholder || SelectController.GetPlaceholder(this.$attrs);
				}

				this.choices = new Choices(el, opts);
				this.choices.setChoices(list, this.value, this.text);

				this.choices.passedElement.element.addEventListener<'addItem'>('addItem', ({ detail: { value } }) => {
					if (this.ngModel != null && (this.isMultiple ? this.ngModel.includes(value) : this.ngModel === value)) {
						return;
					}

					this.ngModel = this.isMultiple
						? [value].concat(this.ngModel == null ? [] : this.ngModel)
						: value;

					this.$timeout();
				});

				this.choices.passedElement.element.addEventListener<'removeItem'>('removeItem', ({ detail: { value } }) => {
					if (this.isMultiple) {
						if (this.ngModel.length === 0) return;

						this.ngModel = this.ngModel.filter((x: any) => x !== value);
					} else {
						this.ngModel = undefined;
					}
					this.$timeout();
				});

				this.destroyCurrentWatcher = this.createWatcher();

				const input = this.$element.querySelector('input') as HTMLInputElement;
				const ngModelParts = this.$attrs.ngModel.split('.');
				const ngModel = ngModelParts[ngModelParts.length - 1];

				input.setAttribute('aria-label', `${ngModel} list selection`);
			});
		}
	}

	private createWatcher() {
		return this.$scope.$watch(
			_ => this.ngModel,
			(_, prev: number[] = []) => {
				const isReset = _ == null || (this.isMultiple ? _.length === 0 : !_);

				if (this.isMultiple) {
					if (isReset) {
						this.choices.removeActiveItems(Infinity);
					} else if (prev.filter(x => _.includes(x) === false).length > 0) {
						this.destroyCurrentWatcher();
						this.choices.removeActiveItems(Infinity);
						this.destroyCurrentWatcher = this.createWatcher();
					}
					this.choices.setChoiceByValue(_);
				} else {
					if (isReset) {
						this.choices.setChoiceByValue('');
					} else if (this.list.find(x => (x[this.value] || x) === _) != null) {
						this.choices.setChoiceByValue(_);
					}
				}
			},
		);
	}
}

export const selectList: InputComponentOptions = {
	type: 'input',
	render(h) {
		const input = h.createElement('select', [], [
			['ng-attr-name', '{{id}}_{{$ctrl.uniqueId}}'],
			['ng-attr-id', '{{id}}_{{$ctrl.uniqueId}}'],
		]);

		if (SelectController.IsMultiple(this.$attrs)) {
			input.setAttribute('multiple', 'true');
		} else {
			const placeholder = h.createElement('option', [], [['placeholder', 'true']]);
			placeholder.innerText = SelectController.GetPlaceholder(this.$attrs);
			placeholder.value = '';
			input.appendChild(placeholder);
		}

		if (isMobile()) {
			const text = this.$attrs.text || 'Text';
			const value = this.$attrs.value || 'Value';
			input.classList.add('form-control');
			input.setAttribute('ng-options', `item.${value} as item.${text} for item in $ctrl.list`);
			input.setAttribute('ng-model', `$ctrl.ngModel`);
			input.removeAttribute('ng-show');
		}

		return input;
	},
	ctrl: SelectController,
	bindings: {
		list: '<',
	},
};
