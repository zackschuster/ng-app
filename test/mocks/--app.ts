import { app } from '../..';

export const $prefix = 'http://localhost:2323';

app
	.configure({
		PREFIX: {
			API: $prefix,
		},
	});

export const $config = app.config;

export { app };
