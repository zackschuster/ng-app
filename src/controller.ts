import { IAttributes, INgModelController, IScope, ITimeoutService, auto } from 'angular';
import { IStateService } from 'angular-ui-router';
import { NgLogger } from './logger';
import { NgDataService } from './http';
import { IConfig } from '@ledge/types';

export class NgController {
	protected readonly $config: IConfig;
	protected $scope: IScope;
	protected $element: HTMLElement;
	protected $attrs: IAttributes;
	protected $timeout: ITimeoutService;
	protected $log: NgLogger;
	protected $http: NgDataService;
	protected $injector: auto.IInjectorService;
	protected $state: IStateService;

	protected isProduction: boolean;
	protected isDevelopment: boolean;
	protected isStaging: boolean;

	protected openWebAddress(address: string) {
		this.$log.confirm(_ => {
			window.open(`http://${address}`);
		});
	}

	protected splitByCapitalLetter(item: string) {
		return item.split(/(?=[A-Z])/).map(x => x.charAt(0).toUpperCase() + x.substring(1)).join(' ');
	}

	protected getApiPrefix() {
		const prefixes = this.$config.PREFIX;
		if (prefixes != null) {
			return prefixes.API;
		}
		return '';
	}
}

// tslint:disable-next-line:max-classes-per-file
export class NgComponentController extends NgController {
	public ngModel: any;
	public ngModelCtrl: INgModelController;
}
