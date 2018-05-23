# @ledge/ng-app

> Keep Angular.js in a corner.

## ESM-friendly api

```js
import { app } from '@ledge/ng-app';
import { myComponent } from './my-component';
import * as myRoutes from './my-routes';

app
	.registerDependency('ng1dependency')
	.registerDependencies(['ng1dependency1', 'ng1dependency2'])
  .registerRoutes(myRoutes) // using ui-router
	.registerTransitionHook('onBefore', { to: '**' }, ['serviceName', (serviceName) => {
		/** ui-router transition hook code */
	}])
  .registerComponents({ myComponent })
  .registerRunBlock(['serviceName', (serviceName) => {
		/** run block code */
	}])
	.registerConfigBlock(['serviceName', (serviceName) => {
		/** config block code */
	}])
	.registerHttpInterceptor(['serviceName', (serviceName) => {
		/** http interceptor code */
	}])
  .bootstrap();
```

## Common dependencies included

- [angular-animate](https://www.npmjs.com/package/angular-animate)
- [angular-messages](https://www.npmjs.com/package/angular-messages)
- [angular-ui-bootstrap](https://www.npmjs.com/package/angular-ui-bootstrap)
- [angular-ui-router](https://www.npmjs.com/package/@uirouter/angularjs)
- [angular-elastic](https://www.npmjs.com/package/angular-elastic)

## Easily extractable service references

```js
import { app } from '@ledge/ng-app';

const http = app.http(); // using $http service
const modal = app.modal(); // using ui-bootstrap modal
const logger = app.logger(); // using Noty.js + $log service
const timeout = app.timeout(); // returns $timeout service
```

## Built-in, zero-config components

- Built for Bootstrap 4
- Supports disabled, required and readonly tags, as well as their `ng-`equivalents
- Generates well-formed & accessible HTML structures with labels, ids, names, etc.

```html
<text-input ng-model="model1">
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
