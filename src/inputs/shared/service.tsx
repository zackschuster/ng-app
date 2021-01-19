import { h } from '@ledge/jsx';
import { Indexed } from '@ledge/types';

import { NgInputController } from './controller';
import { NgInputOptions } from './options';
import { NgAttributes } from '../../attributes';
import { NgComponentOptions } from '../../options';
import { NgService } from '../../service';

const BaseComponent: NgInputOptions = Object.seal({
	type: 'input',
	labelClass: 'form-control-label',
	templateClass: 'form-group',
	attrs: {},
	controller: class extends NgInputController { },
	render() {
		return this.$template;
	},
	renderLabel() {
		this.$label.appendChild(
			<ng-transclude>{InputService.getDefaultLabelText(this.$attrs)}</ng-transclude>,
		);
	},
	postRender() {
		return;
	},
});

const ValidationExpressions = Object.seal({
	$Error: '$ctrl.ngModelCtrl.$error',
	$Invalid: '$ctrl.ngModelCtrl.$invalid',
	$Touched: '$ctrl.ngModelCtrl.$touched',
	$FormInvalid: `$ctrl.ngModelCtrl.$$parentForm.$submitted`,
	get $IsInvalid() {
		return `(${this.$Touched} || ${this.$FormInvalid}) && ${this.$Invalid}`;
	},
});

/**
 * see https://developer.mozilla.org/en-US/docs/Web/API/Element/closest#Polyfill
 */
export function closest(el: HTMLElement, s: string) {
	if (typeof Element.prototype.closest === 'function') {
		return el.closest(s);
	}

	const matches = Element.prototype.matches || (Element.prototype as any).msMatchesSelector;
	do {
		if (matches.call(el, s)) {
			return el;
		}
		el = el.parentElement || el.parentNode as typeof el;
	}
	while (el !== null && el.nodeType === 1);

	return null;
}

export class InputService extends NgService {
	public static readonly $validationAttrs = [
		'required', 'ngRequired',
		'disabled', 'ngDisabled',
		'readonly', 'ngReadonly',
	];

	public static $validationMessages: Indexed<string> = {
		email: 'Email address must be in the following form: email@address.com',
		required: 'This field is required',
		minlength: 'Input is not long enough',
		maxlength: 'Input is too long',
	};

	public static readonly $baseDefinition: NgComponentOptions = {
		transclude: {
			contain: '?contain',
		},
		require: {
			ngModelCtrl: 'ngModel',
		},
		bindings: {
			ngModel: '=',
			ngModelOptions: '<',
			ngDisabled: '<',
			ngReadonly: '<',
			ngRequired: '<',
		},
	};

	public static readonly $BaseComponent = BaseComponent;
	public static readonly $ValidationExpressions = ValidationExpressions;

	/**
	 * Retrieves the identifying name for an ngModel
	 */
	public static modelIdentifier($attrs: NgAttributes) {
		return ($attrs.ngModel as string).split('.').pop() as string;
	}

	/**
	 * Gets text -- intended for a label -- from the ngModel property text
	 */
	public static getDefaultLabelText($attrs: NgAttributes) {
		return InputService.modelIdentifier($attrs)
			.split(/(?=[A-Z0-9])/)
			.map(x => isNaN(Number(x)) ? x.charAt(0).toUpperCase() + x.substring(1) : x)
			.join(' ');
	}

	/**
	 * @param $input - The input to set attributes on
	 */
	public static getInputInput($input: HTMLElement) {
		return (
			['INPUT', 'TEXTAREA', 'SELECT'].indexOf($input.tagName) !== -1
				? $input
				: $input.querySelector('select') || $input.querySelector('input')
		) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
	}

