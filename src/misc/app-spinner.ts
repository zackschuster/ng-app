import { NgController } from '../controller';
import { NgComponentOptions } from '../options';

class SpinnerController extends NgController {
	private readonly colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

	public $onInit() {
		const { color = 'primary' } = this.$attrs;

		if (this.colors.includes(color) === false) {
			throw new Error(`Color not supported: ${color}.\nSupported colors: ${this.colors.join(', ')}`);
		}

		this.$attrs.$set('role', 'status');
		this.$attrs.$set('title', 'Loading...');

		this.$element.classList.add('spinner-border');
		this.$element.classList.add(`text-${color}`);
		this.$element.classList.add('mx-1');
		this.$element.style.setProperty('margin-top', '0.23rem');
	}
}

export const appSpinner: NgComponentOptions = {
	controller: SpinnerController,
};
