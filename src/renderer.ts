export class NgRenderer {
	public baseInputAttrs: [string, string][] = [
		['ng-attr-id', '{{id}}_{{$ctrl.uniqueId}}'],
		['ng-attr-name', '{{id}}_{{$ctrl.uniqueId}}'],
		['ng-model', '$ctrl.ngModel'],
		['ng-model-options', '$ctrl.ngModelOptions'],
	];

	constructor(private document: Document) {}

	public createElement<T extends keyof HTMLElementTagNameMap>(
		tagName: T, classes: string[] = [],
		attrs: [string, string][] = [],
	) {
		const $el = this.document.createElement(tagName);

		classes.forEach(c => $el.classList.add(c));

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
			...this.baseInputAttrs,
			...attrs,
			['type', type],
		];

		if ($isRadio) {
			$inputAttrs.shift(); // we'll set the id in render
		} else if ($isCheckbox === false) {
			$inputAttrs.push(['maxlength', '{{maxlength}}'], ['placeholder', '{{placeholder}}']);
		}

		return this.createElement('input', $class, $inputAttrs);
	}

	public createTextArea() {
		return this.createElement('textarea', ['form-control'], [
			...this.baseInputAttrs,
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
		return this.createElement('label', classList, [['ng-attr-for', '{{id}}_{{$ctrl.uniqueId}}']]);
	}

	public createSlot(name: string) {
		return this.createElement('div', [], [['ng-transclude', name]]);
	}

	public createIconInput($input: HTMLInputElement, icon: string, inputGroupAttrs: [string, string][] = []) {
		const $inputGroup = this.createElement('div', ['input-group']);
		const $inputGroupPrepend = this.createElement('div', ['input-group-prepend'], inputGroupAttrs);
		const $inputGroupText = this.createElement('span', ['input-group-text'], inputGroupAttrs);
		const $icon = this.createIcon(icon, icon.startsWith('fw!'));

		$inputGroupText.appendChild($icon);
		$inputGroupPrepend.appendChild($inputGroupText);

		$inputGroup.appendChild($inputGroupPrepend);
		$inputGroup.appendChild($input);

		return $inputGroup;
	}
}
