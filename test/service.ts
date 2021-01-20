import test from 'ava';
import { $svc } from './mocks';
import { NgService } from '../index';

const uuidRe = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/;

test('NgService includes a method for splitting a string into separate words by capital letter', t => {
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

test('NgService includes a unique id', t => {
	t.regex($svc.uniqueId, /^[0-9a-fA-F]{32}/);
});

test('NgService includes a method for generating UUIDs', t => {
	t.regex($svc.UUIDv4(), uuidRe);
	t.not($svc.UUIDv4(), $svc.UUIDv4());
});

test('NgService includes a static method for generating UUIDs', t => {
	t.regex(NgService.UUIDv4(), uuidRe);
	t.not(NgService.UUIDv4(), NgService.UUIDv4());
});

test('NgService includes a static method for testing if the environment is a mobile browser', t => {
	t.false(NgService.IsMobile());
});

test('NgService includes a static method for testing if the environment is IE11', t => {
	t.false(NgService.IsIE11());
});
