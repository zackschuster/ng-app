import fs = require('fs');
import path = require('path');
import HtmlWebpackPlugin = require('html-webpack-plugin');

const cwd = process.cwd();
const docs = path.join(cwd, 'docs');

class NgAppDocsPlugin {
	public apply(compiler: any) {
		compiler.hooks.emit.tap(this.constructor.name, () => {
			const files = fs.readdirSync(docs, { withFileTypes: true }).filter(x => x.isFile());
			files.forEach(x => fs.unlinkSync(path.join(docs, x.name)));
		});
		compiler.hooks.afterEmit.tap(this.constructor.name, () => {
			fs.writeFileSync(path.join(docs, 'CNAME'), 'ng-app.js.org');
		});
	}
}

// @ts-ignore
module.exports = (env = 'development') => {
	const config = require('@ledge/configs/webpack.merge')(env, {
		output: {
			path: env !== 'development'
				? docs
				: cwd,
			publicPath: env !== 'development'
				? '/ng-app/'
				: '/',
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
			baseUrl: env !== 'development' ? '/ng-app/' : '/',
		}),
		new NgAppDocsPlugin(),
	);

	return config;
};
