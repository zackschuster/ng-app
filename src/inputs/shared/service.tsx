import { Indexed } from '@ledge/types';
import cloneDeep from 'lodash/cloneDeep';

import { NgInputController } from './controller';
import { NgInputOptions } from './options';
import { NgAttributes } from '../../attributes';
import { NgComponentOptions } from '../../options';
import { NgService } from '../../service';
import { h } from '../../render';

const BaseComponent = Object.seal({
	isRadioOrCheckbox: false,
	type: 'input',
	labelClass: 'form-control-label',
	templateClass: 'form-group',
	attrs: {},
	controller: class extends NgInputController { },
	render() {
		return this.$template;
	},
	renderLabel() {
		const $transclude = <ng-transclude></ng-transclude>;
		$transclude.textContent = InputService.getDefaultLabelText(this.$attrs);
		this.$label.appendChild($transclude);
	},
	postRender() {
		return this.$template;
	},
}) as NgInputOptions & { isRadioOrCheckbox: boolean };

const ValidationExpressions = Object.seal({
	$Error: '$ctrl.ngModelCtrl.$error',
	$Invalid: '$ctrl.ngModelCtrl.$invalid',
	$Touched: '$ctrl.ngModelCtrl.$touched',
	$FormInvalid: `$ctrl.ngModelCtrl.$$parentForm.$submitted`,
	get $IsInvalid() {
		return `(${this.$Touched} || ${this.$FormInvalid}) && ${this.$Invalid}`;
	},
});

export class InputService extends NgService {
	public static readonly $validationAttrs = [
		'required', 'ngRequired',
		'disabled', 'ngDisabled',
		'readonly', 'ngReadonly',
	];

	public static readonly $validationMessages = new Map<string, string>([
		['email', 'Email address must be in the following form: email@address.com'],
		['required', 'This field is required'],
		['minlength', 'Input is not long enough'],
		['maxlength', 'Input is too long'],
	]);

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
		const $component = cloneDeep({ ...InputService.$BaseComponent, ...component });
		$component.isRadioOrCheckbox = $component.labelClass === 'form-check-label';

		const $definition = cloneDeep(InputService.$baseDefinition);

		// assign child objects
		if ($definition.bindings != null && $component.bindings != null) {
			for (const key of Object.keys($component.bindings)) {
				$definition.bindings[key] = $component.bindings[key];
			}
		}
		if ($definition.transclude != null && $component.transclude != null) {
			for (const key of Object.keys($component.transclude)) {
				($definition.transclude as Indexed<string>)[key] = ($component.transclude as Indexed<string>)[key];
			}
		}

		// assign controller
		if ($component.controller === undefined) {
			throw new Error(`Invalid component: ${JSON.stringify($component)}`);
		}
		$definition.controller = $component.controller;

		// assign template
		// tslint:disable-next-line: cyclomatic-complexity
		$definition.template = ['$element', '$attrs', ($element: [HTMLElement], $attrs: NgAttributes) => {
			const $el = $element[0];

			const $template = <div class={$component.templateClass as string}></div> as HTMLDivElement;

			// allow consumer to access $template and $attrs attributes from `this`
			const $input = $component.render.call({ $template, $attrs });

			const isRadio = ($input as HTMLInputElement).type === 'radio';
			const isRequired = $attrs.hasOwnProperty('required');
			const isSrOnly = $attrs.hasOwnProperty('srOnly');

			// all inputs must have labels
			const $label =
				<label class={`${$component.labelClass}${isSrOnly ? ' sr-only' : ''}`}
					ng-attr-for='{{id}}_{{$ctrl.uniqueId}}'></label> as HTMLLabelElement;

			if (isRequired === true && !isRadio) {
				$label.appendChild(<span class='text-danger'> *</span>);
			}

			if ($component.isRadioOrCheckbox === false) {
				$template.appendChild($label);
			}

			if ($component.canHaveIcon === true && $attrs.icon != null) {
				$template.appendChild(
					<div class='input-group'>
						<div class='input-group-prepend'>
							<span class='input-group-text'>
								<span class={`fa fa-${$attrs.icon}`} aria-hidden='true'></span>
							</span>
						</div>
						{$input}
					</div>,
				);
			} else {
				$template.appendChild($input);
			}

			if ($el.closest('contain') != null) {
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

			if ($component.isRadioOrCheckbox === true) {
				$label.style.setProperty('cursor', 'pointer');
				$template.appendChild($label);
			}

			$component.postRender?.call({ $template, $attrs });

			// that's right, i named it after filterFilter. fight me.
			const $inputInput = InputService.getInputInput($input);

			InputService.$validationAttrs
				.filter(x => $attrs.hasOwnProperty(x) === true)
				.forEach(x => {
					$inputInput.setAttribute(
						x.replace(/[A-Z]/, s => `-${s.toLowerCase()}`),
						/^ng/.test(x) ? `$ctrl.${x}` : 'true',
					);
				});

			if ($inputInput.tagName !== 'SELECT') {
				$inputInput.setAttribute('ng-class', `{ 'is-invalid': ${InputService.$ValidationExpressions.$IsInvalid} }`);
				$inputInput.setAttribute('ng-blur', '$ctrl.ngModelCtrl.$setTouched()');
			}

			const $validationBlock =
				<div ng-messages={InputService.$ValidationExpressions.$Error}
					ng-show={InputService.$ValidationExpressions.$IsInvalid}
					role='alert'></div>;

			const { validators = {} } = $component;
			const attrs = Object.keys($component.attrs as Indexed);

			for (const [key, value] of Object.keys(validators).map(x => [x, validators[x]])) {
				InputService.$validationMessages.set(key, value);
				attrs.push(key);
			}

			InputService.$validationAttrs
				.concat(...attrs, 'email')
				.filter(x => /^ng/.test(x) === false)
				.filter(x => InputService.$validationMessages.has(x) === true)
				.filter(x => x !== 'email' || $inputInput.type === x)
				.forEach(x => {
					const $message = <div class='text-danger' ng-message={x}></div>;
					$message.innerText = InputService.$validationMessages.get(x) as string;
					$validationBlock.appendChild($message);
				});

			let $html: string;
			if (isRadio === true) {
				$html = (<div class='form-group'>{$template}{$validationBlock}</div>).outerHTML;
			} else {
				$template.appendChild($validationBlock);
				$html = $template.outerHTML;
			}

			$html = $html.replace(/{{id}}/g, InputService.modelIdentifier($attrs));

			attrs
				.forEach(prop => {
					$html = $html.replace(
						new RegExp(`{{${prop}}}`, 'g'),
						$attrs[prop] || ($component.attrs as Indexed)[prop],
					);
				});

			return $html;
		}];

		return $definition as T;
	}
}