	/**
	 * Transform an input component definition into an ng component definition
	 * @param component An object representing the requested component definition
	 */
	public static defineInputComponent<T extends NgInputOptions>(component: T) {
		const $component = window.angular.copy(InputService.$BaseComponent);
		for (const key of Object.keys(component) as (keyof T)[]) {
			($component as T)[key] = component[key];
		}
		const isRadioOrCheckbox = $component.labelClass === 'form-check-label';

		const $definition = window.angular.copy(InputService.$baseDefinition);

		// assign child objects
		if ($definition.bindings != null && $component.bindings != null) {
			for (const key of Object.keys($component.bindings)) {
				$definition.bindings[key] = $component.bindings[key];
			}
		}
		if (
			$definition.transclude != null &&
			typeof $component.transclude === 'object' &&
			$component.transclude != null
		) {
			for (const key of Object.keys($component.transclude)) {
				($definition.transclude as Indexed)[key] = ($component.transclude as Indexed)[key];
			}
		}

		// assign controller
		if ($component.controller === undefined) {
			throw new Error(`Invalid component: ${JSON.stringify($component)}`);
		}
		$definition.controller = $component.controller;

		// assign template
		// tslint:disable-next-line:cyclomatic-complexity
		$definition.template = ['$element', '$attrs', ($element: [HTMLElement], $attrs: NgAttributes) => {
			let $template = <div class={$component.templateClass as string}></div> as HTMLDivElement;

			const $el = $element[0];
			// allow consumer to access $template and $attrs attributes from `this`
			const $input = $component.render.call({ $template, $attrs });
			// all inputs must have labels
			const $label =
				<label class={`${$component.labelClass}${$attrs.hasOwnProperty('srOnly') ? ' sr-only' : ''}`}
					ng-attr-for='{{id}}_{{$ctrl.uniqueId}}'></label> as HTMLLabelElement;

			const isRadio = ($input as HTMLInputElement).type === 'radio';
			if ($attrs.hasOwnProperty('required') === true && isRadio === false) {
				$label.appendChild(<span class='text-danger'> *</span>);
			}

			if (isRadioOrCheckbox === false) {
				$template.appendChild($label);
			}

			if ($component.canHaveIcon === true && $attrs.icon?.length > 0) {
				$template.appendChild(
					<div class='input-group'>
						<div class='input-group-prepend'>
							<span class='input-group-text'>
								<span class={$attrs.icon} aria-hidden='true'></span>
							</span>
						</div>
						{$input}
					</div>,
				);
			} else {
				$template.appendChild($input);
			}

			if (closest($el, 'contain') != null) {
				$input.style.marginTop = '8px';
				$label.classList.add('sr-only');
			}

			const requiredTag = $label.firstElementChild;
			if (requiredTag != null) {
				$label.removeChild(requiredTag);
			}
			$component.renderLabel?.call({ $label, $attrs });
			if (requiredTag != null) {
				$label.appendChild(requiredTag);
			}

			// add a transclusion slot for e.g. nesting inputs
			$template.appendChild(<div ng-transclude='contain'></div>);

			if (isRadioOrCheckbox === true) {
				$label.style.setProperty('cursor', 'pointer');
				$template.appendChild($label);
			}

			$component.postRender?.call({ $template, $attrs });

			// that's right, i named it after filterFilter. fight me.
			const $inputInput = InputService.getInputInput($input);
			const $inputValidationAttrs = InputService.$validationAttrs
				.filter(x => $attrs.hasOwnProperty(x) === true);

			for (const attr of $inputValidationAttrs) {
				$inputInput.setAttribute(
					attr.replace(/[A-Z]/, s => `-${s.toLowerCase()}`),
					/^ng/.test(attr) ? `$ctrl.${attr}` : 'true',
				);
			}

			if ($inputInput.getAttribute('ng-attr-id') == null) {
				$inputInput.setAttribute('ng-attr-id', `{{id}}_{{$ctrl.uniqueId}}${isRadio ? '_{{$index}}' : ''}`);
			}
			$inputInput.setAttribute('ng-attr-name', '{{id}}_{{$ctrl.uniqueId}}');
			if (($inputInput.getAttribute('ng-attr-id')?.indexOf('{{id}}') ?? -1) === 0) {
				$inputInput.setAttribute('ng-model', '$ctrl.ngModel');
			}
			if ($inputInput.tagName !== 'SELECT') {
				const ngClass = `{ 'is-invalid': ${InputService.$ValidationExpressions.$IsInvalid} }`;
				$inputInput.setAttribute('ng-class', ngClass);
				$inputInput.setAttribute('ng-blur', '$ctrl.ngModelCtrl.$setTouched()');
				$inputInput.setAttribute('ng-model-options', '$ctrl.ngModelOptions');
			}

			const $validationBlock =
				<div ng-messages={InputService.$ValidationExpressions.$Error}
					ng-show={InputService.$ValidationExpressions.$IsInvalid}
					role='alert'></div>;

			const { validators = {} } = $component;
			const attrs = Object.keys($component.attrs as Indexed);

			for (const key of Object.keys(validators)) {
				InputService.$validationMessages[key] = validators[key];
				attrs.push(key);
			}

			const $inputValidationMessages = InputService.$validationAttrs
				.concat(...attrs, 'email')
				.filter(x => /^ng/.test(x) === false)
				.filter(x => InputService.$validationMessages.hasOwnProperty(x) === true)
				.filter(x => x !== 'email' || $inputInput.type === x);

			for (const msg of $inputValidationMessages) {
				const $message = <div class='text-danger' ng-message={msg}></div>;
				$message.innerText = InputService.$validationMessages[msg as 'email'];
				$validationBlock.appendChild($message);
			}

			if (isRadio === true) {
				$template = <div class='form-group'>{$template}{$validationBlock}</div> as HTMLDivElement;
			} else {
				$template.appendChild($validationBlock);
			}

			let $html = $template.outerHTML.replace(/{{id}}/g, InputService.modelIdentifier($attrs));

			for (const prop of attrs) {
				$html = $html.replace(
					new RegExp(`{{${prop}}}`, 'g'),
					$attrs[prop] || ($component.attrs as Indexed)[prop],
				);
			}

			return $html;
		}];

		return $definition as T;
	}
}
