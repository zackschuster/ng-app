import '@webcomponents/custom-elements';
// @ts-ignore
import _Promise from 'pinkie';
if (window.Promise == null) {
	window.Promise = _Promise;
}
