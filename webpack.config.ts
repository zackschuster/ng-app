import { readdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';
import { Compiler } from 'webpack';
import { BundleStatsWebpackPlugin } from 'bundle-stats-webpack-plugin';
import HtmlWebpackPlugin from 'html-webpack-plugin';
// @ts-ignore
import webpackConfigMerge from '@ledge/configs/webpack.merge';

const cwd = process.cwd();
const docs = join(cwd, 'docs');

class NgAppDocsPlugin {
	constructor(private isDev: boolean) { }
	public apply(compiler: Compiler) {
		if (this.isDev === false) {
			compiler.hooks.emit.tap(this.constructor.name, () => {
				const files = readdirSync(docs, { withFileTypes: true }).filter(x => x.isFile());
				files.forEach(x => unlinkSync(join(docs, x.name)));
			});
		}

		compiler.hooks.afterEmit.tap(this.constructor.name, () => {
			writeFileSync(join(docs, 'CNAME'), 'ng-app.js.org');
		});
	}
}

export default (env = 'development') => {
	const config = webpackConfigMerge(env, {
		entry: {
			app: 'docs/src/app.tsx',
			styles: 'docs/src/styles.scss',
			polyfills: 'polyfills.ts',
		},
		output: {
			path: docs,
			publicPath: '/',
		},
		resolve: {
			modules: ['.', 'docs', 'node_modules'],
		},
		plugins: [
			new HtmlWebpackPlugin({ template: 'docs/src/index.pug', title: '@ledge/ng-app docs' }),
			new NgAppDocsPlugin(env === 'development'),
		],
	});

	if (env === 'production') {
		config.plugins.push(new BundleStatsWebpackPlugin());
	}

	return config;
};
