// tslint:disable:no-var-requires
const { resolve } = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const context = process.cwd();

module.exports = (env = 'development') => {
	const config = require('@ledge/configs/webpack.merge')(env, {});

	config.entry.app = [
		resolve(context, 'docs', 'app.ts'),
		resolve(context, 'docs', 'styles.scss'),
	];

	config.resolve.modules = ['.', 'docs', 'node_modules'];

	config.module.rules.splice(
		config.module.rules.findIndex((x: { test: RegExp}) => x.test.source === '\\.ts$'),
		1,
		{
			test: /\.ts$/,
			use: {
				loader: require.resolve('ts-loader'),
				options: {
					context: process.cwd(),
					transpileOnly: true,
					onlyCompileBundledFiles: true,
					compilerOptions: Object.assign(
						require('@ledge/configs/tsconfig.base').compilerOptions,
						require('@ledge/configs/tsconfig.browser').compilerOptions,
						{ target: 'es2018', esModuleInterop: true },
					),
				},
			},
		},
	);

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
