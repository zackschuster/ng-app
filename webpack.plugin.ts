// tslint:disable:no-var-requires
const { transpileModule } = require('typescript');
const { compilerOptions } = require('./tsconfig.json');

Object.assign(compilerOptions, { module: 5 });
module.exports = function transpileCode(content) {
	return transpileModule(content, { compilerOptions }).outputText;
};
