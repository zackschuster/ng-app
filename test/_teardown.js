// tslint:disable:file-name-casing
const fs = require('fs');
const path = require('path');

const inputsDir = path.join(process.cwd(), 'test', 'inputs');
const snapshotLog = path.join(inputsDir, 'snapshot.log');

if (fs.existsSync(snapshotLog)) {
	fs.truncateSync(snapshotLog, 0);
} else {
	fs.appendFileSync(snapshotLog, '');
}

const dirs = fs.readdirSync(inputsDir)
	.filter(x => fs.statSync(path.join(inputsDir, x)).isDirectory())
	.map(x => path.join(inputsDir, x));

for (let dir of dirs) {
	const htmlFiles = fs.readdirSync(dir)
		.map(x => path.join(dir, x))
		.filter(x => fs.statSync(x).isFile())
		.filter(x => path.extname(x) === '.html');

	for (const file of htmlFiles) {
		fs.unlinkSync(file);
		fs.appendFileSync(snapshotLog, file + '\n');
	}
}
