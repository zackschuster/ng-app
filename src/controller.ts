// tslint:disable:max-classes-per-file
import { IConfig } from '@ledge/types';
import { StateService } from '@uirouter/angularjs';
import { NgLogger } from './logger';
import { NgDataService } from './http';

export class NgController {
	public static IsMobile() {
		return typeof window === 'object' && window.innerWidth < 767;
	}
	public get isMobile() {
		return NgController.IsMobile();
	}

	protected readonly $config: IConfig;
	protected readonly $scope: angular.IScope;
	protected readonly $element: HTMLElement;
	protected readonly $attrs: angular.IAttributes;
	protected readonly $timeout: angular.ITimeoutService;
	protected readonly $log: NgLogger;
	protected readonly $http: NgDataService;
	protected readonly $injector: angular.auto.IInjectorService;
	protected readonly $state: StateService;

	protected readonly isProduction: boolean;
	protected readonly isDevelopment: boolean;
	protected readonly isStaging: boolean;
	protected readonly apiPrefix: string;

	public openWebAddress(address: string) {
		this.$log.confirm(_ => {
			window.open(`http://${address}`);
		});
	}

	/**
	 * Separates words in a string by capital letters. Also capitalizes the first letter.
	 * If string is all-caps, it's returned as-is.
	 *
	 * @param item - The string value to be split
	 */
	public splitByCapitalLetter(item: string) {
		const split = item.split(/(?=[A-Z])/);
		return split.every(x => x.length === 1)
			? item
			: split
					.map(x => x.trim())
					.map(x => x.charAt(0).toUpperCase() + x.substring(1))
					.join(' ');
	}

	public getApiPrefix() {
		return this.apiPrefix;
	}
}

export class NgComponentController extends NgController {
	public ngModel: any;
	public ngModelCtrl: angular.INgModelController;

	// tslint:disable-next-line:no-non-null-assertion
	public uniqueId = crypto.getRandomValues(new Int8Array(2))!.toLocaleString().replace(/[-]|[,]/g, '');
}
