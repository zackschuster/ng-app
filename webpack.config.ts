// tslint:disable:no-var-requires
const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = (env = 'development') =>
	require('@ledge/configs/webpack.merge')(env, {
		entry: {
			app: ['app.ts', 'styles.scss'].map(x => join(process.cwd(), 'docs', x)),
		},
		resolve: {
			modules: ['docs'],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: '!!pug-loader?!docs/index.pug',
				title: '@ledge/ng-app docs',
				baseUrl: '/',
			}),
		],
	});
