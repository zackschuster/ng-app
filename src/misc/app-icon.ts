import { NgController } from '../controller';
import { NgComponentOptions } from '../options';

class IconController extends NgController {
	public $onInit() {
		const icon = this.$renderer.createIcon(this.$attrs.icon);
		this.$element.appendChild(icon);
	}
}

export const appIcon: NgComponentOptions = {
	controller: IconController,
};
