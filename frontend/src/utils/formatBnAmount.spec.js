import { formatBnAmount } from './formatBnAmount';

test('formats amount to proper Bn format', () => {
  expect(formatBnAmount(10)).toBe('10000000');
  expect(formatBnAmount(1012)).toBe('1012000000');
  expect(formatBnAmount(10.12)).toBe('10120000');
  expect(formatBnAmount(1012.12)).toBe('1012120000');
  expect(formatBnAmount(10000.12)).toBe('10000120000');
  expect(formatBnAmount(100161.53)).toBe('100161530000');
  expect(formatBnAmount(9145.38)).toBe('9145380000');
  expect(formatBnAmount(10.12345)).toBe('10123450');
  expect(formatBnAmount(10.123456)).toBe('10123456');
  expect(formatBnAmount(10.1234567)).toBe(undefined);
});
