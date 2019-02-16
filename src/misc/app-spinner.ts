import { NgController } from '../controller';
import { NgComponentOptions } from '../options';
import { NgRenderer } from '../services/renderer';

class SpinnerController extends NgController {
	private readonly colors = ['primary', 'secondary', 'success', 'danger', 'warning', 'info', 'light', 'dark'];

	public $onInit() {
		const { color = 'primary' } = this.$attrs;

		if (this.colors.includes(color) === false) {
			throw new Error(`Color not supported: ${color}.\nSupported colors: ${this.colors.join(', ')}`);
		}

		const renderer = new NgRenderer();
		const srDesc = renderer.createHtmlElement('span', ['sr-only']);
		srDesc.innerText = 'Loading...';

		const spinner = renderer.createHtmlElement('div', ['spinner-border', `text-${color}`, 'mx-1'], [['role', 'status']]);
		spinner.appendChild(srDesc);
		spinner.style.setProperty('margin-top', '0.23rem');

		this.$element.appendChild(spinner);
	}
}

export const appSpinner: NgComponentOptions = {
	controller: SpinnerController,
};
