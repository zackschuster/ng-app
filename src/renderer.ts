import { Indexed, WritableKeysOf } from '@ledge/types';
import { Renderer2, RendererStyleFlags2 } from '@angular/core';
import { icons } from './icon';

export class NgRenderer extends Renderer2 {
	public baseInputAttrs: [string, string][] = [
		['ng-attr-id', '{{id}}_{{$ctrl.uniqueId}}'],
		['ng-attr-name', '{{id}}_{{$ctrl.uniqueId}}'],
		['ng-model', '$ctrl.ngModel'],
		['ng-model-options', '$ctrl.ngModelOptions'],
	];

	constructor(private document: HTMLDocument) { super(); }

	public createHtmlElement<T extends keyof HTMLElementTagNameMap | 'ng-transclude'>(
		tagName: T,
		classes: string[] = [],
		attrs: [string, string][] = [],
	) {
		const $el = this.createElement(tagName);

		for (const c of classes) {
			this.addClass($el, c);
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

	public createIcon(iconName: keyof typeof icons, options: Indexed = { }) {
		if (icons.hasOwnProperty(iconName) === false) {
			throw new Error(`
				Icon not supported: ${iconName}.\nSupported icons: ${Object.keys(icons).sort().join(', ')}
			`.trim());
		}

		const svg = icons[iconName].toSvg({ ...options,  'aria-label': iconName });
		const container = this.createHtmlElement('div', ['d-inline-flex', 'px-1']);
		container.setAttribute('aria-hidden', 'true');
		container.setAttribute('title', iconName);
		container.innerHTML = svg;

		return container;
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

	public createIconInput($input: HTMLElement, icon?: keyof typeof icons, inputGroupAttrs: [string, string][] = []) {
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
		return this.document.createElement(tagName);
	}

	public createText(value: string) {
		return this.document.createTextNode(value);
	}

	public createComment(value: string) {
		return this.document.createComment(value);
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

	public setStyle<T extends HTMLElement>(el: T, style: string, value: any, flags?: RendererStyleFlags2) {
		el.style.setProperty(style, value, flags == null ? undefined : flags === RendererStyleFlags2.Important ? 'important' : '');
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
			? this.document.querySelector(selectorOrNode)
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
		callback: (event: GlobalEventHandlersEventMap[T]) => boolean | void,
	) {
		target.addEventListener(eventName, callback);
		return () => target.removeEventListener(eventName, callback);
	}
}
