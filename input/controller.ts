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
			.scheduleForLater(_ => this.modifyLabel());
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
		const $label = this.$element.find('label').attr('for', this.$scope.id);

		if (this.isSrOnly()) {
			$label.addClass('sr-only');
		}
		const $labelChildren = $label.children();
		if ($label.is(':empty') || $labelChildren.length === 1 && $labelChildren.is('input')) {
			$label.append(this.modelIdentifier({ unique: false }).split(/(?=[A-Z])/).join(' '));
		}

		return this;
	}
}
