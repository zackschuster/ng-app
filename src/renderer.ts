import { WritableKeysOf } from '@ledge/types';

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

	public createIcon(icon: string, isFixedWidth = false) {
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
		const $icon = this.createIcon(icon, icon.startsWith('fw!'));

		$inputGroupText.appendChild($icon);
		$inputGroupPrepend.appendChild($inputGroupText);

		$inputGroup.appendChild($inputGroupPrepend);
		$inputGroup.appendChild($input);

		return $inputGroup;
	}

	/**
	 * Renderer2 implementations
	 */

	// tslint:disable-next-line: member-ordering
	public data: { [key: string]: any } = Object.create(null);

	// tslint:disable-next-line: member-ordering
	public destroyNode: null;

	public destroy() {
		return;
	}

	public createElement<T extends keyof HTMLElementTagNameMap>(tagName: T): HTMLElementTagNameMap[T];
	public createElement(tagName: string): HTMLUnknownElement;
	public createElement<T extends keyof HTMLElementTagNameMap>(tagName: T) {
		return document.createElement(tagName);
	}

	public createText(value: string) {
		return document.createTextNode(value);
	}

	public createComment(value: string) {
		return document.createComment(value);
	}

	public appendChild(parent: HTMLElement, newChild: HTMLElement) {
		parent.appendChild(newChild);
	}

	public removeChild(parent: HTMLElement, newChild: HTMLElement) {
		parent.removeChild(newChild);
	}

	public insertBefore(parent: HTMLElement, newChild: HTMLElement, refChild: HTMLElement) {
		parent.insertBefore(newChild, refChild);
	}

	public addClass<T extends HTMLElement>(el: T, name: string) {
		el.classList.add(name);
	}

	public removeClass<T extends HTMLElement>(el: T, name: string) {
		el.classList.remove(name);
	}

	public setStyle<T extends HTMLElement>(el: T, style: string, value: any, important?: boolean) {
		el.style.setProperty(style, value, important ? 'important' : '');
	}

	public removeStyle<T extends HTMLElement>(el: T, style: string) {
		el.style.removeProperty(style);
	}

	public setAttribute<T extends HTMLElement>(el: T, name: string, value: string) {
		el.setAttribute(name, value);
	}

	public removeAttribute<T extends HTMLElement>(el: T, name: string) {
		el.removeAttribute(name);
	}

	public setProperty<T extends HTMLElement, U extends Exclude<WritableKeysOf<T>, number | symbol>>(el: T, name: U, value: any) {
		el[name] = value;
	}

	public setValue<T extends HTMLElement>(node: T, value: string) {
		node.nodeValue = value;
	}

	public parentNode(node: HTMLElement) {
		return node.parentNode;
	}

	public nextSibling(node: HTMLElement) {
		return node.nextSibling;
	}

	public selectRootElement(selectorOrNode: string | HTMLElement, preserveContent = false): HTMLElement {
		const el: HTMLElement | null = typeof selectorOrNode === 'string'
			? document.querySelector(selectorOrNode)
			: selectorOrNode;

		if (el == null) {
			throw new Error(`The selector "${selectorOrNode}" did not match any elements`);
		}

		if (preserveContent === false) {
			el.textContent = '';
		}

		return el;
	}

	public listen<T extends keyof GlobalEventHandlersEventMap>(
		target: HTMLElement,
		eventName: T,
		callback: (event: GlobalEventHandlersEventMap[T]) => boolean | undefined,
	) {
		target.addEventListener(eventName, callback);
		return () => target.removeEventListener(eventName, callback);
	}
}
