import { IAttributes, IController, IRootElementService, IScope } from 'angular';
import { Indexed } from '@ledge/types';

export interface IBaseComponentCtrl extends Indexed<IController> {
	[index: string]: any;
}

export interface IComponentCtrl extends IBaseComponentCtrl {
	$scope: IScope;
	$element: IRootElementService;
	$attrs: IAttributes;
}

export interface ICoreModel extends Indexed {
	Id: number;
	Description: string;
}
