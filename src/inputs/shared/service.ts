import { Indexed } from '@ledge/types';
import { copy } from 'angular';

import { NgInputController } from './controller';
import { NgInputOptions } from './options';
import { NgAttributes } from '../../controller';
import { NgComponentOptions } from '../../options';
import { NgRenderer, NgService } from '../../services';

const BaseComponent = Object.seal({
	isRadioOrCheckbox: false,
	type: 'input',
	labelClass: 'form-control-label',
	templateClass: 'form-group',
	attrs: { },
	controller: class extends NgInputController { },
	render(_h) {
		return this.$template;
	},
	renderLabel(h) {
		const $transclude = h.createSlot();
		$transclude.textContent = InputService.getDefaultLabelText(this.$attrs);
		this.$label.appendChild($transclude);
	},
	postRender(_h) {
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
			['INPUT', 'TEXTAREA', 'SELECT'].includes($input.tagName)
				? $input
				:	$input.querySelector('select') || $input.querySelector('input')
		) as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;
	}

	/**
	 * Transform an input component definition into an ng component definition
	 * @param component An object representing the requested component definition
	 */
	public static defineInputComponent(component: NgInputOptions) {
		// 'h' identifier (and many other ideas) taken from the virtual-dom ecosystem
		const h = new NgRenderer();

		const $component = copy({ ...InputService.$BaseComponent, ...component });
		$component.isRadioOrCheckbox = $component.labelClass === 'form-check-label';

		const $definition = copy(InputService.$baseDefinition);

		// assign child objects
		Object.assign($definition.bindings, $component.bindings);
		Object.assign($definition.transclude, $component.transclude);

		// assign controller
		if ($component.controller === undefined) {
			throw new Error(`Invalid component: ${JSON.stringify($component)}`);
		}
		$definition.controller = $component.controller;

		// assign template
		$definition.template = ['$element', '$attrs', ($element: [HTMLElement], $attrs: NgAttributes) => {
			const $el = $element[0];

			const $template = h.createHtmlElement('div', [$component.templateClass as string]);

			// allow consumer to access $template and $attrs attributes from `this`
			const $input = $component.render.call({ $template, $attrs }, h);

			const isRadio = ($input as HTMLInputElement).type === 'radio';
			const isRequired = $attrs.hasOwnProperty('required');
			const isSrOnly = $attrs.hasOwnProperty('srOnly');

			// all inputs must have labels
			const $label = h.createLabel([$component.labelClass as string], { isRequired, isSrOnly, isRadio });

			if ($component.isRadioOrCheckbox === false) {
				$template.appendChild($label);
			}

			if ($component.canHaveIcon === true) {
				$template.appendChild(h.createIconInput($input, $attrs.icon));
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

			($component.renderLabel as NonNullable<NgInputOptions['renderLabel']>)
				.call({ $label, $attrs }, h);

			if (requiredTag != null) {
				$label.appendChild(requiredTag);
			}

			// add a transclusion slot for e.g. nesting inputs
			$template.appendChild(h.createSlot('contain'));

			if ($component.isRadioOrCheckbox === true) {
				$label.style.setProperty('cursor', 'pointer');
				$template.appendChild($label);
			}

			($component.postRender as NonNullable<NgInputOptions['postRender']>)
				.call({ $template, $attrs }, h);

			// that's right, i named it after filterFilter. fight me.
			const $inputInput = InputService.getInputInput($input);

			InputService.$validationAttrs
				.filter(x => $attrs.hasOwnProperty(x) === true)
				.forEach(x => {
					$inputInput.setAttribute(
						x.replace(/[A-Z]/, s => `-${s.toLowerCase()}`),
						x.startsWith('ng') ? `$ctrl.${x}` : 'true',
					);
				});

			if ($inputInput.tagName !== 'SELECT') {
				$inputInput.setAttribute('ng-class', `{ 'is-invalid': ${InputService.$ValidationExpressions.$IsInvalid} }`);
				$inputInput.setAttribute('ng-blur', '$ctrl.ngModelCtrl.$setTouched()');
			}

			const $validationBlock = h.createHtmlElement('div', [], [
				['ng-messages', InputService.$ValidationExpressions.$Error],
				['ng-show', InputService.$ValidationExpressions.$IsInvalid],
				['role', 'alert'],
			]);

			const { validators = { } } = $component;
			const attrs = Object.keys($component.attrs as Indexed);

			for (const [key, value] of Object.entries(validators)) {
				InputService.$validationMessages.set(key, value);
				attrs.push(key);
			}

			InputService.$validationAttrs
				.concat(...attrs, 'email')
				.filter(x => x.startsWith('ng') === false)
				.filter(x => InputService.$validationMessages.has(x) === true)
				.filter(x => x !== 'email' || $inputInput.type === x)
				.forEach(x => {
					const $message = h.createHtmlElement('div', ['text-danger'], [['ng-message', x]]);
					$message.innerText = InputService.$validationMessages.get(x) as string;
					$validationBlock.appendChild($message);
				});

			let $html: string;
			if (isRadio === true) {
				const $newTpl = h.createHtmlElement('div', ['form-group']);
				$newTpl.appendChild($template);
				$newTpl.appendChild($validationBlock);
				$html = $newTpl.outerHTML;
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

		return $definition;
	}
}
