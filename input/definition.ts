import { IAttributes, IComponentOptions } from 'angular';
import { Indexed } from '@ledge/types';
import { app, models } from 'core';
import { InputService } from 'core/input/service';
import { CoreInputController } from 'core/input/controller';

interface RenderObjects {
	/**
	 * Input container
	 */
	$template: HTMLDivElement;
	/**
	 * Angular $attrs object
	 */
	$attrs: IAttributes;
}

interface ComponentOptions extends IComponentOptions {
	/**
	 * Special attributes to set on the input
	 */
	attrs?: Indexed;

	/**
	 * CSS class to apply to the input container. Defaults to 'form-group'.
	 */
	templateClass?: string;

	/**
	 * CSS class to apply to the input label. Defaults to 'form-control-label'.
	 */
	labelClass?: string;

	/**
	 * Whether the rendered input should be nested inside the label
	 */
	nestInputInLabel?: boolean;

	/**
	 * Run after the container & input label creation, before label manipulation
	 */
	render?(this: RenderObjects, h: models.Renderer): Element;

	/**
	 * Run after
	 */
	renderLabel?(this: RenderObjects, h: models.Renderer): void;
}

export const coreComponent: IComponentOptions = {
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

export function defineInputComponent(component: ComponentOptions) {
	const assigned = Object.assign({}, coreComponent);

	// assign child objects
	Object.assign(assigned.bindings, component.bindings);
	Object.assign(assigned.transclude, component.transclude);

	// assign controller
	assigned.controller = component.controller || (CoreInputController as any);
	(assigned.controller as any).$inject = ['$attrs'];

	// assign template
	assigned.template = ['$attrs', ($attrs: IAttributes) => {
		// 'h' identifier (and many other ideas) taken from the virtual-dom ecosystem
		const h = app.renderer();
		const componentService = new InputService($attrs);

		// as it's an input, we'll put it inside a form-group container.
		// this can be modified by a consumer through configuration.
		const $template = h.createElement('div', [component.templateClass || 'form-group']);

		// see above: all inputs must have labels
		const $label = h.createLabel([component.labelClass || 'form-control-label']);
		$template.appendChild($label);

		// if a consumer passes in a render function, compute the result & add it as the consumer prefers
		if (component.render != null) {
			// allow consumer to access the container and instance attributes from `this`
			const $rendered = component.render.call({ $template, $attrs }, h);

			if (component.nestInputInLabel === true) {
				$label.appendChild($rendered);
			} else {
				$template.appendChild($rendered);
			}
		}

		if (componentService.isSrOnly()) {
			$label.classList.add('sr-only');
		}

		// check if consumer wishes to render label; if not, add a default label
		// based on $attrs.ngModel which a consumer can override through anonymous transclusion.
		if (component.renderLabel != null) {
			component.renderLabel.call({ $template, $attrs }, h);
		} else {
			const $transclude = document.createElement('ng-transclude');
			$transclude.innerHTML = componentService.getIdForLabel();
			$label.appendChild($transclude);
		}

		// TODO: figure out how to pass in label text without requiring two transclusion slots
		// const $labelText = h.getIdForLabel($attrs);
		// const $labelTextNode = document.createTextNode($labelText);
		// const $labelTextContainer = h.createElement('span');

		// $labelTextContainer.appendChild($labelTextNode);
		// $label.appendChild($labelTextContainer);

		// add a transclusion slot for e.g. nesting inputs
		const $slot = h.createSlot('contain');
		$template.appendChild($slot);

		const $id = componentService.modelIdentifier();
		let $html = $template.outerHTML.replace(/{{id}}/g, $id);

		Object.keys(component.attrs || {}).forEach(prop => {
			$html = $html.replace(new RegExp('{{' + prop + '}}', 'g'), $attrs[prop] || component.attrs[prop]);
		});

		return $html;
	}];

	return assigned;
}
