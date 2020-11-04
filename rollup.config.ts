import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

export default ['development', 'staging', 'production', 'esm', 'cjs'].map(env => {
	const isEsm = env === 'esm';
	const isCjs = env === 'cjs';
	const isEsmOrCjs = isEsm || isCjs;
	const isProduction = env === 'production';

	return {
		input: 'index.ts',
		external: ['angular', 'angular-messages'],
		context: isEsmOrCjs ? 'globalThis' : 'window',
		output: {
			file: `build/ng-app.${isEsm ? 'mjs' : `${env}${isCjs ? '' : '.js'}`}`,
			format: isEsmOrCjs ? env : 'iife',
			name: 'ngApp',
			globals: {
				angular: 'angular',
			},
			sourcemap: true,
		},
		plugins: [
			commonjs({ esmExternals: isEsm, requireReturnsDefault: 'namespace' }),
			nodeResolve(),
			typescript({ target: `es${isEsmOrCjs ? 2019 : 5}`, exclude: ['docs', 'test'] }),
			replace({ 'process.env.NODE_ENV': JSON.stringify(isEsmOrCjs ? 'production' : env) }),
			isProduction ? terser() : undefined,
		],
	};
});
