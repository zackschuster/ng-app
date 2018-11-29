import path = require('path');
import HtmlWebpackPlugin = require('html-webpack-plugin');

const cwd = process.cwd();
const docs = path.join(cwd, 'docs');

module.exports = (env = 'development') =>
	require('@ledge/configs/webpack.merge')(env, {
		entry: {
			app: ['app.ts', 'styles.scss']
				.map(file => path.join(docs, 'src', file)),
		},
		output: {
			path: env !== 'development'
				? docs
				: process.cwd(),
			publicPath: env !== 'development'
				? '/ng-app/'
				: '/',
		},
		resolve: {
			modules: ['docs'],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: '!!pug-loader?!docs/src/index.pug',
				title: '@ledge/ng-app docs',
				baseUrl: env !== 'development' ? '/ng-app/' : '/',
			}),
		],
	});
