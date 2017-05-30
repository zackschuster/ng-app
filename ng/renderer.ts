import { IAttributes } from 'angular';
import { NgController } from 'core/ng/controller';

/* @ngInject */
export class NgRenderer extends NgController {
	public baseInputAttrs: [string, string][] = [
		['id', '{{id}}'],
		['maxlength', '{{maxlength}}'],
		['placeholder', '{{placeholder}}'],
		['ng-model', '$ctrl.ngModel'],
		['ng-required', 'required || $ctrl.ngRequired'],
		['ng-disabled', 'disabled || $ctrl.ngdisabled'],
		['ng-readonly', 'readonly || $ctrl.ngreadonly'],
	];
	private modelId: string;

	public registerElement($element: JQuery) {
		this.$element = $element;
		return this;
	}

	// tslint:disable-next-line:max-line-length
	public createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, classes: string[] = [], attrs: [string, string][] = null) {
		const $el = document.createElement<T>(tagName);

		$el.classList.add(...classes);

		if (attrs != null) {
			for (const [key, value] of attrs) {
				$el.setAttribute(key, value);
			}
		}

		return $el;
	}

	public createInput(type: string = 'text', attrs: [string, string][] = []) {
		const $class = type === 'checkbox' ? ['form-check-input'] : ['form-control'];
		return this.createElement('input', $class, [
			...attrs,
			...this.baseInputAttrs,
			['type', type],
		]);
	}

	public createTextArea() {
		return this.createElement('textarea', ['form-control'], [
			...this.baseInputAttrs,
			['msd-elastic', ''],
			['name', '{{id}}'],
			['maxlength', '{{maxlength}}'],
			['placeholder', '{{placeholder}}'],
		]);
	}

	public createIcon(icon: string) {
		return this.createElement('span', ['fa', 'fa-' + icon], [['aria-hidden', 'true']]);
	}

	public createLabel(classList: string[]) {
		return this.createElement('label', classList, [['for', '{{id}}']]);
	}

	public isSrOnly($attrs: IAttributes) {
		return $attrs.hasOwnProperty('srOnly');
	}

	public modelIdentifier($attrs: IAttributes, opts = { unique: true }) {
		return this.getId($attrs) + (opts.unique ? '_' + this.$scope.$id : '');
	}

	public getId($attrs: IAttributes) {
		if (this.modelId == null) {
			this.modelId = ($attrs.ngModel as string).split('.').pop();
		}
		return this.modelId;
	}

	public getIdForLabel($attrs: IAttributes) {
		return this.getId($attrs).split(/(?=[A-Z])/).join(' ');
	}
}
