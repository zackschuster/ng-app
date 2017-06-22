import { app } from 'core';

export abstract class NgController {
	constructor(
		protected $scope = app.scope(),
		protected $element = app.root() as JQuery,
		protected $timeout = app.timeout(),
		protected $log = app.logger(),
	) {}
}
