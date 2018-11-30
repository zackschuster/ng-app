import { Compiler } from 'webpack';

import fs = require('fs');
import path = require('path');
import HtmlWebpackPlugin = require('html-webpack-plugin');

const cwd = process.cwd();
const docs = path.join(cwd, 'docs');

class NgAppDocsPlugin {
	constructor(private isDev: boolean) { }
	public apply(compiler: Compiler) {
		if (this.isDev === false) {
			compiler.hooks.emit.tap(this.constructor.name, cmp => {
				const { source } = cmp.assets['index.html'];
				const polyfillKey = Object.keys(cmp.assets).find(x => x.startsWith('polyfills'));

				cmp.assets['index.html'].source = function indexSourceFn() {
					return source().replace(
						'<script type="text/javascript"',
						`<script type="text/javascript">
							if (!('fetch' in window && 'assign' in Object)) {
								var scriptElement = document.createElement('script');
								scriptElement.async = false;
								scriptElement.src = '/${polyfillKey}';
								document.head.appendChild(scriptElement);
							}
						</script><script type="text/javascript"`,
					);
				};

				const files = fs.readdirSync(docs, { withFileTypes: true }).filter(x => x.isFile());
				files.forEach(x => fs.unlinkSync(path.join(docs, x.name)));
			});
		}
		compiler.hooks.afterEmit.tap(this.constructor.name, () => {
			fs.writeFileSync(path.join(docs, 'CNAME'), 'ng-app.js.org');
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
		path.resolve(cwd, 'docs', 'src', 'app.ts'),
		path.resolve(cwd, 'docs', 'src', 'styles.scss'),
	];

	config.resolve.modules = ['.', 'docs', 'node_modules'];

	config.plugins.push(
		new HtmlWebpackPlugin({
			template: '!!pug-loader?!docs/src/index.pug',
			title: '@ledge/ng-app docs',
		}),
		new NgAppDocsPlugin(env === 'development'),
	);

	return config;
};
