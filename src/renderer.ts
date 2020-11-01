export class NgRenderer {
	public baseInputAttrs: [string, string][] = [
		['ng-attr-id', '{{id}}_{{$ctrl.uniqueId}}'],
		['ng-attr-name', '{{id}}_{{$ctrl.uniqueId}}'],
		['ng-model', '$ctrl.ngModel'],
		['ng-model-options', '$ctrl.ngModelOptions'],
	];

	public createHtmlElement<T extends keyof HTMLElementTagNameMap | 'ng-transclude'>(
		tagName: T,
		classes: string[] = [],
		attrs: [string, string][] = [],
	) {
		const $el = document.createElement(tagName);

		if (classes.length > 0) {
			$el.classList.add(...classes);
		}

		for (const [key, value] of attrs) {
			$el.setAttribute(key, value);
		}

		return $el as T extends keyof HTMLElementTagNameMap
			? HTMLElementTagNameMap[T]
			: HTMLUnknownElement;
	}

	public createInput(type = 'text', attrs: [string, string][] = []) {
		const $isRange = type === 'range';
		const $isRadio = type === 'radio';
		const $isCheckbox = type === 'checkbox';
		const $isFormCheck = $isRadio || $isCheckbox;

		const $class =
			$isFormCheck
				? ['form-check-input']
				: $isRange
					? ['custom-range']
					: ['form-control'];

		const $inputAttrs: [string, string][] = [
			...this.baseInputAttrs,
			...attrs,
			['type', type],
		];

		if ($isRadio) {
			$inputAttrs.shift(); // we'll set the id in render
		} else if ($isCheckbox === false && $isRange === false) {
			$inputAttrs.push(['maxlength', '{{maxlength}}'], ['placeholder', '{{placeholder}}']);
		}

		return this.createHtmlElement('input', $class, $inputAttrs);
	}

	public createTextArea() {
		return this.createHtmlElement('textarea', ['form-control'], [
			...this.baseInputAttrs,
			['maxlength', '{{maxlength}}'],
			['placeholder', '{{placeholder}}'],
		]);
	}

	public createIcon(icon: string, isFixedWidth = /^fw!/.test(icon)) {
		const $iconClasses = ['fa', `fa-${icon.replace(/^fw!/, '')}`];
		if (isFixedWidth) {
			$iconClasses.push('fa-fw');
		}
		return this.createHtmlElement('span', $iconClasses, [['aria-hidden', 'true']]);
	}

	public createLabel(classList: string[], {
		isRequired = false,
		isSrOnly = false,
		isRadio = false,
	}: {
		isRequired?: boolean,
		isSrOnly?: boolean,
		isRadio?: boolean,
	} = {
			isRequired: false,
			isSrOnly: false,
			isRadio: false,
		},
	) {
		const $label = this.createHtmlElement(
			'label',
			classList,
			[['ng-attr-for', '{{id}}_{{$ctrl.uniqueId}}']],
		);

		if (isRequired === true && !isRadio) {
			const $span = this.createHtmlElement('span', ['text-danger']);
			$span.textContent = ' *';
			$label.appendChild($span);
		}

		if (isSrOnly === true) {
			$label.classList.add('sr-only');
		}

		return $label;
	}

	public createSlot(name?: string) {
		return name != null
			? this.createHtmlElement('div', [], [['ng-transclude', name]])
			: this.createHtmlElement('ng-transclude') as HTMLDivElement;
	}

	public createIconInput($input: HTMLElement, icon?: string, inputGroupAttrs: [string, string][] = []) {
		if (icon == null) {
			return $input;
		}

		const $inputGroup = this.createHtmlElement('div', ['input-group']);
		const $inputGroupPrepend = this.createHtmlElement('div', ['input-group-prepend'], inputGroupAttrs);
		const $inputGroupText = this.createHtmlElement('span', ['input-group-text']);
		const $icon = this.createIcon(icon);

		$inputGroupText.appendChild($icon);
		$inputGroupPrepend.appendChild($inputGroupText);

		$inputGroup.appendChild($inputGroupPrepend);
		$inputGroup.appendChild($input);

		return $inputGroup;
	}
}

export function h<T extends keyof HTMLElementTagNameMap, E extends HTMLElement & (new () => E)>(
	TagOrElement: T | E,
	props: { [index: string]: any } = {},
	...childNodes: unknown[]
): HTMLElementTagNameMap[T] | E {
	const element = typeof TagOrElement === 'string'
		? document.createElement(TagOrElement)
		: new TagOrElement();

	if (props === null) {
		props = {};
	}

	const setProperty = (key: string, value: any) => {
		if (value == null) {
			return;
		}

		if (typeof value === 'function') {
			element[key as keyof typeof element] = value;
		} else if (key === 'className') {
			element.setAttribute('class', value.toString());
		} else {
			element.setAttribute(key, value.toString());
		}
	};

	for (const key of Object.keys(props)) {
		setProperty(key, props[key]);
	}

	const appendChild = (node: unknown) => {
		if (node instanceof Node) {
			element.appendChild(node);
		} else if (node != null) {
			element.appendChild(document.createTextNode(String(node)));
		}
	};
	for (const node of childNodes) {
		if (Array.isArray(node) && node.some(x => x instanceof Node)) {
			for (const n of node) {
				appendChild(n);
			}
		} else {
			appendChild(node);
		}
	}

	return element;
}
