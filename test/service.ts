// tslint:disable: no-async-without-await
import test from 'ava';
import { app } from './-mocks';

test('NgService.splitByCapitalLetter', async t => {
	t.is(app.util.splitByCapitalLetter('splitByCapitalLetter'), 'Split By Capital Letter');
	t.is(app.util.splitByCapitalLetter('splitBy CapitalLetter'), 'Split By Capital Letter');
	t.is(app.util.splitByCapitalLetter('splitBy capitalLetter'), 'Split By capital Letter');
	t.is(app.util.splitByCapitalLetter('splitBycapitalLetter'), 'Split Bycapital Letter');
	t.is(app.util.splitByCapitalLetter('exampleF.A.Q.'), 'Example F.A.Q.');
	t.is(app.util.splitByCapitalLetter('exampleF.A.Q.Replies'), 'Example F.A.Q. Replies');
	t.is(app.util.splitByCapitalLetter('exampleF.A.Q.replies'), 'Example F.A.Q. Replies');
	t.is(app.util.splitByCapitalLetter('FBIstatistics'), 'FBIstatistics');
	t.is(app.util.splitByCapitalLetter('F.B.I.Statistics'), 'F.B.I. Statistics');
	t.is(app.util.splitByCapitalLetter('F.B.I.statistics'), 'F.B.I. Statistics');
	t.is(app.util.splitByCapitalLetter('Green-FlameBlade'), 'Green-Flame Blade');
});
