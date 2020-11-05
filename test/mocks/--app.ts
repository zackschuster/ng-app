import { app } from '../../index';

export const $prefix = 'localhost:2323';

app.configure({ API_HOST: $prefix });

export const $config = app.config;

export { app };
