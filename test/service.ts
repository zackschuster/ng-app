import test from 'ava';
import { app } from './-mocks';

test('NgService.splitByCapitalLetter', async t => {
	t.is(app.splitByCapitalLetter('splitByCapitalLetter'), 'Split By Capital Letter');
	t.is(app.splitByCapitalLetter('splitBy CapitalLetter'), 'Split By Capital Letter');
	t.is(app.splitByCapitalLetter('splitBy capitalLetter'), 'Split By capital Letter');
	t.is(app.splitByCapitalLetter('splitBycapitalLetter'), 'Split Bycapital Letter');
	t.is(app.splitByCapitalLetter('exampleF.A.Q.'), 'Example F.A.Q.');
	t.is(app.splitByCapitalLetter('exampleF.A.Q.Replies'), 'Example F.A.Q. Replies');
	t.is(app.splitByCapitalLetter('exampleF.A.Q.replies'), 'Example F.A.Q. Replies');
	t.is(app.splitByCapitalLetter('FBIstatistics'), 'FBIstatistics');
	t.is(app.splitByCapitalLetter('F.B.I.Statistics'), 'F.B.I. Statistics');
	t.is(app.splitByCapitalLetter('F.B.I.statistics'), 'F.B.I. Statistics');
	t.is(app.splitByCapitalLetter('Green-FlameBlade'), 'Green-Flame Blade');
});
