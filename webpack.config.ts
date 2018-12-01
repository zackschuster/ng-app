import { Compiler } from 'webpack';

import fs = require('fs');
import path = require('path');
import HtmlWebpackPlugin = require('html-webpack-plugin');

class NgAppDocsPlugin {
	constructor(private isDev: boolean) {}
	public apply(compiler: Compiler) {
		if (this.isDev === false) {
			compiler.hooks.emit.tap(this.constructor.name, () => {
				const files = fs.readdirSync(docs, { withFileTypes: true }).filter(x => x.isFile());
				files.forEach(x => fs.unlinkSync(path.join(docs, x.name)));
			});
		}

		compiler.hooks.emit.tap(this.constructor.name, cmp => {
			const { source } = cmp.assets['index.html'];
			const polyfillKey = Object.keys(cmp.assets).find(x => x.startsWith('polyfills'));

			cmp.assets['index.html'].source = function indexSourceFn() {
				return source().replace(
					'<head>',
					`<head><script type="text/javascript" src="/${polyfillKey}" nomodule></script>`,
				);
			};
		});

		compiler.hooks.afterEmit.tap(this.constructor.name, () => {
			fs.writeFileSync(path.join(docs, 'CNAME'), 'ng-app.js.org');
		});
	}
}

const docs = path.join(process.cwd(), 'docs');

module.exports = (env = 'development') =>
	require('@ledge/configs/webpack.merge')(env, {
		entry: {
			app: ['app.ts', 'styles.scss']
				.map(file => path.join(docs, 'src', file)),
			polyfills: 'polyfills.ts',
		},
		output: {
			path: docs,
			publicPath: '/',
		},
		resolve: {
			modules: ['docs'],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: '!!pug-loader?!docs/src/index.pug',
				title: '@ledge/ng-app docs',
				chunks: ['app'],
			}),
			new NgAppDocsPlugin(env === 'development'),
		],
	});
