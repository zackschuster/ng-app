import { Indexed } from '@ledge/types';
import { NgController } from '../../controller';

export class NgInputController<T = any> extends NgController {
	public ngModel: any;
	public ngModelCtrl!: NgModelController<T>;

	constructor() {
		super();

		setTimeout(() => {
			const $contain = this.$element.querySelector('[ng-transclude="contain"]');
			if ($contain?.children.length === 0) {
				if (this.isIE11) {
					($contain as any).removeNode(true);
				} else {
					$contain.remove();
				}
			}

			this.$scope.$watchCollection(
				() => this.ngModel,
				(curr: any, prev: any) => {
					if (window.angular.equals(curr, prev)) {
						return;
					}

					this.ngModelCtrl.$setViewValue(curr);
					const isValid = Object
						.keys(this.ngModelCtrl.$validators)
						.every(x => {
							return this.ngModelCtrl.$validators[x](curr, curr);
						});
					if (isValid) {
						this.ngModelCtrl.$commitViewValue();
					}
				},
			);
		});
	}
}

export interface NgModelController<T = any> {
	$viewValue: T;
	$modelValue: T;

	$error: { [validationErrorKey: string]: boolean };
	$name?: string;

	readonly $touched: boolean;
	readonly $untouched: boolean;

	$validators: {
		/**
		 * viewValue is any because it can be an object that is called in the view like $viewValue.name:$viewValue.subName
		 */
		[index: string]: (modelValue: any, viewValue: any) => boolean;
	};

	$pending?: { [validationErrorKey: string]: boolean };
	readonly $pristine: boolean;
	readonly $dirty: boolean;
	readonly $valid: boolean;
	readonly $invalid: boolean;

	/**
	 * Documentation states viewValue and modelValue to be a string but other types do work and it's common to use them.
	 */
	$setViewValue(value: any, trigger?: string): void;
	$commitViewValue(): void;
	$rollbackViewValue(): void;
	$processModelValue(): void;
	$overrideModelOptions(options: NgModelOptions): void;

	$render(): void;
	$validate(): void;
	$setDirty(): void;
	$setPristine(): void;
	$setTouched(): void;
	$setUntouched(): void;
	$setValidity(validationErrorKey: string, isValid: boolean): void;

	$isEmpty(value: any): boolean;
}

/**
 * Allows tuning how model updates are done.
 * @see https://docs.angularjs.org/api/ng/directive/ngModelOptions
 */
export interface NgModelOptions {
	updateOn?: string;
	debounce?: number | Indexed<number>;
	allowInvalid?: boolean;
	getterSetter?: boolean;
	timezone?: string;
}
