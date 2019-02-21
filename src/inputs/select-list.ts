import { NgInputController, NgInputOptions } from './shared';
import { NgService } from '../services';
import { NgAttributes } from '../controller';

class SelectController extends NgInputController {
	public static readonly SinglePlaceholder = '----Select One----';
	public static readonly MultiplePlaceholder = '----Select All That Apply----';

	public static IsMultiple($attrs: NgAttributes) {
		return $attrs.hasOwnProperty('multiple') || $attrs.type === 'multiple';
	}

	public static GetPlaceholder($attrs: NgAttributes) {
		return $attrs.placeholder ||
			this.IsMultiple($attrs)
			? this.MultiplePlaceholder
			: this.SinglePlaceholder;
	}

	protected isListOpen = false;
	protected list: any[];

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

		if (this.isMultiple && select instanceof HTMLSelectElement) {
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
				},
			);
		} else {
			const container = this.$element.querySelector('.select-container') as HTMLDivElement;
			const innerContainer = this.$element.querySelector('.select-inner-container') as HTMLDivElement;
			const dropdown = this.$element.querySelector('.select-list-dropdown') as HTMLDivElement;
			const dropdownlist = this.$element.querySelector('.select-list-dropdown > .select-list') as HTMLDivElement;
			const input = this.$element.querySelector('input') as HTMLInputElement;

			let shouldFocusInput = true;
			innerContainer.onclick = e => {
				if (e.target instanceof HTMLButtonElement) {
					shouldFocusInput = true;
					return;
				}

				if (shouldFocusInput) {
					input.hidden = false;
					input.focus();
				}

				shouldFocusInput = true;
			};

			input.onfocus = () => {
				dropdown.classList.remove('border-top-0');
				dropdown.classList.remove('border-bottom-0');
				dropdownlist.hidden = false;
			};

			input.onblur = e => {
				const { explicitOriginalTarget: target } = e as any;
				const targetIsItem = target instanceof HTMLDivElement && target.classList.contains('select-item-choice');

				if (targetIsItem || target.parentElement.classList.contains('select-item-choice')) {
					this.select(targetIsItem ? target.dataset.value : target.parentElement.dataset.value);
					shouldFocusInput = true;
				} else {
					shouldFocusInput = e.relatedTarget !== container && e.relatedTarget !== innerContainer;
				}

				dropdown.classList.add('border-top-0');
				dropdown.classList.add('border-bottom-0');
				dropdownlist.hidden = true;

				input.hidden = true;
			};
		}
	}

	public $onDestroy() {
		if (typeof this.destroyCurrentWatcher === 'function') {
			this.destroyCurrentWatcher();
		}
	}

	public getDisplayText() {
		if (this.ngModel == null) {
			return SelectController.GetPlaceholder(this.$attrs);
		}

		// tslint:disable-next-line:triple-equals
		return this.list.find(x => x[this.value] == this.ngModel)[this.text];
	}

	public removeItem() {
		this.ngModel = undefined;
	}
	public select(value: any) {
		this.ngModel = value;
	}

	public checkHighlight(item: any) {
		return this.isMultiple
			? this.ngModel.includes(item[this.value])
			// tslint:disable-next-line:triple-equals
			: this.ngModel == item[this.value];
	}

	// public makeSelectList(el: HTMLSelectElement) {
	// 	const { placeholder = SelectController.GetPlaceholder(this.$attrs) } = this.$attrs;
	// 	const choices = new Choices(el, {
	// 		classNames: {
	// 			hiddenState: 'd-none',
	// 		},
	// 		removeItemButton: true,
	// 		shouldSort: false,
	// 		itemSelectText: '',
	// 		addItemText: '',
	// 		placeholderValue: this.isMultiple
	// 			? placeholder
	// 			: null,
	// 	});

	// 	choices.passedElement.element.addEventListener('addItem', ({ detail: { value } }) => {
	// 		if (this.ngModel != null && (this.isMultiple ? this.ngModel.includes(value) : this.ngModel === value)) {
	// 			return;
	// 		}

	// 		this.ngModel = this.isMultiple
	// 			? [value].concat(this.ngModel == null ? [] : this.ngModel)
	// 			: value;

	// 		this.$scope.$applyAsync();
	// 	});

	// 	choices.passedElement.element.addEventListener('removeItem', ({ detail: { value } }) => {
	// 		if (this.isMultiple) {
	// 			if (this.ngModel.length === 0) return;

	// 			this.ngModel = this.ngModel.filter((x: any) => x !== value);
	// 		} else {
	// 			this.ngModel = undefined;
	// 		}
	// 		this.$scope.$applyAsync();
	// 	});

	// 	const input = this.$element.querySelector('input') as HTMLInputElement;
	// 	const ngModelParts = this.$attrs.ngModel.split('.');
	// 	const ngModel = ngModelParts[ngModelParts.length - 1];

	// 	input.setAttribute('aria-label', `${ngModel} list selection`);

	// 	return choices;
	// }

	private createWatcher() {
		// return this.$scope.$watch(
		// 	_ => this.ngModel,
		// 	(_, prev: number[] = []) => {
		// 		const isReset = _ == null || (this.isMultiple ? _.length === 0 : !_);

		// 		if (this.isMultiple) {
		// 			if (isReset) {
		// 				this.choices.removeActiveItems(Infinity);
		// 			} else if (prev.filter(x => _.includes(x) === false).length > 0) {
		// 				this.destroyCurrentWatcher();
		// 				this.choices.removeActiveItems(Infinity);
		// 				this.destroyCurrentWatcher = this.createWatcher();
		// 			}
		// 			this.choices.setChoiceByValue(_);
		// 		} else {
		// 			if (isReset) {
		// 				this.choices.setChoiceByValue('');
		// 			} else if (this.list.find(x => (x[this.value] || x) === _) != null) {
		// 				this.choices.setChoiceByValue(_);
		// 			}
		// 		}
		// 	},
		// );
		return () => { return; };
	}
}

