import { IAttributes, IComponentOptions } from 'angular';
import { InputService } from 'core/input/service';

interface IDefinitionOptions extends IComponentOptions {
	render?(h: InputService): HTMLElement;
}

export const coreDefinition: IComponentOptions = {
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

interface IApplyCoreDefOpts {
	class?: string;
	slot?: string;
	srOnly?: boolean;
}

// tslint:disable-next-line:max-line-length
export function applyCoreDefinition(definition: IDefinitionOptions, options: IApplyCoreDefOpts = { class: 'form-group' }) {
	// flamethrower approach: blow it all up, then fix the stragglers
	const def = Object.assign({}, coreDefinition, definition) as IComponentOptions;

	// assign template
	def.template = ['$element', '$attrs', ($element: JQuery, $attrs: IAttributes) => {
		const h = new InputService()
			.registerElement($element)
			.registerAttributes($attrs);

		const $template = h.createElement('div', [options.class || '']);

		$template.appendChild(h.makeLabel());
		if (definition.render != null) {
			$template.appendChild(definition.render(h));
		}

		if (options.slot != null) {
			const $slot = h.createElement('div');
			$slot.style.paddingTop = '0.32em;';
			$slot.setAttribute('ng-transclude', options.slot);
			$template.appendChild($slot);
		}

		return $template.outerHTML;
	}];

	// assign child objects
	Object.assign(def.bindings, Object.assign(coreDefinition.bindings, definition.bindings));
	Object.assign(def.transclude, Object.assign(coreDefinition.transclude, definition.transclude));

	return def;
}
