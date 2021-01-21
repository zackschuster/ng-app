import { h } from '@ledge/jsx';
import { NgInputController, NgInputOptions } from './shared';
import { NgAttributes } from '../attributes';
import { NgService } from '../service';

class SelectController extends NgInputController {
	public static readonly SinglePlaceholder = '----Select One----';
	public static readonly MultiplePlaceholder = '----Select All That Apply----';

	public static IsMultiple($attrs: NgAttributes) {
		return $attrs.hasOwnProperty('multiple') || $attrs.type === 'multiple';
	}

	public static GetPlaceholder($attrs: NgAttributes) {
		return $attrs.placeholder ||
			SelectController.IsMultiple($attrs)
			? SelectController.MultiplePlaceholder
			: SelectController.SinglePlaceholder;
	}

	protected isListOpen = false;
	protected list!: any[];
	protected searchList!: any[];

	private _text!: string;
	private _value!: string;

	public get text() {
		if (typeof this._text !== 'string') {
			const { text = 'Text' } = this.$attrs;
			this._text = text;
		}
		return this._text;
	}

	public get value() {
		if (typeof this._value !== 'string') {
			const { value = 'Value' } = this.$attrs;
			this._value = value;
		}
		return this._value;
	}

	private destroyCurrentWatcher!: () => void;

	private get isMultiple() {
		return SelectController.IsMultiple(this.$attrs);
	}

	public $onInit() {
		if (this.isMobile) {
			this.searchList = this.list;
			return;
		}

		const container = this.$element.querySelector('.select-container') as HTMLDivElement;
		const dropdown = this.$element.querySelector('.select-dropdown') as HTMLDivElement;
		const dropdownlist = this.$element.querySelector('.select-dropdown-list') as HTMLDivElement;
		const input = this.$element.querySelector('input') as HTMLInputElement;

		const updateSearchList = () => {
			if (input.value) {
				const inputValueSplit = input.value.split('');
				this.searchList = this.getSearchList(this.list)
					.filter(x => typeof x[this.text] === 'string')
					.filter(x => {
						const xText = x[this.text].toLowerCase() as string;
						const xIndices = inputValueSplit.map(y => xText.indexOf(y));
						if (xIndices.some(y => y === -1)) {
							return false;
						}
						const xIndicesUnique = [];
						for (const index of xIndices) {
							if (xIndicesUnique.indexOf(index) === -1) {
								xIndicesUnique.push(index);
							} else {
								const lastIndex = xIndicesUnique[xIndicesUnique.lastIndexOf(index)];
								const nextIndex = xText.indexOf(xText.charAt(index), lastIndex + 1);
								if (nextIndex !== -1 && xIndicesUnique.indexOf(nextIndex) === -1) {
									xIndicesUnique.push(nextIndex);
								}
							}
						}
						return xIndicesUnique.length === xIndices.length;
					})
					.sort((x, y) => {
						const xText = x[this.text].toLowerCase();
						const yText = y[this.text].toLowerCase();
						return (
							inputValueSplit.reduce((a, b) => a + xText.indexOf(b), 0) -
							inputValueSplit.reduce((a, b) => a + yText.indexOf(b), 0)
						);
					});
			} else {
				this.searchList = window.angular.copy(this.list);
			}
			this.$scope.$applyAsync();
		};

		input.oninput = () => {
			updateSearchList();
		};

		input.onblur = e => {
			if (e.relatedTarget == null) {
				input.hidden = true;
				dropdownlist.hidden = true;
				dropdown.classList.add('border-bottom-0');
			}
		};

		container.onclick = ({ target }) => {
			if (target instanceof HTMLSelectElement) {
				return;
			}

			if (target instanceof HTMLButtonElement) {
				input.hidden = false;
			}

			input.hidden = !input.hidden;

			if (input.hidden) {
				dropdown.classList.add('border-bottom-0');
			} else {
				dropdown.classList.remove('border-bottom-0');
				input.focus();
			}

			dropdownlist.hidden = input.hidden;
		};

		dropdownlist.onclick = e => {
			let { target } = e as unknown as { target: HTMLElement };
			if (target.nodeName === '#text') {
				target = target.parentElement as HTMLElement;
			}

			const targetIsItem =
				target instanceof HTMLDivElement &&
				target.classList.contains('select-item') &&
				target.parentElement instanceof HTMLDivElement &&
				target.parentElement.classList.contains('select-dropdown-list');

			if (targetIsItem) {
				input.value = '';
				this.select(target.dataset.value);
			}
		};

		this.$scope.$watchCollection(
			() => this.list,
			_ => updateSearchList(),
		);
	}

