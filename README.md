# @ledge/ng-app [![Build Status](https://travis-ci.org/zackschuster/ng-app.svg?branch=master)](https://travis-ci.org/zackschuster/ng-app)

> An ES2015+ shim layer for Angular.js, written & distributed in TypeScript

## Common dependencies included

- [angular-animate](https://www.npmjs.com/package/angular-animate)
- [angular-messages](https://www.npmjs.com/package/angular-messages)
- [angular-ui-bootstrap](https://www.npmjs.com/package/angular-ui-bootstrap)
- [angular-ui-router](https://www.npmjs.com/package/@uirouter/angularjs)

## Designed for native modules

```js
import { app, NgRouter } from '@ledge/ng-app';
import * as components from './components';
import * as routes from './routes';

import 'ng1dependency1';
import 'ng1dependency2';

/**
 * Accepts Angular.js module names
 */
app.addDependencies('ng1dependency1', 'ng1dependency2');

/**
 * Only supports components - no abstracted directive API
 */
app.addComponents(components);

/**
 * Exposes raw Angular.js module APIs
 */
app.module.run(['serviceName', (serviceName) => {
	// run block code
}]);
app.module.config(['serviceName', (serviceName) => {
	// config block code
}]);

/**
 * Angular.js-style interceptor declarations with no $injector boilerplate
 * (`requestError` currently not supported)
 */
app.addHttpInterceptor({
	request(cfg) {
		// ...
		return cfg;
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
 * Routing support built-in with angular-ui-router
 * @see https://github.com/angular-ui/ui-router
 * @see https://github.com/ui-router/core
 *
 * Supports StateDeclaration-based routes with ng-app extras
 * @see https://github.com/ui-router/core/blob/095f531977971de387c619024c284f0f4df375d6/src/state/interface.ts#L111
 * @see https://github.com/zackschuster/ng-app/blob/91c6c6348d9bd501143bb570b6628ceae6299a9f/src/router.ts#L142
 */
class AppRouter extends NgRouter {
	constructor() {
		this.routes = routes;
	}
	getRoutes() {
		return this.routes;
	}
}

app.setRouter(new AppRouter());

/**
 * Only supports calling bootstrap manually
 * Closes resource (component/module/router/etc) registration
 * By default, strictDi is enabled
 * To disable: `app.bootstrap({ strictDi: false });`
 */
app.bootstrap();
```

## Statically referenceable singleton services

```js
import { app } from '@ledge/ng-app';

const http = app.http(); // using $http service
const modal = app.modal(); // using ui-bootstrap modal
const logger = app.logger(); // using Noty.js + $log service
const timeout = app.timeout(); // returns $timeout service
```

## Built-in, zero-config components

- Built for Bootstrap 4+
- Supports disabled, required and readonly tags, as well as their `ng-`equivalents
- Generates well-formed & accessible HTML structures with labels, ids, names, etc.

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
