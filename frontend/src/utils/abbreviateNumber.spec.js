import { abbreviateNumber } from './abbreviateNumber';

test('returns non abbreviated number', () => {
  expect(abbreviateNumber(0)).toBe(0);
  expect(abbreviateNumber(1)).toBe(1);
  expect(abbreviateNumber(5)).toBe(5);
  expect(abbreviateNumber(10)).toBe(10);
  expect(abbreviateNumber(15)).toBe(15);
  expect(abbreviateNumber(100)).toBe(100);
  expect(abbreviateNumber(199)).toBe(199);
  expect(abbreviateNumber(1000)).toBe(1000);
  expect(abbreviateNumber(1999)).toBe(1999);
});

test('returns abbreviated number for K (round down and round up)', () => {
  expect(abbreviateNumber(9999)).toBe('10k');
  expect(abbreviateNumber(10000)).toBe('10k');
  expect(abbreviateNumber(19000)).toBe('19k');
  expect(abbreviateNumber(19100)).toBe('19k');
  expect(abbreviateNumber(19500)).toBe('20k');
  expect(abbreviateNumber(190000)).toBe('190k');
  expect(abbreviateNumber(191000)).toBe('191k');
  expect(abbreviateNumber(195000)).toBe('195k');
  expect(abbreviateNumber(195100)).toBe('195k');
  expect(abbreviateNumber(195900)).toBe('196k');
  expect(abbreviateNumber(999100)).toBe('999k');
});

test('returns abbreviated number for M (round down and round up)', () => {
  expect(abbreviateNumber(999500)).toBe('1m');
  expect(abbreviateNumber(1000000)).toBe('1m');
  expect(abbreviateNumber(1100000)).toBe('1.1m');
  expect(abbreviateNumber(1900000)).toBe('1.9m');
  expect(abbreviateNumber(1910000)).toBe('1.9m');
  expect(abbreviateNumber(1990000)).toBe('2m');
  expect(abbreviateNumber(1991000)).toBe('2m');
  expect(abbreviateNumber(1999000)).toBe('2m');
  expect(abbreviateNumber(19000000)).toBe('19m');
  expect(abbreviateNumber(19100000)).toBe('19m');
  expect(abbreviateNumber(19500000)).toBe('20m');
  expect(abbreviateNumber(190000000)).toBe('190m');
  expect(abbreviateNumber(191000000)).toBe('191m');
  expect(abbreviateNumber(199000000)).toBe('199m');
  expect(abbreviateNumber(999000000)).toBe('999m');
});

test('returns abbreviated number for B (round down and round up)', () => {
  expect(abbreviateNumber(999500000)).toBe('1b');
  expect(abbreviateNumber(1000000000)).toBe('1b');
  expect(abbreviateNumber(1100000000)).toBe('1.1b');
  expect(abbreviateNumber(1900000000)).toBe('1.9b');
  expect(abbreviateNumber(1910000000)).toBe('1.9b');
  expect(abbreviateNumber(1990000000)).toBe('2b');
  expect(abbreviateNumber(1990000000)).toBe('2b');
  expect(abbreviateNumber(19000000000)).toBe('19b');
  expect(abbreviateNumber(19100000000)).toBe('19b');
  expect(abbreviateNumber(19500000000)).toBe('20b');
});
