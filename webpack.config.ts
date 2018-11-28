// tslint:disable:no-var-requires
const { join } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const docs = join(process.cwd(), 'docs');

module.exports = (env = 'development') =>
	require('@ledge/configs/webpack.merge')(env, {
		entry: {
			app: ['app.ts', 'styles.scss'].map(x => join(docs, 'src', x)),
		},
		output: {
			path: env !== 'development' ? docs : process.cwd(),
		},
		resolve: {
			modules: ['docs'],
		},
		plugins: [
			new HtmlWebpackPlugin({
				template: '!!pug-loader?!docs/src/index.pug',
				title: '@ledge/ng-app docs',
				baseUrl: '/',
			}),
		],
	});