export const selectList: NgInputOptions = {
	type: 'input',
	render(h) {
		const select = h.createHtmlElement(
			'select',
			['form-control', 'select-input', 'd-none'],
			[
				['ng-attr-name', '{{id}}_{{$ctrl.uniqueId}}'],
				['ng-attr-id', '{{id}}_{{$ctrl.uniqueId}}'],
				['ng-model', '$ctrl.ngModel'],
			],
		);

		const isMultiple = SelectController.IsMultiple(this.$attrs);
		if (isMultiple) {
			select.setAttribute('multiple', 'true');
		} else {
			const placeholder = h.createHtmlElement('option');

			placeholder.setAttribute('placeholder', 'true');
			placeholder.text = SelectController.GetPlaceholder(this.$attrs);
			placeholder.value = '';

			select.appendChild(placeholder);
		}

		if (NgService.IsMobile()) {
			select.classList.remove('d-none');
			select.setAttribute(
				'ng-options',
				'item[\'{{$ctrl.value}}\'] as item[\'{{$ctrl.text}}\'] for item in $ctrl.list track by $index',
			);
			return select;
		}

		const type = `select-${isMultiple ? 'multiple' : 'one'}`;
		const container = h.createHtmlElement('div', ['select-container'],
			[
				['data-type', type],
				['role', 'combobox'],
				['tabindex', '0'],
				['aria-autocomplete', 'list'],
				['aria-haspopup', 'true'],
				['aria-expanded', 'false'],
				['dir', 'ltr'],
				['ng-attr-name', `${type}_{{$ctrl.uniqueId}}`],
				['ng-attr-id', `${type}_{{$ctrl.uniqueId}}`],
			],
		);

		const inner = h.createHtmlElement('div', ['select-inner-container']);
		inner.appendChild(select);

		const innerlist = h.createHtmlElement('div', ['select-list', isMultiple ? 'multiple' : 'single']);
		const selected = h.createHtmlElement('div',
			[
				'select-item',
				'select-item-selectable',
			],
			[
				['aria-selected', 'true'],
			],
		);
		selected.innerText = '{{$ctrl.getDisplayText()}}';

		const btn = h.createHtmlElement('button', ['select-button'],
			[
				['ng-attr-aria-label', 'Remove item: \'{{$ctrl.getDisplayText()}}\''],
				['ng-click', '$ctrl.removeItem()'],
			],
		);
		btn.innerText = 'Remove Item';

		selected.appendChild(btn);
		innerlist.appendChild(selected);
		inner.appendChild(innerlist);
		container.appendChild(inner);

		const dropdown = h.createHtmlElement('div',
			[
				'select-list',
				'select-list-dropdown',
				'border-bottom-0',
				'border-top-0',
			],
			[
				['aria-expanded', 'false'],
			],
		);

		const input = h.createHtmlElement('input', ['select-input'],
			[
				['type', 'text'],
				['autocomplete', 'off'],
				['autocapitalize', 'off'],
				['spellcheck', 'false'],
				['role', 'textbox'],
				['aria-autocomplete', 'list'],
				['placeholder', ''],
				['aria-label', 'Select List'],
				['hidden', 'true'],
			],
		);

		const list = h.createHtmlElement('div', ['select-list'],
			[
				['dir', 'ltr'],
				['role', 'listbox'],
				['hidden', 'true'],
			],

		);
		const item = h.createHtmlElement('div',
			[
				'select-item',
				'select-item-choice',
				'select-item-selectable',
			],
			[
				['ng-class', '{ \'is-highlighted\': $ctrl.checkHighlight(item) }'],
				['ng-repeat', `item in $ctrl.list track by $index`],
				['ng-attr-data-value', '{{item[$ctrl.value]}}'],
				['ng-attr-aria-selected', '{{$ctrl.checkHighlight(item)}}'],
				['role', 'option'],
			],
		);
		item.innerText = '{{item[$ctrl.text]}}';

		list.appendChild(item);
		dropdown.appendChild(input);
		dropdown.appendChild(list);
		container.appendChild(dropdown);

		return container;
	},
	controller: SelectController,
	bindings: {
		list: '<',
	},
};
