	// tslint:disable:member-ordering
import isIE11 from '@ledge/is-ie-11';
import { IAttributes } from 'angular';

import { InputComponentOptions } from './options';
import { NgComponentController } from '../controller';
import { NgRenderer } from '../renderer';

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

	private static readonly $baseDefinition: angular.IComponentOptions = {
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

	/**
	 * Retrieves the identifying name for an ngModel
	 */
	public static modelIdentifier($attrs: IAttributes) {
		return ($attrs.ngModel as string).split('.').pop() as string;
	}

	/**
	 * Get an optionally unique input id
	 */
	public static getId($attrs: IAttributes) {
		return this.modelIdentifier($attrs);
	}

	/**
	 * Gets text -- intended for a label -- from the ngModel property text
	 */
	public static getDefaultLabelText($attrs: IAttributes) {
		return this.modelIdentifier($attrs).split(/(?=[A-Z])/).join(' ');
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

	public static wrapComponentCtrl($ctrl: new(...args: any[]) => angular.IController) {
		// tslint:disable-next-line:max-classes-per-file
		return class extends $ctrl {
			constructor() {
				super();
				setTimeout(() => {
					const $contain = this.$element.querySelector('[ng-transclude="contain"]');
					if ($contain != null && $contain.children.length === 0) {
						if (isIE11()) {
							$contain.removeNode(true);
						} else {
							$contain.remove();
						}
					}
				});
			}
		};
	}

	/**
	 * Transform an input component definition into an ng component definition
	 * @param component An object representing the requested component definition
	 */
	public static defineInputComponent(component: InputComponentOptions) {
		const $component = Object.assign({
			isRadioOrCheckbox: false,
			labelClass: 'form-control-label',
			templateClass: 'form-group',
			attrs: {},
			ctrl: NgComponentController,
		}, component);

		$component.isRadioOrCheckbox = $component.labelClass === 'form-check-label';

		const $definition = Object.assign({}, this.$baseDefinition);

		// assign child objects
		Object.assign($definition.bindings, $component.bindings);
		Object.assign($definition.transclude, $component.transclude);

		// assign controller
		$definition.controller = this.wrapComponentCtrl($component.ctrl);

		// assign template - this thing's nasty :(
		// tslint:disable-next-line:cyclomatic-complexity
		$definition.template = ['$element', '$attrs', ($element: JQLite, $attrs: IAttributes) => {
			const $el = $element[0];

			// 'h' identifier (and many other ideas) taken from the virtual-dom ecosystem
			const h = new NgRenderer(document);

			// as it's an input, we'll put it inside a form-group container.
			// this can be modified by a consumer through configuration.
			let $template = h.createElement('div', [$component.templateClass]);

			// see above: all inputs must have labels
			const $label = h.createLabel([$component.labelClass]);

			if ($component.isRadioOrCheckbox === false) {
				$template.appendChild($label);
			}

			const $input = $component.render.call(
				{ $template, $attrs }, // allow consumer to access $template and $attrs attributes from `this`
				h);

			// required, disabled, readonly, and their ng-equivalents
			this.setInteractivityAttributes($input, $attrs);

			if ($component.canHaveIcon && $attrs.hasOwnProperty('icon')) {
				const $iconInput = h.createIconInput($input, $attrs.icon);
				$template.appendChild($iconInput);
			} else {
				$template.appendChild($input);
			}

			if ($el.closest('contain') != null) {
				$input.style.marginTop = '8px';
				$label.classList.add('sr-only');
			} else if ($attrs.hasOwnProperty('srOnly')) {
				$label.classList.add('sr-only');
			}

			// check if consumer wishes to render label; if not, add a default label based on
			// $attrs.ngModel which a consumer can override through anonymous transclusion.
			if ($component.renderLabel != null) {
				$component.renderLabel.call({ $label, $attrs }, h);
			} else {
				// TODO: figure out how consumers can pass in label text without requiring two transclusion slots
				const $transclude = document.createElement('ng-transclude');
				$transclude.textContent = this.getDefaultLabelText($attrs);
				$label.appendChild($transclude);
			}

			const isRadio = $input.type === 'radio';
			if ($attrs.hasOwnProperty('required') && isRadio === false) {
				const $span = h.createElement('span', ['text-danger']);
				$span.textContent = ' *';
				$label.appendChild($span);
			}

			// add a transclusion slot for e.g. nesting inputs
			$template.appendChild(
				h.createSlot('contain'),
			);

			if ($component.isRadioOrCheckbox === true) {
				$template.appendChild($label);
			}

			const attrs = Object.keys($component.attrs);

			const $ngModelCtrlExp = `$ctrl.ngModelCtrl.`;
			const $validationErrorExp = `${$ngModelCtrlExp}$error`;
			const $validationFormInvalidExp = `${$ngModelCtrlExp}$$parentForm.$submitted`;
			const $validationTouchedExp = $validationErrorExp.replace('error', 'touched');
			const $validationInvalidExp = $validationErrorExp.replace('error', 'invalid');
			const $validationExp = `(${$validationTouchedExp} || ${$validationFormInvalidExp}) && ${$validationInvalidExp}`;

			const $validationBlock = h.createElement('div', [], [
				['ng-messages', $validationErrorExp],
				['ng-show', $validationExp],
				['role', 'alert'],
			]);

			if ($input.type === 'email') {
				attrs.push('email');
			}

			const tagName = $input.tagName.toLowerCase();
			const isTextArea = tagName === 'textarea';

			// that's right, i named it after filterFilter. fight me.
			const $inputInput = tagName === 'input' || isTextArea
				? $input
				: $input.querySelector('input');

			if ($inputInput != null) {
				$inputInput.setAttribute('ng-class', `{ 'is-invalid': ${$validationExp} }`);
				$inputInput.setAttribute('ng-blur', '$ctrl.ngModelCtrl.$setTouched()');

				// stupid hack to get rid of textarea autovalidation (only on ff)
				// @ts-ignore
				const isFirefox = typeof InstallTrigger !== 'undefined';
				if ($attrs.hasOwnProperty('required') && isTextArea && isFirefox) {
					$inputInput.removeAttribute('required');
				}
			}

			if ($component.validators != null) {
				for (const [key, value] of $component.validators) {
					this.$validationMessages.set(key, value);
					attrs.push(key);
				}
			}

			this.$validationAttrs
				.concat(attrs)
				.filter(x => x.startsWith('ng') === false)
				.filter(x => this.$validationMessages.has(x))
				.forEach(x => {
					const $message = h.createElement('div', ['text-danger'], [['ng-message', x]]);
					$message.innerText = this.$validationMessages.get(x) as string;
					$validationBlock.appendChild($message);
				});

			$template.appendChild($validationBlock);

			if (isRadio) {
				const $newTpl = h.createElement('div', ['form-group']);
				$newTpl.appendChild($template);

				const $ngMessagesBlock = $template.querySelector('div[ng-messages]');
				if ($ngMessagesBlock != null) {
					$ngMessagesBlock.remove();
					$newTpl.appendChild($ngMessagesBlock);
				}

				$template = $newTpl;
			}

			const $id = this.getId($attrs);
			let $html = $template.outerHTML.replace(/{{id}}/g, $id);

			attrs
				.filter(x => x !== 'email')
				.forEach(prop => {
					$html = $html.replace(
						new RegExp('{{' + prop + '}}', 'g'),
						$attrs[prop] || $component.attrs[prop],
					);
				});

			return $html;
		}];

		return $definition;
	}
}
