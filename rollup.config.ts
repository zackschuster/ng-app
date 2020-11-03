import { nodeResolve } from '@rollup/plugin-node-resolve';
import { terser } from 'rollup-plugin-terser';
import commonjs from '@rollup/plugin-commonjs';
import replace from '@rollup/plugin-replace';
import typescript from '@rollup/plugin-typescript';

export default ['development', 'staging', 'production', 'esm'].map(env => ({
	input: 'index.ts',
	external: ['angular', 'angular-messages'],
	context: env === 'esm' ? 'globalThis' : undefined,
	output: {
		file: `build/ng-app.${env}.js`,
		format: env === 'esm' ? env : 'iife',
		name: 'ngApp',
		globals: {
			angular: 'angular',
		},
		sourcemap: true,
	},
	plugins: [
		commonjs({ esmExternals: env === 'esm', requireReturnsDefault: 'namespace' }),
		nodeResolve({ mainFields: [env === 'esm' ? 'module' : undefined, 'main'] }),
		typescript({ target: `es${env === 'esm' ? 2015 : 5}`, exclude: ['docs', 'test'] }),
		replace({ 'process.env.NODE_ENV': JSON.stringify(env === 'esm' ? 'production' : env) }),
		env === 'production' ? terser() : undefined,
	],
}));
