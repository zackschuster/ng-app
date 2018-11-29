import { NgRouter, app } from '../../index';

app
	.setRouter(new (class extends NgRouter { })())
	.bootstrap()
	.then(() => app.log.success('Welcome... to The World...'));
