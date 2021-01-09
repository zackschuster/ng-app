import { transpileModule } from 'typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

import { compilerOptions } from './tsconfig.json';
Object.assign(compilerOptions, { module: 5, sourceMap: true });

export default ['development', 'staging', 'production', 'esm', 'cjs'].map(env => {
	const isEsm = env === 'esm';
	const isCjs = env === 'cjs';
	const isEsmOrCjs = isEsm || isCjs;
	const lib = compilerOptions.lib.slice().concat(isEsmOrCjs ? ['es2015.iterable'] : []);

	return {
		context: 'window',
		external: ['angular', 'angular-messages'],
		input: 'index.ts',
		output: {
			file: `build/ng-app.${isEsm ? 'mjs' : `${env}${isCjs ? '' : '.js'}`}`,
			format: isEsmOrCjs ? env : 'iife',
			globals: {
				angular: 'angular',
			},
			name: 'ngApp',
			sourcemap: true,
		},
		plugins: [
			nodeResolve({ modulesOnly: true }),
			typescript({ target: `es${isEsmOrCjs ? 2015 : 5}`, lib }),
			replace({ 'process.env.NODE_ENV': JSON.stringify(isEsmOrCjs ? 'production' : env) }),
			isEsmOrCjs
				? {}
				: {
					transform(code, id) {
						let map = null;
						if (id.indexOf('@ledge/jsx/index.js') > -1) {
							// @ts-ignore
							({ outputText: code, sourceMapText: map } = transpileModule(code, { compilerOptions }));
						}
						return { code, map };
					},
				},
			env === 'production' ? terser() : undefined,
		],
	};
});
