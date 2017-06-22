import { Renderer } from '../models';

/* @ngInject */
export class NgRenderer implements Renderer {
	public baseInputAttrs: [string, string][] = [
		['id', '{{id}}'],
		['ng-model', '$ctrl.ngModel'],
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
		const $isFormCheck = $isRadio || $isCheckbox;

		const $class = $isFormCheck ? ['form-check-input'] : ['form-control'];

		// parens for syntax highlighting
		const inputAttrs: [string, string][] = [...(this.baseInputAttrs), ...attrs, ['type', type]];

		if ($isFormCheck) {
			inputAttrs.shift();
			if ($isRadio) {
				inputAttrs.unshift(['id', '{{id}}{{$index}}']);
				inputAttrs.push(this.nameAttr);
			}
		} else {
			attrs.push(['maxlength', '{{maxlength}}'], ['placeholder', '{{placeholder}}']);
		}

		return this.createElement('input', $class, inputAttrs);
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

	public createIcon(icon: string, prefix: string = 'fa') {
		return this.createElement('span', [prefix, prefix + '-' + icon], [['aria-hidden', 'true']]);
	}

	public createLabel(classList: string[]) {
		return this.createElement('label', classList, [['for', '{{id}}']]);
	}

	public createSlot(name: string) {
		return this.createElement('div', [], [['ng-transclude', name]]);
	}
}
