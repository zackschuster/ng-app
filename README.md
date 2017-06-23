# @ledge/ng-app

> Keep Angular.js in a corner.

## ESM-friendly api

```js
import { app } from '@ledge/ng-app';
import { myComponent } from './my-component';
import * as myRoutes from './my-routes';

app
  .registerRoutes(myRoutes) // using angular-route
  .registerComponents({ myComponent })
  .bootstrap();
```

## Built-in, zero-config components

- Based on Bootstrap 4 (alpha.6)
- Supports disabled, required and readonly tags, as well as their ng-equivalents
- Generates well-formed HTML structures with labels, ids, names, etc.

```html
<text-input ng-model="model1">
  Label Text
</text-input>
<text-box ng-model="model2">
  Other Label Text
</text-box>
<date-input ng-model="">
  Date Label Text
</date-input>

<check-box ng-model="model3">
  <!-- "Model 3" will be generated as the label text  -->
  <contain>
    <text-input ng-model="model4" ng-disabled="!model3">
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

### _More to be documented; read the source for now_
