import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

export default ['development', 'staging', 'production', 'esm', 'cjs'].map(env => {
	const isEsm = env === 'esm';
	const isCjs = env === 'cjs';
	const isEsmOrCjs = isEsm || isCjs;

	return {
		context: isEsmOrCjs ? 'globalThis' : 'window',
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
			typescript({ target: `es${isEsmOrCjs ? 2019 : 5}` }),
			replace({ 'process.env.NODE_ENV': JSON.stringify(isEsmOrCjs ? 'production' : env) }),
			env === 'production' ? terser() : undefined,
		],
	};
});
