import { IAttributes, IScope } from 'angular';
import { Indexed } from '@ledge/types';
import { InputService } from 'core/input/service';

/* @ngInject */
export class CoreInputController extends InputService {
	protected ngModel: any;

	constructor(
		$scope: IScope,
		$element: JQuery,
		$attrs: IAttributes,
		/**
		 * Custom element properties
		 */
		public $props: Indexed = {},
	) {
		super();

		this
			.register($scope, $element, $attrs)
			.modifyScope()
			.modifyLabel();
	}

	private modifyScope($scope = this.$scope, $attrs = this.$attrs, $props = this.$props) {
		$scope.id = this.modelIdentifier();

		$scope.required = $attrs.hasOwnProperty('required');
		$scope.disabled = $attrs.hasOwnProperty('disabled');
		$scope.readonly = $attrs.hasOwnProperty('readonly');

		Object.keys($props).forEach($prop => {
			$scope[$prop] = $attrs[$prop] || $props[$prop];
		});

		return this;
	}

	private modifyLabel() {
		this.scheduleForLater(_ => {
			const $label = this.$element.find('label');
			const $labelChildren = $label.children();

			if ($label.is(':empty') || $labelChildren.length === 1 && $labelChildren.is('input')) {
				$label.append(this.modelIdentifier({ unique: false }).split(/(?=[A-Z])/).join(' '));
			}
		});

		return this;
	}
}
