import { IComponentOptions, isFunction } from 'angular';
import { Callback } from '@ledge/types';

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
export function applyCoreDefinition(definition: IComponentOptions, options: IApplyCoreDefOpts = { class: 'form-group' }) {
	// flamethrower approach: blow it all up, then fix the stragglers
	const def = Object.assign({}, coreDefinition, definition);

	// assign template
	const $baseEl = $(`<div class="${options.class || ''}"></div>`);

	const { template } = def;
	const $template = isFunction(template) ? (template as Callback)() : (template || '');

	$baseEl.html($template);
	$baseEl.prepend(`<label ng-transclude class="${options.srOnly ? 'sr-only' : ''}"></label>`);

	def.template = $baseEl[0].outerHTML;

	if (options.slot != null) {
		$baseEl.append(`<div style="padding-top:0.32em;" ng-transclude="${options.slot}"></div>`);
	}

	// assign child objects
	Object.assign(def.bindings, Object.assign(coreDefinition.bindings, definition.bindings));
	Object.assign(def.transclude, Object.assign(coreDefinition.transclude, definition.transclude));

	return def;
}
