import { NgController } from '../controller';
import { NgComponentOptions } from '../options';

const DEFAULT_DIMENSION_LENGTH = 23;

class IconController extends NgController {
	public $onInit() {
		const { icon: iconName, width = DEFAULT_DIMENSION_LENGTH, height = DEFAULT_DIMENSION_LENGTH } = this.$attrs;
		const icon = this.$renderer.createIcon(iconName, { width, height });
		this.$element.appendChild(icon);
	}
}

export const appIcon: NgComponentOptions = {
	controller: IconController,
};
