import { IAttributes, IComponentOptions } from 'angular';
import { Indexed } from '@ledge/types';
import { NgRenderer } from 'core/ng/renderer';
import { app } from 'core';
import { CoreInputController } from 'core/input/controller';

interface ComponentOptions extends IComponentOptions {
	attrs?: Indexed;
	templateClass?: string;
	labelClass?: string;
	nestInputInLabel?: boolean;
	render?(h: NgRenderer): HTMLElement;
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

export function defineComponent(component: ComponentOptions) {
	// flamethrower approach: blow it all up, then fix the stragglers
	const assigned = Object.assign({}, coreComponent, component) as IComponentOptions;

	// assign child objects
	Object.assign(assigned.bindings, Object.assign(coreComponent.bindings, component.bindings));
	Object.assign(assigned.transclude, Object.assign(coreComponent.transclude, component.transclude));

	// clean up straggler props
	Reflect.deleteProperty(assigned, 'attrs');
	Reflect.deleteProperty(assigned, 'templateClass');
	Reflect.deleteProperty(assigned, 'labelClass');
	Reflect.deleteProperty(assigned, 'nestInputInLabel');
	Reflect.deleteProperty(assigned, 'render');

	// assign controller
	if (assigned.controller == null) {
		assigned.controller = CoreInputController;
	}

	(assigned.controller as any).$inject = ['$attrs'];

	// assign template
	assigned.template = ['$element', '$attrs', ($element: JQuery, $attrs: IAttributes) => {
		const h = app.renderer().registerElement($element);

		const $template = h.createElement('div', [component.templateClass || 'form-group']);
		const $label = h.createLabel([component.labelClass || 'form-control-label']);

		if (h.isSrOnly($attrs)) {
			$label.classList.add('sr-only');
		}

		$template.appendChild($label);

		if (component.render != null) {
			const $rendered = component.render(h);
			if (component.nestInputInLabel === true) {
				$label.appendChild($rendered);
			} else {
				$template.appendChild($rendered);
			}
		}

		const $transclude = document.createElement('ng-transclude');
		$transclude.innerHTML = h.getId($attrs).split(/(?=[A-Z])/).join(' ');
		$label.appendChild($transclude);

		const $slot = h.createElement('div', [], [['ng-transclude', 'contain']]);
		$template.appendChild($slot);

		let $html = $template.outerHTML.replace(/{{id}}/g, h.modelIdentifier($attrs));

		Object.keys(component.attrs || {}).forEach(prop => {
			$html = $html.replace(new RegExp('{{' + prop + '}}', 'g'), $attrs[prop] || component.attrs[prop]);
		});

		return $html;
	}];

	return assigned;
}
