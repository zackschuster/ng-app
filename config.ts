import { IConfig } from '@ledge/types';

export const config: IConfig = {
	NAME: 'ElevateCA Admin',
	VERSION: '1.0.0',
	PREFIX: {
		API: 'http://localhost:5000/api/',
	},
	ENV: process.env.NODE_ENV,
};
