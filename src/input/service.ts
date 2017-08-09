// tslint:disable:member-ordering
import { IAttributes, IComponentOptions, IController } from 'angular';

import { NgController } from '../controller';
import { NgRenderer } from '../renderer';
import { InputComponentOptions } from '../..';

export class InputService {
	private static $validationAttrs = [
		'required', 'ngRequired',
		'disabled', 'ngDisabled',
		'readonly', 'ngReadonly',
	];

	private static $validationMessages = new Map<string, string>([
		['email', 'Email address must be in the following form: email@address.com'],
		['required', 'This field is required'],
		['minlength', 'Input is not long enough'],
		['maxlength', 'Input is too long'],
	]);

	private static $counter = 0;
	private static readonly $baseDefinition: IComponentOptions = {
		transclude: {
			contain: '?contain',
		},
		bindings: {
			ngModel: '=',
			ngDisabled: '<',
			ngReadonly: '<',
			ngRequired: '<',
		},
	};

	/**
	 * Retrieves the identifying name for an ngModel
	 */
	public static modelIdentifier($attrs: IAttributes) {
		return ($attrs.ngModel as string).split('.').pop();
	}

	/**
	 * Get an optionally unique input id
	 */
	public static getId($attrs: IAttributes, { unique } = { unique: true }) {
		return this.modelIdentifier($attrs) + (unique ? '_' + this.$counter++ : '');
	}

	public static getDefaultLabelText($attrs: IAttributes) {
		return this.modelIdentifier($attrs).split(/(?=[A-Z])/).join(' ');
	}

	// these next three are fairly silly, but it beats having to remember strings
	/**
	 * Determines if an element's label text should be screen-reader only
	 */
	public static isSrOnly($attrs: IAttributes) {
		return $attrs.hasOwnProperty('srOnly');
	}

	/**
	 * Determines if an element's label text should be screen-reader only
	 */
	public static hasIcon($attrs: IAttributes) {
		return $attrs.hasOwnProperty('icon');
	}

	/**
	 * Determines if an element has been marked as inline
	 */
	public static isInline($attrs: IAttributes) {
		return $attrs.hasOwnProperty('inline');
	}

	/**
	 * Sets required, disabled, readonly, as well as their ng-equivalents
	 *
	 * @param $input - The input to set attributes on
	 * @param $attrs - The Angular.js $attrs object
	 */
	public static setInteractivityAttributes($input: Element, $attrs: IAttributes) {
		this.$validationAttrs
			.filter(x => $attrs.hasOwnProperty(x))
			.forEach(x => {
				$input.setAttribute(x, x.startsWith('ng') ? '$ctrl.' + x : 'true');
			});
	}

	/**
	 * Transform an input component definition into an ng component definition
	 * @param component An object representing the requested component definition
	 */
	public static defineInputComponent(component: InputComponentOptions) {
		const $definition = Object.assign({}, this.$baseDefinition);

		// assign child objects
		Object.assign($definition.bindings, component.bindings);
		Object.assign($definition.transclude, component.transclude);

		const $controller = component.ctrl || NgController as new(...args: any[]) => IController;

		// assign controller
		// tslint:disable-next-line:max-classes-per-file
		$definition.controller = class extends $controller {
			constructor() {
				super();
				setTimeout(() => {
					this.verifyContainSlot();
				});
			}

			private verifyContainSlot() {
				const $contain = '[ng-transclude="contain"]';
				const $el = this.$element[0] as HTMLElement;
				const contain = $el.closest($contain);
				if (contain != null) {
					this.$element.find('label').addClass('sr-only');
				}

				const el = $el.querySelector($contain);
				if (el.children.length === 0) {
					el.remove();
				}
			}
		};

		// assign template
		// tslint:disable-next-line:cyclomatic-complexity
		$definition.template = ['$element', '$attrs', ($element: JQuery, $attrs: IAttributes) => {
			// 'h' identifier (and many other ideas) taken from the virtual-dom ecosystem
			const h = new NgRenderer(document);

			// as it's an input, we'll put it inside a form-group container.
			// this can be modified by a consumer through configuration.
			const $template = h.createElement('div', [component.templateClass || 'form-group']);

			// see above: all inputs must have labels
			const $label = h.createLabel([component.labelClass || 'form-control-label']);
			$template.appendChild($label);

			const $input = component.render.call(
				{ $template, $attrs }, // allow consumer to access $template and $attrs attributes from `this`
				h);

			// required, disabled, readonly, and their ng-equivalents
			this.setInteractivityAttributes($input, $attrs);

			if (component.nestInputInLabel === true) {
				$label.appendChild($input);
			} else if (component.canHaveIcon === true && this.hasIcon($attrs)) {
				const $iconInput = h.createIconInput($input, $attrs.icon);
				$template.appendChild($iconInput);
			} else {
				$template.appendChild($input);
			}

			if (this.isSrOnly($attrs)) {
				$label.classList.add('sr-only');
			}

			// check if consumer wishes to render label; if not, add a default label
			// based on $attrs.ngModel which a consumer can override through anonymous transclusion.
			if (component.renderLabel != null) {
				component.renderLabel.call({ $label }, h);
			} else {
				// TODO: figure out how consumers can pass in label text without requiring two transclusion slots
				const $transclude = document.createElement('ng-transclude');
				$transclude.textContent = this.getDefaultLabelText($attrs);
				if ($attrs.hasOwnProperty('required')) {
					const $span = h.createElement('span', ['text-danger']);
					$span.textContent = ' *';
					$transclude.appendChild($span);
				}
				$label.appendChild($transclude);
			}

			// add a transclusion slot for e.g. nesting inputs
			const $slot = h.createSlot('contain');
			$template.appendChild($slot);

			const $formName = ($element as any)[0].closest('form').getAttribute('name');
			const $validationErrorExp = `$parent.${$formName}.{{id}}.$error`;
			const $validationTouchedExp = $validationErrorExp.replace('error', 'touched');
			const $validationInvalidExp = $validationErrorExp.replace('error', 'invalid');
			const $validationExp = `${$validationTouchedExp} && ${$validationErrorExp} && ${$validationInvalidExp}`;

			$template.setAttribute('ng-class', `{ 'has-danger': ${$validationExp} }`);

			const $validationBlock = h.createElement('div', [], [
				['ng-messages', $validationExp],
				['role', 'alert'],
			]);

			const attrs = Object.keys(component.attrs || {});

			if ($input.type === 'email') {
				attrs.push('email');
			}

			this.$validationAttrs
				.concat(attrs)
				.filter(x => x.startsWith('ng') === false && this.$validationMessages.has(x))
				.forEach(x => {
					const $message = h.createElement('div', ['text-danger'], [['ng-message', x]]);
					$message.innerText = this.$validationMessages.get(x);
					$validationBlock.appendChild($message);
				});

			$template.appendChild($validationBlock);

			const $id = this.getId($attrs);
			let $html = $template.outerHTML.replace(/{{id}}/g, $id);

			attrs.forEach(prop => {
				$html = $html.replace(new RegExp('{{' + prop + '}}', 'g'), $attrs[prop] || component.attrs[prop]);
			});

			return $html;
		}];

		return $definition;
	}
}
