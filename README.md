# @ledge/ng-app [![test status](https://builds.sr.ht/~ledge/ng-app.svg)](https://builds.sr.ht/~ledge/ng-app?)

> Powerful, easy-to-use app container for Angular.js with ES Modules. Types included. IE11 supported.

## Designed for native modules

```js
import { app, NgRouter } from '@ledge/ng-app';
import * as components from './components';
import * as routes from './routes';

import 'ng1dependency1';
import 'ng1dependency2';

/**
 * Use any Angular.js module
 */
app.addDependencies('ng1dependency1', 'ng1dependency2');

/**
 * Submit your component declarations as a simple object
 */
app.addComponents(components);

/**
 * Write interceptors with no boilerplate
 */
app.addHttpInterceptor({
	request(cfg) {
		// ...
		return cfg;
	},
	requestError(err) {
		// ...
		return err;
	},
	response(rsp) {
		// ...
		return rsp;
	},
	responseError(err) {
		// ...
		return err;
	},
});

/**
 * Work with raw Angular.js module APIs
 */
app.module.run(['serviceName', (serviceName) => {
	// run block code
}]);
app.module.config(['serviceName', (serviceName) => {
	// config block code
}]);

/**
 * Use state-based routing with angular-ui-router
 * @see https://github.com/angular-ui/ui-router
 * @see https://github.com/ui-router/core
 */
class AppRouter extends NgRouter {
	constructor() {
		this.routes = [/* ... */];
	}
	getRoutes() {
		return this.routes;
	}
}
app.setRouter(new AppRouter());

/**
 * Initiate the container
 */
app.bootstrap();
```

## Statically referenceable singleton services

```js
import { app } from '@ledge/ng-app';

const http = app.http; // using $http service
const log = app.log; // using $log service + custom toast w/ bootstrap classes
const modal = app.modal; // using custom modal w/ bootstrap classes
```

## Built-in, zero-config components

- Compatible with Bootstrap 4
- Supports `disabled`, `required` and `readonly` attributes, as well as their `ng-`equivalents
- Generates well-formed & accessible HTML structures with labels, ids, names, etc.
- Validation applied via `angular-messages`

```html
<text-input ng-model="model1">
	Label Text
</text-input>
<html-input ng-model="model1" type="number" min="0" max="100" step="1">
	Label Text
</html-input>
<html-input ng-model="model1" type="range" min="0" max="100" step="1">
	Label Text
</html-input>

<text-box ng-model="model2" required>
	Other Label Text
</text-box>
<date-input ng-model="dateInput" min-date="minDateValue" max-date="maxDateValue">
	Date Label Text
</date-input>

<check-box ng-model="model3">
	<!-- "Model 3" will be generated as the label text  -->
	<contain>
		<text-input type="number" ng-model="model4" ng-disabled="!model3" min="1" max="2">
			<!-- This label text will be used for screen readers -->
			Description for the Model 3 checkbox
		</text-input>
	</contain>
</check-box>

<fieldset class="form-group">
	<legend>
		Legend Text
	</legend>
	<radio-list ng-model="model5" list="[{Text: 'Item 1', Value: 1}, {Text: 'Item 2', Value: 2}]"></radio-list>
</fieldset>
```

## IE11 Support

ng-app `.js` bundles are compiled to ES5 & are drop-in ready for IE11

ng-app `.cjs`/`.mjs` bundles are compiled to ES2015 & are NOT drop-in ready for IE11 (see [below](#using-build-tools))

ng-app requires no polyfills to run in IE11

### Starter HTML

```html
<!DOCTYPE html>
	<html lang="en">
	<head>
		<base href="/">
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>Document</title>
	</head>
	<body>
		<fieldset ng-controller="AppController as $ctrl">
			<legend>Modal</legend>
			<button type="button" ng-click="$ctrl.openModal()">Open Modal</button>
			<button type="button" ng-click="$ctrl.openConfirmToast()">Open Confirmation Toast</button>
		</fieldset>

		<script src="https://unpkg.com/angular@1/angular.min.js"></script>
		<script src="https://unpkg.com/angular-messages@1/angular-messages.min.js"></script>
		<script src="https://unpkg.com/@ledge/ng-app@6/build/ng-app.production.js"></script>

		<script>
			ngApp.app.module
				.controller(
					'AppController',
					ngApp.app.makeComponentController(function AppController() {
						var $ctrl = this;

						$ctrl.openModal = function openModal() {
							ngApp.app.modal.open({
								controller: function ModalController() {
									this.title = 'Example Modal';
									this.body = 'Body';
								},
								title: '{{$ctrl.title}}',
								template: '<p class="lead">{{$ctrl.body}}</p>',
							});
						};

						$ctrl.openConfirmToast = function openConfirmToast() {
							$ctrl.$log.confirm('Yes or No?')
								.then(() => $ctrl.$log.success('Yes!'))
								.catch(() => $ctrl.$log.info('No...'));
						};
					}),
				);

			ngApp.app.bootstrap().then(function () {
				ngApp.app.log.success('Welcome... to The World...');
			});
		</script>
	</body>
</html>
```

### Using build tools

By default, the `.mjs` bundle will be used. This bundle is compiled to es2015 and does NOT run in IE11 out-of-the-box. You can either alias to the es5 bundles or transform the bundle using a plugin. For an example of the latter, see the webpack configuration in the project repository.
