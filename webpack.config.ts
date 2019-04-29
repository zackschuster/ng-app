import fs = require('fs');
import path = require('path');
import HtmlWebpackPlugin = require('html-webpack-plugin');
// @ts-ignore
import merge = require('@ledge/configs/webpack.merge');

const docs = path.join(process.cwd(), 'docs');

class NgAppDocsPlugin {
	constructor(private isDev: boolean) { }

	public apply(compiler: import('webpack').Compiler) {
		if (this.isDev === false) {
			compiler.hooks.emit.tap(this.constructor.name, () => {
				const files = fs
					.readdirSync(docs, { withFileTypes: true })
					.filter(x => x.isFile());

				files.forEach(x => fs.unlinkSync(path.join(docs, x.name)));
			});
		}

		compiler.hooks.afterEmit.tap(this.constructor.name, () => {
			fs.writeFileSync(path.join(docs, 'CNAME'), 'ng-app.js.org');
		});
	}
}

function configure(env = 'development') {
	return merge(env, {
		entry: {
			app: ['app.ts', 'styles.scss'].map(x => path.join(docs, 'src', x)),
			polyfills: path.join(docs, 'src', 'polyfills.ts'),
		},
		output: {
			path: docs,
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: '!!pug-loader?!docs/src/index.pug',
				title: '@ledge/ng-app docs',
			}),
			new NgAppDocsPlugin(env === 'development'),
		],
	});
}

module.exports = configure;
