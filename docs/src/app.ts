import { NgController, NgRouter, app } from '../../index';

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
}

app
	.module
	.controller(
		'AppController',
		app.makeComponentController(AppController),
	);

app
	.configure({
		PREFIX: {
			API: 'api.ng-app.js.org',
		},
	})
	.setRouter(new NgRouter())
	.bootstrap()
	.then(() => {
		app.log.success('Welcome... to The World...');
	});
