import * as angular from 'angular';
import 'angular-ui-router';

import { DataService } from 'app/core/data.service';
import { Logger } from 'app/core/logger';

export default
	angular
		.module('core', ['ui.router'])
		.service('dataService', DataService)
		.service('logger', Logger);
