import { NgController } from '../controller';
import { NgComponentOptions } from '../options';
import { NgRenderer } from '../services/renderer';

class IconController extends NgController {
	public icon: string;

	public $onInit() {
		const renderer = new NgRenderer(document);
		const icon = renderer.createIcon(this.$attrs.icon);
		this.$element.appendChild(icon);
	}
}

export const appIcon: NgComponentOptions = {
	ctrl: IconController,
};
