import fs = require('fs');
import path = require('path');
import HtmlWebpackPlugin = require('html-webpack-plugin');

class NgAppDocsPlugin {
	constructor(private isDev: boolean) {}
	public apply(compiler: any) {
		if (this.isDev === false) {
			compiler.hooks.emit.tap(this.constructor.name, () => {
				const files = fs.readdirSync(docs, { withFileTypes: true }).filter(x => x.isFile());
				files.forEach(x => fs.unlinkSync(path.join(docs, x.name)));
			});
		}
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
			}),
			new NgAppDocsPlugin(env === 'development'),
		],
	});