	public $onDestroy() {
		if (typeof this.destroyCurrentWatcher === 'function') {
			this.destroyCurrentWatcher();
		}
	}

	public getDisplayText(value: any) {
		if (Array.isArray(value)) {
			return;
		}

		if (value == null) {
			return SelectController.GetPlaceholder(this.$attrs);
		}

		// tslint:disable-next-line:triple-equals
		const [item] = this.list.filter(x => x[this.value] == value);
		return item == null ? this.clear() : item[this.text];
	}

	public remove(item: any) {
		// tslint:disable-next-line:triple-equals
		this.ngModel = this.ngModel.filter((x: any) => x != item);
		this.searchList = this.getSearchList(this.list);
	}

	public clear() {
		if (this.isMultiple ? Array.isArray(this.ngModel) && this.ngModel.length > 0 : this.ngModel !== undefined) {
			this.ngModel = this.isMultiple ? [] : undefined;
		}
		this.searchList = this.getSearchList(this.list);
	}

	public select(value: any) {
		if (this.isMultiple) {
			this.ngModel = Array.isArray(this.ngModel)
				? this.ngModel.indexOf(value) !== -1
					? this.ngModel
					: this.ngModel.concat(value)
				: [value];
		} else {
			this.ngModel = value;
		}

		this.searchList = this.getSearchList(this.list);
		this.$scope.$applyAsync();
	}

	private getSearchList(list: any[]) {
		// tslint:disable:triple-equals
		return Array.isArray(this.ngModel)
			? list.filter(x => this.ngModel.every((y: any) => x[this.value] != y))
			: this.ngModel == null
				? window.angular.copy(list)
				: list.filter(x => x[this.value] != this.ngModel);
		// tslint:enable:triple-equals
	}
}

export const selectList: NgInputOptions = {
	type: 'input',
	render() {
		const select = <select class='form-control select-input d-none'></select>;
		const isMultiple = SelectController.IsMultiple(this.$attrs);

		if (isMultiple) {
			select.setAttribute('multiple', 'true');
		} else {
			const placeholder = <option></option> as HTMLOptionElement;
			placeholder.setAttribute('placeholder', 'true');
			placeholder.text = SelectController.GetPlaceholder(this.$attrs);
			placeholder.value = '';

			select.appendChild(placeholder);
		}

		if (NgService.IsMobile()) {
			select.classList.remove('d-none');
			select.setAttribute(
				'ng-options',
				'item[\'{{$ctrl.value}}\'] as item[\'{{$ctrl.text}}\'] for item in $ctrl.searchList track by $index',
			);
			return select;
		}

		const innerlist = <div class={`select-list ${isMultiple ? 'multiple' : 'single'}`}></div>;
		const inner = <div class='select-inner-container'>{select}{innerlist}</div>;
		const selected = <div class='select-item'></div>;

		const btn =
			<button class='select-button'
				ng-attr-aria-label="Remove item: '{{$ctrl.getDisplayText($ctrl.ngModel)}}'"
				ng-click='$ctrl.clear()'>
			</button>;

		if (isMultiple) {
			const sbtn = btn.cloneNode() as HTMLButtonElement;
			sbtn.setAttribute('ng-attr-aria-label', 'Remove item: \'{{$ctrl.getDisplayText(item)}}\'');
			sbtn.setAttribute('ng-click', '$ctrl.remove(item)');

			selected.setAttribute('ng-repeat', 'item in $ctrl.ngModel track by $index');
			selected.setAttribute('aria-selected', 'true');
			selected.innerHTML = `{{$ctrl.getDisplayText(item)}}${sbtn.outerHTML}`;

			const placeholder = <div class='select-item placeholder'
				ng-if='$ctrl.ngModel == null || $ctrl.ngModel.length === 0'></div>;
			placeholder.innerText = SelectController.GetPlaceholder(this.$attrs);

			innerlist.appendChild(placeholder);
		} else {
			selected.setAttribute('ng-class', '{ \'placeholder\': $ctrl.ngModel == null }');
			selected.innerText = '{{$ctrl.getDisplayText($ctrl.ngModel)}}';
		}

		const item = <div class='select-item' ng-repeat='item in $ctrl.searchList track by $index'
			ng-attr-data-value='{{item[$ctrl.value]}}' role='option'></div>;
		item.innerText = '{{item[$ctrl.text]}}';

		const list = <div class='select-dropdown-list' dir='ltr' role='listbox' hidden={true}></div>;

		const input = <input class='select-input'
			type='text'
			autocomplete='off'
			autocapitalize='off'
			spellcheck={false}
			role='textbox'
			aria-autocomplete='list'
			placeholder=''
			title='Select List'
			hidden={true}
		/>;

		const type = `select-${isMultiple ? 'multiple' : 'one'}`;
		const container =
			<div class='select-container'
				data-type={type}
				role='combobox'
				tabIndex={0}
				aria-autocomplete='list'
				aria-haspopup='true'
				aria-expanded='false'
				dir='ltr'
				ng-attr-name={`${type}_{{$ctrl.uniqueId}}`}
				ng-attr-id={`${type}_{{$ctrl.uniqueId}}`}>
				{inner}
				<div class='select-dropdown border-bottom-0' aria-expanded='false'>
					{input}
					{list}
				</div>
			</div>;

		innerlist.appendChild(selected);
		innerlist.appendChild(btn);

		list.appendChild(item);

		return container;
	},
	controller: SelectController,
	bindings: {
		list: '<',
	},
};

