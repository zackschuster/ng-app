import * as angular from 'angular';
import 'angular-ui-router';

import { DataService } from 'app/core/data.service';
import { Logger } from 'app/core/logger';
import { footerView } from 'app/core/layout/footer/view';

export default
	angular
		.module('core', ['ui.router'])
		.service('dataService', DataService)
		.service('logger', Logger)
		.component('footerView', footerView);
