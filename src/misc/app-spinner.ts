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

		const renderer = new NgRenderer(document);
		const spinner = renderer.createHtmlElement('div', ['spinner-border', `text-${color}`, 'mx-1'], [['role', 'status']]);
		const srDesc = renderer.createHtmlElement('span', ['sr-only']);
		srDesc.innerText = 'Loading...';
		spinner.appendChild(srDesc);

		this.$element.appendChild(spinner);
	}
}

export const appSpinner: NgComponentOptions = {
	ctrl: SpinnerController,
};
