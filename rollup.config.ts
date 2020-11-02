import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';

export default {
	input: 'index.ts',
	external: ['angular', 'angular-messages'],
	output: {
		file: 'ng-app.js',
		format: 'iife',
		interop: 'default',
		name: 'ngApp',
		globals: {
			angular: 'angular',
		},
		sourcemap: true,
	},
	plugins: [
		commonjs(),
		nodeResolve({ mainFields: ['main'] }),
		typescript({ removeComments: false, esModuleInterop: false, allowSyntheticDefaultImports: true }),
	],
};
