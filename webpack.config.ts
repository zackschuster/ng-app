// tslint:disable:no-var-requires
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const context = process.cwd();

// @ts-ignore
module.exports = (env = 'development') => {
	const config = require('@ledge/configs/webpack.merge')(env, { });

	config.entry.app = [
		resolve(context, 'docs', 'app.ts'),
		resolve(context, 'docs', 'styles.scss'),
	];

	config.resolve.modules = ['.', 'docs', 'node_modules'];

	config.plugins.push(
		new HtmlWebpackPlugin({
			template: '!!pug-loader?!docs/index.pug',
			title: '@ledge/ng-app docs',
			baseUrl: '/',
		}),
	);

	if (env !== 'development') {
		config.plugins.push(
			new CopyWebpackPlugin([
				{ context: 'src', from: 'images/**/*' },
			]),
		);
	}

	return config;
};
