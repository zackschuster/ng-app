import { NgRouter, app } from '../../index';

app
	.setRouter(new NgRouter())
	.bootstrap()
	.then(() => {
		app.log.success('Welcome... to The World...');
		const openModalBtn = document.getElementById('open-modal') as HTMLButtonElement;
		openModalBtn.addEventListener('click', _ => app.modal.open());
	});
