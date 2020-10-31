import { NgController, app, h } from '../../index';

class ModalController extends NgController {
	public title = 'Example Modal';
	public body = 'Body';
}

class AppController extends NgController {
	public openModal() {
		app.modal.open({
			controller: ModalController,
			title: '{{$ctrl.title}}',
			template: '<p class="lead">{{$ctrl.body}}</p>',
		});
	}

	public openConfirmToast() {
		this.$log.confirm('Yes or No?')
			.then(() => this.$log.success('Yes!'))
			.catch(() => this.$log.info('No...'));
	}
}

app
	.module
	.controller(
		'AppController',
		app.makeComponentController(AppController),
	);

app
	.configure({ API_HOST: 'api.ng-app.js.org' })
	.bootstrap()
	.then(() => {
		app.log.success('Welcome... to The World...');
	});

class CustomElementExample extends HTMLElement {
	public connectedCallback() {
		this.classList.add('lead');
	}
}

customElements.define('custom-element-example', CustomElementExample);

let clickCounter = 0;
const jsxExampleSection =
	<section className='container mt-5'>
		<div className='row'>
			<div className='col-12'>
				<div class='card'>
					<div className='card-body'>
						<h2>This section was made using ng-app's built-in JSX support</h2>
						<h3>It enables working directly with DOM elements in a declarative manner</h3>
						<custom-element-example>Custom Elements are also supported</custom-element-example>
						<br />
						<CustomElementExample>Work with them in whichever manner you prefer</CustomElementExample>
						<br />
						<button id='native-onlick' class='btn btn-dark my-4'
							onclick={() => app.log.info(`Clicked ${++clickCounter} times`)}>
							Try clicking this button!
						</button>
						<pre class='bg-light p-3 mt-3'>
							{`<h2>This section was made using ng-app's built-in JSX support</h2>
<h3>It enables working directly with DOM elements in a declarative manner</h3>
<custom-element-example>Custom Elements are also supported</custom-element-example>
<br />
<CustomElementExample>Work with them in whichever manner you prefer</CustomElementExample>
<br />
<button id='native-onlick' class='btn btn-dark my-4'
	onclick={() => app.log.info(\`Clicked \${++clickCounter} times\`)}>
	Try clicking this button!
</button>`.trim()
							}
						</pre>
					</div>
				</div>
			</div>
		</div>
	</section>;

jsxExampleSection.querySelector('.card-body')?.appendChild(
	<table>
		<thead>
			<th>
				This table was generated programmatically:
			</th>
		</thead>
		<tbody>
			{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => <tr><td>{x}</td></tr>)}
		</tbody>
	</table>,
).parentNode?.appendChild(
	<pre class='bg-light p-3 mt-3'>
		{`<table>
	<thead>
		<th>
			This table was generated programmatically:
		</th>
	</thead>
	<tbody>
		{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => <tr><td>{x}</td></tr>)}
	</tbody>
</table>`.trim()
		}
	</pre>,
);

document.body.appendChild(jsxExampleSection);
