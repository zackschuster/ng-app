import { NgController, makeInjectableCtrl } from '../src/controller';
import { NgAttributes } from '../src/attributes';
import { makeDefaultApp } from '../index';

export const $prefix = 'localhost:2323';
export const app = makeDefaultApp({ API_HOST: $prefix })
	.addDependencies('ngMock', 'ui.router');

const base = app.renderer.createElement('base');
base.href = '/';
(document.head as HTMLHeadElement).appendChild(base);

app.bootstrap();

const Ctrl = makeInjectableCtrl(NgController, {
	log: app.log,
	http: app.http,
	renderer: app.renderer,
	config: () => app.config,
});

export const $scope = app.$injector.get('$rootScope').$new();
export const $element = app.$injector.get('$compile')(document.createElement('div'))($scope);
export const $ctrl = new Ctrl($element, $scope, app.$injector);

export function $invokeTemplate(template: any, $attrs: Partial<NgAttributes>) {
	return app.$injector.invoke(template, { }, { $element, $attrs });
}

export function makeAttrs(ngModel: string) {
	return new NgAttributes($element[0], { 'ng-model': ngModel });
}
