import { app } from '../..';

app
	.configure({
		PREFIX: {
			API: 'http://localhost:2323',
		},
	});

export { app };
