import { NgController } from '../controller';
import { NgComponentOptions } from '../options';

class IconController extends NgController {
	public $onInit() {
		const { icon: iconName, width = 23, height = 23 } = this.$attrs;
		const icon = this.$renderer.createIcon(iconName, { width, height });
		this.$element.appendChild(icon);
	}
}

export const appIcon: NgComponentOptions = {
	controller: IconController,
};
