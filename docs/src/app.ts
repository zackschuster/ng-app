import { NgRouter, app } from '../../index';

app
	.setRouter(new NgRouter())
	.bootstrap()
	.then(() => app.log.success('Welcome... to The World...'));
