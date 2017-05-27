import { applyCoreDefinition } from 'core/input/definition';
import { CoreInputController } from 'core/input/controller';

class CheckBoxController extends CoreInputController {
	constructor($scope: any, $element: any, $attrs: any) {
		super($scope, $element, $attrs);
	}

	public $postLink() {
		const $checkbox = this.makeInput('checkbox');

		this
			.wireToContainer('label,legend', $checkbox, { prepend: true })
			.scheduleForLater(_ => {
				const $previousElement = this.$element.prev();

				if ($previousElement.is('check-box')) {
					$previousElement.children().last().attr('style', 'margin-bottom:0;');
				}
			});
	}
}

export const checkBox = applyCoreDefinition({
	bindings: {
		ngChecked: '<',
	},
	controller: CheckBoxController,
}, {
	class: 'checkbox',
	slot: 'contain',
});
