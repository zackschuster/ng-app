import { readdirSync, unlinkSync, writeFileSync } from 'fs';
import { join } from 'path';

const cwd = process.cwd();
const docs = join(cwd, 'docs');

class NgAppDocsPlugin {
	constructor(private isDev: boolean) { }
	public apply(compiler: import('webpack').Compiler) {
		if (this.isDev === false) {
			compiler.hooks.emit.tap(this.constructor.name, () => {
				const files = readdirSync(docs, { withFileTypes: true }).filter(x => x.isFile());
				files.forEach(x => unlinkSync(join(docs, x.name)));
			});
		}

		compiler.hooks.afterEmit.tap(this.constructor.name, () => {
			writeFileSync(join(docs, 'CNAME'), 'ng-app.js.org');
			const files = readdirSync(docs, { withFileTypes: true }).filter(x => x.name.endsWith('.txt'));
			files.forEach(x => unlinkSync(join(docs, x.name)));
		});
	}
}

export default (env = 'development') => {
	const isDevelopment = env === 'development' || (env?.hasOwnProperty('WEBPACK_SERVE') ?? true);
	const config = require('@ledge/configs/webpack.merge')(env, {
		context: docs,
		output: {
			path: docs,
		},
		plugins: [
			new NgAppDocsPlugin(isDevelopment),
		],
	});

	if (isDevelopment === false) {
		config.resolve = { alias: { index: join(cwd, 'build', 'ng-app.mjs') } };
	}

	return config;
};
