// import { NgController } from 'core/ng/controller';
import { Renderer } from 'core/models';

/* @ngInject */
export class NgRenderer implements Renderer {
	public baseInputAttrs: [string, string][] = [
		['id', '{{id}}'],
		['ng-model', '$ctrl.ngModel'],
		['ng-required', 'required || $ctrl.ngRequired'],
		['ng-disabled', 'disabled || $ctrl.ngDisabled'],
		['ng-readonly', 'readonly || $ctrl.ngReadonly'],
	];

	public nameAttr: [string, string] = ['name', '{{id}}'];

	// tslint:disable-next-line:max-line-length
	public createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, classes: string[] = [], attrs: [string, string][] = null) {
		const $el = document.createElement(tagName);

		$el.classList.add(...classes);

		if (attrs != null) {
			for (const [key, value] of attrs) {
				$el.setAttribute(key, value);
			}
		}

		return $el;
	}

	public createInput(type: string = 'text', attrs: [string, string][] = []) {
		const $isRadio = type === 'radio';
		const $isCheckbox = type === 'checkbox';
		const $class = $isRadio || $isCheckbox ? ['form-check-input'] : ['form-control'];

		if ($isRadio) {
			attrs.pop();
			attrs.unshift(['id', '{{id}}{{$index}}']);
			attrs.push(this.nameAttr);
		}

		if (!$isRadio && !$isCheckbox) {
			attrs.push(['maxlength', '{{maxlength}}'], ['placeholder', '{{placeholder}}']);
		}

		return this.createElement('input', $class, [
			...attrs,
			...this.baseInputAttrs,
			['type', type],
		]);
	}

	public createTextArea() {
		return this.createElement('textarea', ['form-control'], [
			...this.baseInputAttrs,
			this.nameAttr,
			['msd-elastic', ''],
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

	public createSlot(name: string) {
		return this.createElement('div', [], [['ng-transclude', name]]);
	}
}
