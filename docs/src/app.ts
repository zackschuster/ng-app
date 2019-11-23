import { NgController, NgRouter, app } from '../../index';

class ModalController extends NgController {
	public title = 'Example Modal';
	public body = 'Body';
}

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
		const openModalBtn = document.getElementById('open-modal') as HTMLButtonElement;
		openModalBtn.addEventListener('click', _ => app.modal.open({
			controller: ModalController,
			title: '{{$ctrl.title}}',
			template: '<p class="lead">{{$ctrl.body}}</p>',
		}));
	});