const stylesheet = document.createElement('style');
export function addSelectListStylesheet() {
	if (stylesheet.parentElement === document.head) {
		return;
	}
	stylesheet.textContent = `
		.select-container {
			border: 1px solid #ced4da;
			cursor: pointer;
			position: relative;
		}
		.select-container:last-child {
			margin-bottom: 0;
		}
		.select-container.is-disabled .select-input {
			background-color: #eaeaea;
			cursor: not-allowed;
			user-select: none;
		}
		.select-container.is-disabled .select-item {
			cursor: not-allowed;
		}
		.select-container[data-type='select-one']:after {
			content: '';
			height: 0;
			width: 0;
			border-style: solid;
			border-color: #333 transparent transparent transparent;
			border-width: 5px;
			position: absolute;
			right: 11.5px;
			top: 50%;
			margin-top: -2.5px;
			pointer-events: none;
		}
		.select-container[data-type='select-one']:after.is-open {
			border-color: transparent transparent #333 transparent;
			margin-top: -7.5px;
		}
		.select-container > .select-inner-container {
			display: inline-block;
			vertical-align: top;
			width: 100%;
			border-radius: 0.23rem;
			overflow: hidden;
		}
		.select-container .select-input {
			display: block;
			width: 100%;
			padding: 10px;
			margin: 0;
			border: 0;
			border-bottom: 1px solid #ced4da;
			border-top: 1px solid #ced4da;
			border-radius: 0;
		}
		.select-container .select-button {
			background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMSAyMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjMDAwIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yLjU5Mi4wNDRsMTguMzY0IDE4LjM2NC0yLjU0OCAyLjU0OEwuMDQ0IDIuNTkyeiIvPjxwYXRoIGQ9Ik0wIDE4LjM2NEwxOC4zNjQgMGwyLjU0OCAyLjU0OEwyLjU0OCAyMC45MTJ6Ii8+PC9nPjwvc3ZnPg==);
			border: 0;
			background-color: transparent;
			background-repeat: no-repeat;
			background-position: center;
			cursor: pointer;
			display: inline-flex;
			position: relative;
			padding: 0;
			background-size: 0.75rem;
			height: 1rem;
			color: #000;
			width: 0.75rem;
			opacity: 0.5;
		}
		.select-container .select-button:hover,
		.select-container .select-button:focus {
			opacity: 1;
		}
		.select-container .select-button:focus {
			outline: none;
		}
		.select-container .select-item.placeholder {
			color: gray;
		}
		.select-container .select-item:hover > .select-button {
			opacity: 1;
		}
		.select-container .select-list,
		.select-container .select-dropdown {
			display: flex;
			align-items: center;
		}
		.select-container .select-list.single,
		.select-container .single.select-dropdown {
			padding: 0.275rem;
		}
		.select-container .select-list.single > .select-item,
		.select-container .single.select-dropdown > .select-item {
			padding-left: 0.23rem;
			width: 100%;
		}
		.select-container .select-list.single > .select-button,
		.select-container .single.select-dropdown > .select-button {
			right: 1.5rem;
		}
		.select-container .select-list.multiple,
		.select-container .multiple.select-dropdown {
			flex-wrap: wrap;
			padding: 0.275rem;
		}
		.select-container .select-list.multiple > .select-item,
		.select-container .multiple.select-dropdown > .select-item {
			border-radius: 1rem;
			background-color: darkblue;
			color: #fff;
			display: inline-flex;
			align-items: center;
			word-break: break-all;
			padding: 0 0.75rem;
			margin: 0 0.1rem;
			opacity: 1;
			width: max-content;
		}
		.select-container .select-list.multiple > .select-item.is-highlighted,
		.select-container .multiple.select-dropdown > .select-item.is-highlighted,
		.select-container .select-list.multiple > .select-item:hover,
		.select-container .multiple.select-dropdown > .select-item:hover {
			background-color: blue;
		}
		.select-container .select-list.multiple > .select-item.placeholder,
		.select-container .multiple.select-dropdown > .select-item.placeholder {
			color: gray;
			background-color: inherit;
			border: none;
			padding: 0;
			width: 100%;
		}
		.is-disabled .select-container .select-list.multiple > .select-item,
		.is-disabled .select-container .multiple.select-dropdown > .select-item {
			background-color: #aaa;
			border: 1px solid #919191;
		}
		.select-container .select-list.multiple > .select-item > .select-button,
		.select-container .multiple.select-dropdown > .select-item > .select-button {
			margin-left: 0.5rem;
			align-self: center;
			opacity: 0.75;
			background-image: url(data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjEiIGhlaWdodD0iMjEiIHZpZXdCb3g9IjAgMCAyMSAyMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSIjRkZGIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0yLjU5Mi4wNDRsMTguMzY0IDE4LjM2NC0yLjU0OCAyLjU0OEwuMDQ0IDIuNTkyeiIvPjxwYXRoIGQ9Ik0wIDE4LjM2NEwxOC4zNjQgMGwyLjU0OCAyLjU0OEwyLjU0OCAyMC45MTJ6Ii8+PC9nPjwvc3ZnPg==);
		}
		.select-container .select-list.multiple > .select-button,
		.select-container .multiple.select-dropdown > .select-button {
			position: absolute;
			right: 1rem;
		}
		.select-container .select-dropdown {
			z-index: 1;
			position: absolute;
			width: 100%;
			background-color: #fff;
			border-bottom: 1px solid #ced4da;
			border-left: 1px solid #ced4da;
			border-right: 1px solid #ced4da;
			margin-top: -1px;
			border-bottom-left-radius: 0.23rem;
			border-bottom-right-radius: 0.23rem;
			overflow: hidden;
			word-break: break-all;
			display: block;
		}
		.select-container .select-dropdown > .select-dropdown-list {
			flex-direction: column;
			position: relative;
			max-height: 300px;
			overflow: auto;
			-webkit-overflow-scrolling: touch;
			will-change: scroll-position;
		}
		.select-container .select-dropdown > .select-dropdown-list > .select-item {
			position: relative;
			padding: 10px;
			width: 100%;
		}
		@media (min-width: 640px) {
			.select-container .select-dropdown > .select-dropdown-list > .select-item:after {
				content: attr(data-select-text);
				opacity: 0;
				position: absolute;
				right: 10px;
				top: 50%;
				transform: translateY(-50%);
			}
		}
		.select-container .select-dropdown > .select-dropdown-list > .select-item.is-highlighted,
		.select-container .select-dropdown > .select-dropdown-list > .select-item:hover {
			background-color: #f2f2f2;
		}
		.select-container .select-dropdown > .select-dropdown-list > .select-item.is-highlighted:after,
		.select-container .select-dropdown > .select-dropdown-list > .select-item:hover:after {
			opacity: 0.5;
		}
	`;
	document.head.appendChild(stylesheet);
}
