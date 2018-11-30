// tslint:disable:member-ordering max-classes-per-file
import isIE11 from '@ledge/is-ie-11';
import { IAttributes, copy, equals } from 'angular';

import { InputComponentOptions } from './options';
import { NgComponentController } from '../controller';
import { NgRenderer } from '../services/renderer';

export class InputService {
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

	public static readonly $baseDefinition: angular.IComponentOptions = {
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

	public static readonly $baseComponent = {
		isRadioOrCheckbox: false,
		labelClass: 'form-control-label',
		templateClass: 'form-group',
		attrs: {},
		ctrl: NgComponentController,
		renderLabel: function defaultRenderLabel(h) {
			const $transclude = h.createSlot();
			$transclude.textContent = InputService.getDefaultLabelText(this.$attrs);
			this.$label.appendChild($transclude);
		} as InputComponentOptions['renderLabel'],
		// tslint:disable-next-line:variable-name
		postRender: function defaultPostRender(_h) {
			return this.$template;
		} as InputComponentOptions['postRender'],
	};

	public static readonly $validationExps = {
		$error: '$ctrl.ngModelCtrl.$error',
		$invalid: '$ctrl.ngModelCtrl.$invalid',
		$touched: '$ctrl.ngModelCtrl.$touched',
		$formInvalid: `$ctrl.ngModelCtrl.$$parentForm.$submitted`,
		get $isInvalid() {
			return `(${this.$touched} || ${this.$formInvalid}) && ${this.$invalid}`;
		},
	};

	/**
	 * Retrieves the identifying name for an ngModel
	 */
	public static modelIdentifier($attrs: IAttributes) {
		return ($attrs.ngModel as string).split('.').pop() as string;
	}

	/**
	 * Gets text -- intended for a label -- from the ngModel property text
	 */
	public static getDefaultLabelText($attrs: IAttributes) {
		return this.modelIdentifier($attrs)
			.split(/(?=[A-Z0-9])/)
			.map(x => isNaN(Number(x)) ? x.charAt(0).toUpperCase() + x.substring(1) : x)
			.join(' ');
	}

	/**
	 * @param $input - The input to set attributes on
	 */
	public static getInputInput($input: HTMLInputElement | HTMLTextAreaElement) {
		return ['INPUT', 'TEXTAREA', 'SELECT'].includes($input.tagName)
			? $input
			: $input.querySelector('input') as HTMLInputElement;
	}

	public static wrapComponentCtrl($ctrl: new(...args: any[]) => angular.IController) {
		return class extends $ctrl {
			private ngModelCtrl: angular.INgModelController;
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

					this.$scope.$watch(
						() => this.ngModel,
						(curr: any, prev: any) => {
							if (equals(curr, prev) === false) {
								this.ngModelCtrl.$setViewValue(curr);
								const isValid = Object
									.keys(this.ngModelCtrl.$validators)
									.every(x => {
										return this.ngModelCtrl.$validators[x](curr, curr);
									});
								if (isValid) {
									this.ngModelCtrl.$commitViewValue();
								}
							}
						},
					);
				});
			}
		};
	}

	/**
	 * Transform an input component definition into an ng component definition
	 * @param component An object representing the requested component definition
	 */
	public static defineInputComponent(component: InputComponentOptions, doc = document) {
		// 'h' identifier (and many other ideas) taken from the virtual-dom ecosystem
		const h = new NgRenderer(doc);

		const $component = copy(Object.assign({}, this.$baseComponent, component));
		$component.isRadioOrCheckbox = $component.labelClass === 'form-check-label';

		const $definition = copy(this.$baseDefinition);

		// assign child objects
		Object.assign($definition.bindings, $component.bindings);
		Object.assign($definition.transclude, $component.transclude);

		// assign controller
		$definition.controller = this.wrapComponentCtrl($component.ctrl);

		// assign template
		$definition.template = ['$element', '$attrs', ($element: JQLite, $attrs: IAttributes) => {
			const $el = $element[0];

			let $template = h.createElement('div', [$component.templateClass]);

			const $input: HTMLInputElement = $component.render.call(
				{ $template, $attrs }, // allow consumer to access $template and $attrs attributes from `this`
				h);

			const isRadio = $input.type === 'radio';
			const isRequired = $attrs.hasOwnProperty('required');
			const isSrOnly = $attrs.hasOwnProperty('srOnly');

			// all inputs must have labels
			const $label = h.createLabel([$component.labelClass], { isRequired, isSrOnly, isRadio });

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

			($component.renderLabel as NonNullable<InputComponentOptions['renderLabel']>)
				.call({ $label, $attrs }, h);

			if (requiredTag != null) {
				$label.appendChild(requiredTag);
			}

			// add a transclusion slot for e.g. nesting inputs
			$template.appendChild(h.createSlot('contain'));

			if ($component.isRadioOrCheckbox === true) {
				$template.appendChild($label);
			}

			($component.postRender as NonNullable<InputComponentOptions['postRender']>)
				.call({ $template, $attrs }, h);

			// that's right, i named it after filterFilter. fight me.
			const $inputInput = this.getInputInput($input);

			this.$validationAttrs
				.filter(x => $attrs.hasOwnProperty(x) === true)
				.forEach(x => {
					$inputInput.setAttribute(
						x.replace(/[A-Z]/, s => `-${s.toLowerCase()}`),
						x.startsWith('ng') ? `$ctrl.${x}` : 'true',
					);
				});

			if ($inputInput.tagName !== 'SELECT') {
				$inputInput.setAttribute('ng-class', `{ 'is-invalid': ${this.$validationExps.$isInvalid} }`);
				$inputInput.setAttribute('ng-blur', '$ctrl.ngModelCtrl.$setTouched()');
			}

			const $validationBlock = h.createElement('div', [], [
				['ng-messages', this.$validationExps.$error],
				['ng-show', this.$validationExps.$isInvalid],
				['role', 'alert'],
			]);

			const { validators = {} } = $component;
			const attrs = Object.keys($component.attrs);

			for (const [key, value] of Object.entries(validators)) {
				this.$validationMessages.set(key, value);
				attrs.push(key);
			}

			this.$validationAttrs
				.concat(...attrs, 'email')
				.filter(x => x.startsWith('ng') === false)
				.filter(x => this.$validationMessages.has(x) === true)
				.filter(x => x !== 'email' || $inputInput.type === x)
				.forEach(x => {
					const $message = h.createElement('div', ['text-danger'], [['ng-message', x]]);
					$message.innerText = this.$validationMessages.get(x) as string;
					$validationBlock.appendChild($message);
				});

			if (isRadio === true) {
				const $newTpl = h.createElement('div', ['form-group']);
				$newTpl.appendChild($template);
				$newTpl.appendChild($validationBlock);
				$template = $newTpl;
			} else {
				$template.appendChild($validationBlock);
			}

			let $html = $template.outerHTML.replace(/{{id}}/g, this.modelIdentifier($attrs));

			attrs
				.forEach(prop => {
					$html = $html.replace(
						new RegExp(`{{${prop}}}`, 'g'),
						$attrs[prop] || $component.attrs[prop],
					);
				});

			return $html;
		}];

		return $definition;
	}
}
