import '@webcomponents/custom-elements';
import 'whatwg-fetch/dist/fetch.umd.js';
import 'abortcontroller-polyfill/dist/polyfill-patch-fetch.js';
// @ts-ignore
import _Promise from 'pinkie';
if (window.Promise == null) {
	window.Promise = _Promise;
}
