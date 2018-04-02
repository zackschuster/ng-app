import { IAttributes, INgModelController, IScope, ITimeoutService, auto } from 'angular';
import { IStateService } from 'angular-ui-router';
import { NgLogger } from './logger';
import { NgDataService } from './http';
import { IConfig } from '@ledge/types';

export class NgController {
	public readonly $config: IConfig;
	public $scope: IScope;
	public $element: HTMLElement;
	public $attrs: IAttributes;
	public $timeout: ITimeoutService;
	public $log: NgLogger;
	public $http: NgDataService;
	public $injector: auto.IInjectorService;
	public $state: IStateService;

	public isProduction: boolean;
	public isDevelopment: boolean;
	public isStaging: boolean;

	public openWebAddress(address: string) {
		this.$log.confirm(_ => {
			window.open(`http://${address}`);
		});
	}

	public splitByCapitalLetter(item: string) {
		return item.split(/(?=[A-Z])/).map(x => x.charAt(0).toUpperCase() + x.substring(1)).join(' ');
	}
}

// tslint:disable-next-line:max-classes-per-file
export class NgComponentController extends NgController {
	public ngModel: any;
	public ngModelCtrl: INgModelController;
}
