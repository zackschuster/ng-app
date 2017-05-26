import * as angular from 'angular';
import 'angular-elastic';

import { DataService } from 'core/data/service';
import { Logger } from 'core/logger';
import { footerView } from 'core/layout/footer/component';
import { checkBox } from 'core/input/checkbox/component';
import { editablePanel } from 'core/layout/panel/component';
import { textInput } from 'core/input/text/component';
import { textBox } from 'core/input/text/box/component';
import { dateInput } from 'core/input/date/component';

export default
	angular
		.module('core', [
			'monospaced.elastic',
		])
		.service('dataService', DataService)
		.service('logger', Logger)
		.component('footerView', footerView)
		.component('dateInput', dateInput)
		.component('textInput', textInput)
		.component('textBox', textBox)
		.component('checkBox', checkBox)
		.component('editablePanel', editablePanel);
