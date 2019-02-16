import { injector } from 'angular';

export type NgInjector = ReturnType<typeof injector>;
export type NgScope = angular.IScope;

export { injector };
export { bootstrap, module } from 'angular';
