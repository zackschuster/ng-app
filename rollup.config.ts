// tslint:disable:no-var-requires
import typescript from '@alexlur/rollup-plugin-typescript';
import nodeModules from '@ledge/node-modules';
import resolveDeps from 'rollup-plugin-node-resolve';

const tsconfig = require('@ledge/ts-config');
const tsconfigBrowser = require ('@ledge/ts-config/tsconfig.browser');

const compilerOptions = Object.assign(tsconfig.compilerOptions, tsconfigBrowser.compilerOptions);

export default {
	entry: './index.ts',
	targets: [
		{ dest: 'main.js', format: 'cjs' },
		{ dest: 'module.js', format: 'es' },
	],
	external: [
		...nodeModules,
		...Object.keys(require('./package').peerDependencies),
	],
	plugins: [
		typescript(compilerOptions),
		resolveDeps(),
	],
};
