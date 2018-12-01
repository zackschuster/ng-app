import Choices from 'choices.js';

import { NgInputController, NgInputOptions } from './shared';
import { NgService } from '../services';

class SelectController extends NgInputController {
	public static readonly SinglePlaceholder = '----Select One----';
	public static readonly MultiplePlaceholder = '----Select All That Apply----';

	public static IsMultiple($attrs: angular.IAttributes) {
		return $attrs.hasOwnProperty('multiple') || $attrs.type === 'multiple';
	}

	public static GetPlaceholder($attrs: angular.IAttributes) {
		return $attrs.placeholder ||
			SelectController.IsMultiple($attrs)
				? SelectController.MultiplePlaceholder
				: SelectController.SinglePlaceholder;
	}

	protected list: any[];
	protected choices: Choices;

	// tslint:disable:variable-name
	private _text: string;
	private _value: string;
	// tslint:enable:variable-name

	public get text() {
		if (typeof this._text !== 'string') {
			const { text = 'Text' } = this.$attrs;
			this._text = text;
		}
		return this._text;
	}

	public get value() {
		if (typeof this._text !== 'string') {
			const { value = 'Value' } = this.$attrs;
			this._value = value;
		}
		return this._value;
	}

	private destroyCurrentWatcher: () => void;

	private get isMultiple() {
		return SelectController.IsMultiple(this.$attrs);
	}

	public $onInit() {
		const select = this.$element.querySelector('select');

		if (select instanceof HTMLSelectElement && select.getAttribute('ng-options') == null) {
			this.choices = this.makeSelectList(select);

			this.$scope.$watchCollection(
				_ => this.list,
				_ => {
					if (Array.isArray(_) === false) {
						this.$log.devWarning(`List not passed to select-list #${this.uniqueId}`);
						return;
					}

					if (typeof this.destroyCurrentWatcher !== 'function') {
						this.destroyCurrentWatcher = this.createWatcher();
					}

					this.choices.setChoices(_, this.value, this.text, true);
				},
			);
		}
	}

	public $onDestroy() {
		if (this.choices instanceof Choices) {
			this.choices.destroy();
		}

		if (typeof this.destroyCurrentWatcher === 'function') {
			this.destroyCurrentWatcher();
		}
	}

	public makeSelectList(el: HTMLSelectElement) {
		const { placeholder = SelectController.GetPlaceholder(this.$attrs) } = this.$attrs;
		const choices = new Choices(el, {
			removeItemButton: true,
			shouldSort: false,
			itemSelectText: '',
			addItemText: '',
			placeholderValue: this.isMultiple
				? placeholder
				: null,
		});

		choices.passedElement.element.addEventListener<'addItem'>('addItem', ({ detail: { value } }) => {
			if (this.ngModel != null && (this.isMultiple ? this.ngModel.includes(value) : this.ngModel === value)) {
				return;
			}

			this.ngModel = this.isMultiple
				? [value].concat(this.ngModel == null ? [] : this.ngModel)
				: value;

			this.$timeout();
		});

		choices.passedElement.element.addEventListener<'removeItem'>('removeItem', ({ detail: { value } }) => {
			if (this.isMultiple) {
				if (this.ngModel.length === 0) return;

				this.ngModel = this.ngModel.filter((x: any) => x !== value);
			} else {
				this.ngModel = undefined;
			}
			this.$timeout();
		});

		const input = this.$element.querySelector('input') as HTMLInputElement;
		const ngModelParts = this.$attrs.ngModel.split('.');
		const ngModel = ngModelParts[ngModelParts.length - 1];

		input.setAttribute('aria-label', `${ngModel} list selection`);

		return choices;
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

export const selectList: NgInputOptions = {
	type: 'input',
	render(h) {
		const select = h.createElement('select', ['form-control']);
		select.setAttribute('ng-attr-name', '{{id}}_{{$ctrl.uniqueId}}');
		select.setAttribute('ng-attr-id', '{{id}}_{{$ctrl.uniqueId}}');

		if (SelectController.IsMultiple(this.$attrs)) {
			select.setAttribute('multiple', 'true');
		} else {
			const placeholder = h.createElement('option');

			placeholder.setAttribute('placeholder', 'true');
			placeholder.text = SelectController.GetPlaceholder(this.$attrs);
			placeholder.value = '';

			select.appendChild(placeholder);
		}

		if (NgService.IsMobile()) {
			select.setAttribute('ng-model', '$ctrl.ngModel');
			select.setAttribute('ng-options', `item['{{$ctrl.value}}'] as item['{{$ctrl.text}}'] for item in $ctrl.list track by $index`);
		}

		return select;
	},
	ctrl: SelectController,
	bindings: {
		list: '<',
	},
};
