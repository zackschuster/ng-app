import isEqual from 'lodash/isEqual';
import { NgController } from '../../controller';

export class NgInputController extends NgController {
	public ngModel: any;
	public ngModelCtrl: angular.INgModelController;

	constructor() {
		super();

		setTimeout(() => {
			const $contain = this.$element.querySelector('[ng-transclude="contain"]');
			if ($contain != null && $contain.children.length === 0) {
				if (this.isIE11) {
					($contain as any).removeNode(true);
				} else {
					$contain.remove();
				}
			}

			this.$scope.$watch(
				() => this.ngModel,
				(curr: any, prev: any) => {
					if (isEqual(curr, prev) === false) {
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
}
