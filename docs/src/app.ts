import { MutationTree, NgController, app } from '../../index';

console.log(MutationTree);

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

// const tree = new MutationTree(document.body);
// tree.addAttachElementCallback(el => console.log(`${el} added`));
// tree.addRemoveElementCallback(el => console.log(`${el} removed`));
// tree.observe();

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
