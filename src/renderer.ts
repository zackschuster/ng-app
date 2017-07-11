export class NgRenderer {
	public baseInputAttrs: [string, string][] = [
		['id', '{{id}}'],
		['ng-model', '$ctrl.ngModel'],
	];

	public nameAttr: [string, string] = ['name', '{{id}}'];

	constructor(private document: Document) {}

	// tslint:disable-next-line:max-line-length
	public createElement<T extends keyof HTMLElementTagNameMap>(tagName: T, classes: string[] = [], attrs: [string, string][] = []) {
		const $el = this.document.createElement(tagName);

		$el.classList.add(...classes);

		for (const [key, value] of attrs) {
			$el.setAttribute(key, value);
		}

		return $el;
	}

	public createInput(type: string = 'text', attrs: [string, string][] = []) {
		const $isRadio = type === 'radio';
		const $isCheckbox = type === 'checkbox';
		const $isFormCheck = $isRadio || $isCheckbox;

		const $class = $isFormCheck ? ['form-check-input'] : ['form-control'];

		const $inputAttrs: [string, string][] = [
			...(this.baseInputAttrs), // parens for syntax highlighting
			...attrs,
			['type', type],
		];

		if ($isRadio) {
			$inputAttrs.shift();
			$inputAttrs.unshift(['id', '{{id}}{{$index}}']);
			$inputAttrs.push(this.nameAttr);
		} else if (!$isCheckbox) {
			$inputAttrs.push(['maxlength', '{{maxlength}}'], ['placeholder', '{{placeholder}}']);
		}

		return this.createElement('input', $class, $inputAttrs);
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

	public createIcon(icon: string, isFixedWidth = false) {
		const $iconClasses = ['fa', 'fa-' + icon.replace(/^fw!/, '')];
		if (isFixedWidth) {
			$iconClasses.push('fa-fw');
		}
		return this.createElement('span', $iconClasses, [['aria-hidden', 'true']]);
	}

	public createLabel(classList: string[]) {
		return this.createElement('label', classList, [['for', '{{id}}']]);
	}

	public createSlot(name: string) {
		return this.createElement('div', [], [['ng-transclude', name]]);
	}
}
