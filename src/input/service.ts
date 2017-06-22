import { IAttributes, IComponentOptions } from 'angular';

import { CoreInputController } from './controller';
import { NgRenderer } from '../ng/renderer';

export class InputService {
	private $counter = 0;
	private $baseDefinition: IComponentOptions = {
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

	public modelIdentifier($attrs: IAttributes, { unique } = { unique: true }) {
		return this.getId($attrs) + (unique ? '_' + this.$counter++ : '');
	}

	public getId($attrs: IAttributes) {
		return ($attrs.ngModel as string).split('.').pop();
	}

	public getIdForLabel($attrs: IAttributes) {
		return this.getId($attrs).split(/(?=[A-Z])/).join(' ');
	}

	// these next two are fairly silly, but it beats having to remember strings
	public isSrOnly($attrs: IAttributes) {
		return $attrs.hasOwnProperty('srOnly');
	}

	public isInline($attrs: IAttributes) {
		return $attrs.hasOwnProperty('inline');
	}

	public setInteractivityAttributes($input: Element, $attrs: IAttributes) {
		['required', 'ngRequired', 'disabled', 'ngDisabled', 'readonly', 'ngReadonly']
			.filter(x => $attrs.hasOwnProperty(x))
			.forEach(x => {
				$input.setAttribute(x, x.startsWith('ng') ? '$ctrl.' + x : 'true');
			});
	}

	/**
	 * Transform an input component definition into an ng component definition
	 * @param component An object representing the requested component definition
	 */
	public defineInputComponent(component: InputComponentOptions) {
		const $definition = Object.assign({}, this.$baseDefinition);

		// assign child objects
		Object.assign($definition.bindings, component.bindings);
		Object.assign($definition.transclude, component.transclude);

		// assign controller
		$definition.controller = component.ctrl || CoreInputController;

		// assign template
		$definition.template = ['$attrs', ($attrs: IAttributes) => {
			// 'h' identifier (and many other ideas) taken from the virtual-dom ecosystem
			const h = new NgRenderer();

			// as it's an input, we'll put it inside a form-group container.
			// this can be modified by a consumer through configuration.
			const $template = h.createElement('div', [component.templateClass || 'form-group']);

			// see above: all inputs must have labels
			const $label = h.createLabel([component.labelClass || 'form-control-label']);
			$template.appendChild($label);

			const $input = component.render.call(
				{ $template, $attrs }, // allow consumer to access $template and $attrs attributes from `this`
				h);

			this.setInteractivityAttributes($input, $attrs);

			if (component.nestInputInLabel === true) {
				$label.appendChild($input);
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
				$transclude.innerHTML = this.getIdForLabel($attrs);
				$label.appendChild($transclude);
			}

			// add a transclusion slot for e.g. nesting inputs
			const $slot = h.createSlot('contain');
			$template.appendChild($slot);

			const $id = this.modelIdentifier($attrs);
			let $html = $template.outerHTML.replace(/{{id}}/g, $id);

			Object.keys(component.attrs || {}).forEach(prop => {
				$html = $html.replace(new RegExp('{{' + prop + '}}', 'g'), $attrs[prop] || component.attrs[prop]);
			});

			return $html;
		}];

		return $definition;
	}
}
