import { NgComponentController } from '../../../controller';
import { InputComponentOptions } from '../../options';

class TextBoxController extends NgComponentController {
	protected $element: HTMLTextAreaElement;
	protected $mirror = document.createElement('textarea');

	constructor() {
		super();

		this.$mirror.setAttribute('aria-hidden', 'true');
		this.$mirror.setAttribute('aria-label', 'Hidden TextArea');
		this.$mirror.setAttribute('tabindex', '-1');
		this.$mirror.style.setProperty('position', 'absolute');
		this.$mirror.style.setProperty('top', '-999px');
		this.$mirror.style.setProperty('right', 'auto');
		this.$mirror.style.setProperty('bottom', 'auto');
		this.$mirror.style.setProperty('left', '0');
		this.$mirror.style.setProperty('overflow', 'hidden');
		this.$mirror.style.setProperty('box-sizing', 'content-box');
		this.$mirror.style.setProperty('min-height', '0', 'important');
		this.$mirror.style.setProperty('height', '0', 'important');
		this.$mirror.style.setProperty('padding', '0');
		this.$mirror.style.setProperty('word-wrap', 'break-word');
		this.$mirror.style.setProperty('border', '0');

		document.body.appendChild(this.$mirror);
	}

	public $onInit() {

		const element = this.$element.querySelector('textarea') as HTMLTextAreaElement;
		let computedStyle = window.getComputedStyle(element);

		const boxOuter = {
			width:
				parseInt(computedStyle.getPropertyValue('border-right-width'), 10) +
				parseInt(computedStyle.getPropertyValue('padding-right'), 10) +
				parseInt(computedStyle.getPropertyValue('padding-left'), 10) +
				parseInt(computedStyle.getPropertyValue('border-left-width'), 10),
			height:
				parseInt(computedStyle.getPropertyValue('border-top-width'), 10) +
				parseInt(computedStyle.getPropertyValue('padding-top'), 10) +
				parseInt(computedStyle.getPropertyValue('padding-bottom'), 10) +
				parseInt(computedStyle.getPropertyValue('border-bottom-width'), 10),
		};

		const minHeightValue = parseInt(computedStyle.getPropertyValue('min-height'), 10);
		const heightValue = parseInt(computedStyle.getPropertyValue('height'), 10);
		const minHeight = Math.max(minHeightValue, heightValue) - boxOuter.height;

		// Opera returns max-height of -1 if not set
		let maxHeight = parseInt(computedStyle.getPropertyValue('max-height'), 10);
		maxHeight = maxHeight && maxHeight > 0 ? maxHeight : 9e4;

		// append mirror to the DOM

		// set resize and apply elastic
		element.style.setProperty('resize', 'none');

		let lastTime = 0;
		const mirror = this.$mirror;

		function adjust() {
			requestAnimationFrame(time => {
				if ((time - lastTime) < 16) {
					return;
				}
				lastTime = time;
				computedStyle = window.getComputedStyle(element);

				const width = (parseInt(computedStyle.getPropertyValue('width'), 10) - boxOuter.width) + 'px';
				mirror.style.setProperty('width', width);
				mirror.style.setProperty('overflow-y', computedStyle.getPropertyValue('overflow-y'));

				mirror.value = element.value;

				let { scrollHeight } = mirror;
				let overflow = 'hidden';

				if (scrollHeight > maxHeight) {
					scrollHeight = maxHeight;
					overflow = 'scroll';
				} else if (scrollHeight < minHeight) {
					scrollHeight = minHeight;
				}

				element.style.setProperty('overflow-y', overflow);

				scrollHeight += boxOuter.height;
				if (parseInt(computedStyle.getPropertyValue('height'), 10) !== scrollHeight) {
					element.style.setProperty('height', scrollHeight + 'px');
				}
			});
		}

		window.addEventListener('resize', adjust);
		this.$scope.$watch(() => this.ngModelCtrl.$modelValue, adjust);

		this.$scope.$on('$destroy', () => {
			this.$mirror.remove();
			window.removeEventListener('resize', adjust);
		});

		// copy the essential styles from the textarea to the mirror
		const styles = [
			'font-family',
			'font-size',
			'font-weight',
			'font-style',
			'letter-spacing',
			'line-height',
			'text-transform',
			'word-spacing',
			'text-indent',
			'white-space',
		];

		for (const style of styles) {
			this.$mirror.style.setProperty(style, computedStyle.getPropertyValue(style));
		}
	}
}

export const textBox: InputComponentOptions = {
	type: 'input',
	attrs: { maxlength: 3000, placeholder: '' },
	render(h) {
		const textArea = h.createTextArea();

		textArea.style.setProperty('overflow', 'hidden');
		textArea.style.setProperty('overflow-y', 'hidden');
		textArea.style.setProperty('word-wrap', 'break-word');

		return textArea;
	},
	ctrl: TextBoxController,
};
