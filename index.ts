import * as angular from 'angular';
import 'angular-ui-router';

import { DataService } from 'core/data/service';
import { Logger } from 'core/logger';
import { footerView } from 'core/layout/footer/component';
import { checkBox } from 'core/input/checkbox/component';
import { textBox } from 'core/input/textbox/component';
import { editablePanel } from 'core/layout/panel/component';

export default
	angular
		.module('core', ['ui.router'])
		.service('dataService', DataService)
		.service('logger', Logger)
		.component('footerView', footerView)
		.component('checkBox', checkBox)
		.component('textBox', textBox)
		.component('editablePanel', editablePanel);
