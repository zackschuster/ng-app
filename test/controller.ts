import test from 'ava';
import { $compCtrl, $ctrl, $prefix } from './mocks';

test('$ctrl.getApiPrefix', async t => {
	t.is($ctrl.getApiPrefix(), $prefix);
});

test('$ctrl.splitByCapitalLetter', async t => {
	t.is($ctrl.splitByCapitalLetter('splitByCapitalLetter'), 'Split By Capital Letter');
	t.is($ctrl.splitByCapitalLetter('splitBy CapitalLetter'), 'Split By Capital Letter');
	t.is($ctrl.splitByCapitalLetter('splitBy capitalLetter'), 'Split By capital Letter');
	t.is($ctrl.splitByCapitalLetter('splitBycapitalLetter'), 'Split Bycapital Letter');
	t.is($ctrl.splitByCapitalLetter('exampleFAQ'), 'Example FAQ');
	t.is($ctrl.splitByCapitalLetter('exampleF.A.Q.'), 'Example F.A.Q.');
	t.is($ctrl.splitByCapitalLetter('exampleF.A.Q.Replies'), 'Example F.A.Q. Replies');
	t.is($ctrl.splitByCapitalLetter('exampleF.A.Q.replies'), 'Example F.A.Q. Replies');
	t.is($ctrl.splitByCapitalLetter('FBIstatistics'), 'FBIstatistics');
	t.is($ctrl.splitByCapitalLetter('F.B.I.Statistics'), 'F.B.I. Statistics');
	t.is($ctrl.splitByCapitalLetter('F.B.I.statistics'), 'F.B.I. Statistics');
	t.is($ctrl.splitByCapitalLetter('Green-FlameBlade'), 'Green-Flame Blade');
});

test('$compCtrl.uniqueId', async t => {
	t.is(typeof $compCtrl.uniqueId, 'string');
	t.false($compCtrl.uniqueId.includes('-'));
	t.false($compCtrl.uniqueId.includes(','));
});
