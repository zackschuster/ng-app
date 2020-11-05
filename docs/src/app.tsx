import { IListItem } from '@ledge/types';
import { NgController, app, h } from 'index';

class ModalController extends NgController {
	public title = 'Example Modal';
	public body = 'Body';
}

const listOne = [
	{ Text: 'One', Value: 1 },
	{ Text: 'Two', Value: 2 },
	{ Text: 'Three', Value: 3 },
	{ Text: 'Four', Value: 4 },
];
const listTwo = [
	{ Text: 'Five', Value: 5 },
	{ Text: 'Six', Value: 6 },
	{ Text: 'Seven', Value: 7 },
	{ Text: 'Eight', Value: 8 },
];

class AppController extends NgController {
	public list: IListItem<number>[] = listOne;
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

	public useListOne() {
		this.list = listOne;
		this.$log.info('Using list one');
	}
	public useListTwo() {
		this.list = listTwo;
		this.$log.info('Using list two');
	}
}

class CustomElementExample extends HTMLElement {
	public connectedCallback() {
		this.classList.add('lead');
	}
}

customElements.define('custom-element-example', CustomElementExample);

let clickCounter = 0;
const jsxExampleSection =
	<section className='container-fluid pb-3 mt-sm-3'>
		<div className='row'>
			<div className='col-12'>
				<div class='card shadow-sm'>
					<div className='card-body'>
						<h2>This section was made using ng-app's DOM-in-JSX feature</h2>
						<h3>DOM-in-JSX lets you work directly with DOM elements using JSX's declarative syntax</h3>
						<custom-element-example>Custom Elements?</custom-element-example>
						<br />
						<CustomElementExample>Fully Supported!</CustomElementExample>
						<br />
						<button id='native-onlick' class='btn btn-dark my-4'
							onclick={() => app.log.info(`Clicked ${++clickCounter} times`)}>
							Try clicking this button!
						</button>
						<pre class='bg-light p-3 mt-3'>
							{`const jsxExample =
	<section class='card'>
		<h2>This section was made using ng-app's DOM-in-JSX feature</h2>
		<h3>DOM-in-JSX lets you work directly with DOM elements using JSX's declarative syntax</h3>
		<custom-element-example>Custom Elements?</custom-element-example>
		<br />
		<CustomElementExample>Fully Supported!</CustomElementExample>
		<br />
		<button id='native-onlick' class='btn btn-dark my-4'
			onclick={() => app.log.info(\`Clicked \${++clickCounter} times\`)}>
			Try clicking this button!
		</button>
	</section>;`.trim()
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
			<th>This table was generated programmatically</th>
		</thead>
		<tbody>
			{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => <tr><td>Row {x}</td></tr>)}
		</tbody>
	</table>,
).parentNode?.appendChild(
	<pre class='bg-light p-3 mt-3'>
		{`const jsxTable =
	<table>
		<thead>
			<th>This table was generated programmatically</th>
		</thead>
		<tbody>
			{[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(x => <tr><td>Row {x}</td></tr>)}
		</tbody>
	</table>;

jsxExample.appendChild(jsxTable);
	`.trim()
		}
	</pre>,
);

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
		document.body.querySelector('main')?.appendChild(jsxExampleSection);
		app.log.success('Welcome... to The World...');
	});
