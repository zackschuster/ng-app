import { app } from '../..';

export const $prefix = 'localhost:2323';
export const { config: $config } = app.configure({
	PREFIX: {
		API: $prefix,
	},
});
