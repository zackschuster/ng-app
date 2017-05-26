import { module } from 'angular';

import 'angular-animate';
import 'angular-elastic';
import 'angular-ui-bootstrap';

import { Ng } from 'core/ng';

import { editablePanel } from 'core/layout/panel/component';
import { footerView } from 'core/layout/footer/component';

import { checkBox } from 'core/input/checkbox/component';
import { dateInput } from 'core/input/date/component';
import { textBox } from 'core/input/text/box/component';
import { textInput } from 'core/input/text/component';

const $dependencies = [
	'ngAnimate',
	'ui.bootstrap',
	'monospaced.elastic',
];

const core = module('core', $dependencies)
	.component('editablePanel', editablePanel)
	.component('footerView', footerView)
	.component('checkBox', checkBox)
	.component('dateInput', dateInput)
	.component('textBox', textBox)
	.component('textInput', textInput);

export default core;
export const ng: Ng = new Ng(core);
