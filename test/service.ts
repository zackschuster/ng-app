import test from 'ava';
import { $svc } from './mocks';

test('$svc.splitByCapitalLetter', t => {
	t.is($svc.splitByCapitalLetter('splitByCapitalLetter'), 'Split By Capital Letter');
	t.is($svc.splitByCapitalLetter('splitBy CapitalLetter'), 'Split By Capital Letter');
	t.is($svc.splitByCapitalLetter('splitBy capitalLetter'), 'Split By capital Letter');
	t.is($svc.splitByCapitalLetter('splitBycapitalLetter'), 'Split Bycapital Letter');
	t.is($svc.splitByCapitalLetter('exampleFAQ'), 'Example FAQ');
	t.is($svc.splitByCapitalLetter('exampleF.A.Q.'), 'Example F.A.Q.');
	t.is($svc.splitByCapitalLetter('exampleF.A.Q.Replies'), 'Example F.A.Q. Replies');
	t.is($svc.splitByCapitalLetter('exampleF.A.Q.replies'), 'Example F.A.Q. Replies');
	t.is($svc.splitByCapitalLetter('FBIstatistics'), 'FBIstatistics');
	t.is($svc.splitByCapitalLetter('F.B.I.Statistics'), 'F.B.I. Statistics');
	t.is($svc.splitByCapitalLetter('F.B.I.statistics'), 'F.B.I. Statistics');
	t.is($svc.splitByCapitalLetter('Green-FlameBlade'), 'Green-Flame Blade');
});
