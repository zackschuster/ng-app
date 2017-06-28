import { IAttributes, IScope, ITimeoutService } from 'angular';
import { NgLogger } from './logger';
import { NgDataService } from './http';

export class NgController {
	public $scope: IScope;
	public $element: JQuery;
	public $attrs: IAttributes;
	public $timeout: ITimeoutService;
	public $log: NgLogger;
	public $http: NgDataService;
	public ngModel: any;
}
