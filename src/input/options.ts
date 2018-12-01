// tslint:disable: no-redundant-jsdoc
import { Indexed } from '@ledge/types';
import { NgRenderer } from '../services/renderer';
import { NgComponentOptions } from '../options';

export interface NgInputOptions extends NgComponentOptions {
	/**
	 * Set this so the app knows how to register your definition
	 */
	type: 'input';

	/**
	 * Allow input group icons to be defined by users on the input
	 */
	canHaveIcon?: true;

	/**
	 * Special attributes to set on the input
	 */
	attrs?: Indexed;

	/**
	 * CSS class to apply to the input container
	 * @default 'form-group'
	 */
	templateClass?: string;

	/**
	 * CSS class to apply to the input label
	 * @default 'form-control-label'
	 */
	labelClass?: string;

	/**
	 * Custom validator messages
	 */
	validators?: Indexed<string>;

	/**
	 * Run after container & label creation, before label manipulation
	 */
	render(
		this: {
			/**
			 * Input container
			 */
			$template: HTMLDivElement;
			/**
			 * Angular.js $attrs object
			 */
			$attrs: angular.IAttributes;
		},
		h: NgRenderer,
	): HTMLElement;

	/**
	 * Special hook to override how label text is generated
	 */
	renderLabel?(
		this: {
			/**
			 * Input label
			 */
			$label: HTMLLabelElement;
			/**
			 * Angular.js $attrs object
			 */
			$attrs: angular.IAttributes;
		},
		h: NgRenderer,
	): void;

	/**
	 * Run after label is added to template
	 */
	postRender?(
		this: {
			/**
			 * Input container
			 */
			$template: HTMLDivElement;
			/**
			 * Angular.js $attrs object
			 */
			$attrs: angular.IAttributes;
		},
		h: NgRenderer,
	): Element;
}
