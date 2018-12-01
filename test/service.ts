import test from 'ava';
import { $svc } from './mocks';

test('$svc.splitByCapitalLetter', async t => {
	t.is($svc.splitByCapitalLetter('splitByCapitalLetter'), 'Split By Capital Letter');
	t.is($svc.splitByCapitalLetter('splitBy CapitalLetter'), 'Split By Capital Letter');
	t.is($svc.splitByCapitalLetter('splitBy capitalLetter'), 'Split By capital Letter');
	t.is($svc.splitByCapitalLetter('splitBycapitalLetter'), 'Split Bycapital Letter');
});
