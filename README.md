# @ledge/ng-app [![Build Status](https://travis-ci.org/zackschuster/ng-app.svg?branch=master)](https://travis-ci.org/zackschuster/ng-app)

> An ESM-friendly shim layer for Angular.js, written & distributed in TypeScript

## ESM-friendly api

```js
import { app, NgRouter } from '@ledge/ng-app';
import { myComponent } from './my-component';
import * as myRoutes from './my-routes';

// simple DI
app
	.addDependency('ng1dependency')
	.addDependencies(['ng1dependency1', 'ng1dependency2']);

// configuration
app.module.run(['serviceName', (serviceName) => {
	/** run block code */
}]);
app.module.config(['serviceName', (serviceName) => {
	/** config block code */
}]);

app.addHttpInterceptor({
	request(config) {
		return config;
	},
	response(rsp) {
		return rsp;
	},
	responseError(rejection: any) {
		return rejection;
	}
});

// component-based, no directives
app
	.addComponents({ myComponent });

// ui-router
class AppRouter extends NgRouter {
	getRoutes() {
		const routes = [/* ...StateDeclaration-based routes...*/];
		return routes;
	}
}

app
	.setRouter(new AppRouter());

// registration closes when bootstrap is called
app.bootstrap();
```

## Common dependencies included

- [angular-animate](https://www.npmjs.com/package/angular-animate)
- [angular-messages](https://www.npmjs.com/package/angular-messages)
- [angular-ui-bootstrap](https://www.npmjs.com/package/angular-ui-bootstrap)
- [angular-ui-router](https://www.npmjs.com/package/@uirouter/angularjs)

## Statically referenceable singleton services

```js
import { app } from '@ledge/ng-app';

const http = app.http; // using $http service
const modal = app.modal; // using ui-bootstrap modal
const log = app.log; // using Noty.js + $log service
```

## Built-in, zero-config components

- Built for Bootstrap 4+
- Supports disabled, required and readonly tags, as well as their `ng-`equivalents
- Generates well-formed & accessible HTML structures with labels, ids, names, etc.

```html
<text-input ng-model="model1">
	Label Text
</text-input>
<text-input ng-model="model1" type="number" min="0" max="100" step="1">
	Label Text
</text-input>
<text-input ng-model="model1" type="range" min="0" max="100" step="1">
	Label Text
</text-input>

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
