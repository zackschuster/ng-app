import { readdirSync, unlinkSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import { Compiler } from 'webpack';

import HtmlPlugin = require('html-webpack-plugin');
// tslint:disable-next-line: no-var-requires
const { BundleStatsWebpackPlugin } = require('bundle-stats');

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

		compiler.hooks.emit.tap(this.constructor.name, cmp => {
			const { source } = cmp.assets['index.html'];
			const polyfillKey = Object.keys(cmp.assets).find(x => x.startsWith('polyfills'));

			cmp.assets['index.html'].source = function indexSourceFn() {
				return source()
					.replace(
						'</head>',
						`<script type="text/javascript" src="/${polyfillKey}" nomodule></script></head>`,
					)
					.replace(
						`<script type="text/javascript" src="/${polyfillKey}"></script>`,
						'',
					);
			};
		});

		compiler.hooks.afterEmit.tap(this.constructor.name, () => {
			writeFileSync(join(docs, 'CNAME'), 'ng-app.js.org');
		});
	}
}

// tslint:disable-next-line: no-inferrable-types
module.exports = (env: string = 'development') => {
	const config = require('@ledge/configs/webpack.merge')(env, {
		entry: {
			polyfills: 'polyfills.ts',
		},
		output: {
			path: docs,
			publicPath: '/',
		},
	});

	config.entry.app = [
		resolve(cwd, 'docs', 'src', 'app.ts'),
		resolve(cwd, 'docs', 'src', 'styles.scss'),
	];

	config.resolve.modules = ['.', 'docs', 'node_modules'];

	config.plugins.push(
		new HtmlPlugin({
			template: '!!pug-loader?!docs/src/index.pug',
			title: '@ledge/ng-app docs',
		}),
		new NgAppDocsPlugin(env === 'development'),
	);

	if (env === 'production') {
		delete config.devServer;
		config.plugins.push(
			new BundleStatsWebpackPlugin(),
		);
	}

	return config;
};
