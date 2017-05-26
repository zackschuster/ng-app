import { IAttributes, IScope } from 'angular';
import { Indexed } from '@ledge/types';
import { InputService } from 'core/input/service';

/* @ngInject */
export class CoreInputController extends InputService {
	protected ngModel: any;

	constructor(
		protected $scope: IScope,
		protected $element: JQuery,
		protected $attrs: IAttributes,
		/**
		 * Custom element properties
		 */
		public $props: Indexed = {},
	) {
		super();

		this.register($scope, $element, $attrs);

		this.modifyScope();
		this.scheduleForLater(_ => this.modifyLabel());
	}

	private modifyScope() {
		this.$scope.id = this.modelIdentifier();

		this.$scope.required = this.$attrs.hasOwnProperty('required');
		this.$scope.disabled = this.$attrs.hasOwnProperty('disabled');
		this.$scope.readonly = this.$attrs.hasOwnProperty('readonly');

		Object.keys(this.$props).forEach($prop => {
			this.$scope[$prop] = this.$attrs[$prop] || this.$props[$prop];
		});
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
	}
}
