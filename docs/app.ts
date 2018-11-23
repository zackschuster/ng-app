import { NgRouter, app } from '../index';

app.log.success('Welcome... to The World...');

class Router extends NgRouter {}

app
	.setRouter(new Router())
	.bootstrap();
