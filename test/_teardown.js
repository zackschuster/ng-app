const fs = require('fs');
const path = require('path');

if (fs.existsSync('snapshot.log') === false) {
	fs.appendFileSync('snapshot.log', '');
} else {
	fs.truncateSync('snapshot.log', 0);
}

const inputsDir = path.join(process.cwd(), 'test', 'inputs');

const dirs = fs.readdirSync(inputsDir)
	.filter(x => fs.statSync(path.join(inputsDir, x)).isDirectory())
	.map(x => path.join(inputsDir, x))

for (let dir of dirs) {
	const htmlFiles = fs.readdirSync(dir)
		.map(x => path.join(dir, x))
		.filter(x => fs.statSync(x).isFile())
		.filter(x => path.extname(x) === '.html');

	for (const file of htmlFiles) {
		fs.unlinkSync(file);
		fs.appendFileSync('snapshot.log', file + '\n');
	}
}
