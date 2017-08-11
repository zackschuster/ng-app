// tslint:disable:member-ordering
import { IAttributes, IComponentOptions, IController } from 'angular';

import { NgComponentController } from '../controller';
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
		require: {
			ngModelCtrl: 'ngModel',
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

	/**
	 * Gets text -- intended for a label -- from the ngModel property text
	 */
	public static getDefaultLabelText($attrs: IAttributes) {
		return this.modelIdentifier($attrs).split(/(?=[A-Z])/).join(' ');
	}

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
				$input.setAttribute(
					x.replace(/[A-Z]/, s => '-' + s.toLowerCase()),
					x.startsWith('ng') ? '$ctrl.' + x : 'true',
				);
			});
	}

	public static wrapComponentCtrl($ctrl: new(...args: any[]) => IController) {
		// tslint:disable-next-line:max-classes-per-file
		return class extends $ctrl {
			constructor() {
				super();
				setTimeout(() => {
					const $el = this.$element[0] as HTMLElement;
					const $contain = $el.querySelector('[ng-transclude="contain"]');
					if ($contain != null && $contain.children.length === 0) {
						$contain.remove();
					}
					const $fieldset = $el.closest('fieldset');
					if ($fieldset != null) {
						const $legend = $fieldset.querySelector('legend');
						const $observer = new MutationObserver($mutations => {
							const $shouldRemoveDanger = $mutations.some(m => m.oldValue.includes('has-danger-remove'));
							$legend.classList[$shouldRemoveDanger ? 'remove' : 'add']('text-danger');
						});

						$observer.observe(
							$el.querySelector('.form-group'),
							{ attributes: true, attributeOldValue: true, attributeFilter: ['class'] },
						);

						this.$scope.$on('$destroy', () => $observer.disconnect());
					}
				});
			}
		};
	}

	/**
	 * Get the appropriate form for a given element
	 * @param $element {Element} The element to find a form for
	 */
	public static getForm($element: Element) {
		let form = $element.closest('form');

		if (form == null) {
			if (document.forms.length === 1) {
				form = document.forms.item(0);
			} else {
				// this will fail if the element has ng-repeat on it
				const formList = Array.from(document.forms);
				form = formList.find(x => x.contains($element));
			}
		}

		return form;
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

		// assign controller
		$definition.controller = this.wrapComponentCtrl(
			component.ctrl || NgComponentController as new(...args: any[]) => IController);

		// assign template - this thing's nasty :(
		// tslint:disable-next-line:cyclomatic-complexity
		$definition.template = ['$element', '$attrs', ($element: JQuery, $attrs: IAttributes) => {
			const $el = ($element as any)[0] as Element;

			// 'h' identifier (and many other ideas) taken from the virtual-dom ecosystem
			const h = new NgRenderer(document);

			// as it's an input, we'll put it inside a form-group container.
			// this can be modified by a consumer through configuration.
			let $template = h.createElement('div', [component.templateClass || 'form-group']);

			// see above: all inputs must have labels
			const $label = h.createLabel([component.labelClass || 'form-control-label']);
			$template.appendChild($label);

			const $input = component.render.call(
				{ $template, $attrs }, // allow consumer to access $template and $attrs attributes from `this`
				h);

			// required, disabled, readonly, and their ng-equivalents
			this.setInteractivityAttributes($input, $attrs);

			if (component.nestInputInLabel) {
				$label.appendChild($input);
			} else if (component.canHaveIcon && this.hasIcon($attrs)) {
				const $iconInput = h.createIconInput($input, $attrs.icon);
				$template.appendChild($iconInput);
			} else {
				$template.appendChild($input);
			}

			if ($el.closest('contain') != null) {
				$input.style.marginTop = '8px';
				$label.classList.add('sr-only');
			} else if (this.isSrOnly($attrs)) {
				$label.classList.add('sr-only');
			}

			// check if consumer wishes to render label; if not, add a default label based on
			// $attrs.ngModel which a consumer can override through anonymous transclusion.
			if (component.renderLabel != null) {
				component.renderLabel.call({ $label, $attrs }, h);
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
			$template.appendChild(
				h.createSlot('contain'),
			);

			const $formName = this.getForm($el).getAttribute('name');
			const $formNameExp = `$parent.${$formName}.`;
			const $validationErrorExp = `${$formNameExp}{{id}}.$error`;
			const $validationTouchedExp = $validationErrorExp.replace('error', 'touched');
			const $validationInvalidExp = $validationErrorExp.replace('error', 'invalid');
			const $validationExp = `(${$validationTouchedExp} || ${$formNameExp}$submitted) && ${$validationInvalidExp}`;

			const $validationBlock = h.createElement('div', [], [
				['ng-messages', $validationErrorExp],
				['ng-show', $validationExp],
				['role', 'alert'],
			]);

			const attrs = Object.keys(component.attrs || {});

			if ($input.type === 'email') {
				attrs.push('email');
			} else if ($input.type === 'radio') {
				const $newTpl = h.createElement('div', ['form-group']);
				$newTpl.appendChild($template);
				$template = $newTpl;
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
			$template.setAttribute('ng-class', `{ 'has-danger': ${$validationExp} }`);

			const $id = this.getId($attrs);
			let $html = $template.outerHTML.replace(/{{id}}/g, $id);

			attrs
				.filter(x => x !== 'email')
				.forEach(prop => {
					$html = $html.replace(new RegExp('{{' + prop + '}}', 'g'), $attrs[prop] || component.attrs[prop]);
				});

			return $html;
		}];

		return $definition;
	}
}
