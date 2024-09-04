import { decimalPlaces } from './decimalPlaces';

test('returns number of decimal places in a value', () => {
  expect(decimalPlaces(10)).toBe(0);
  expect(decimalPlaces(1012)).toBe(0);
  expect(decimalPlaces(10.12)).toBe(2);
  expect(decimalPlaces(1012.12)).toBe(2);
  expect(decimalPlaces(10000.12)).toBe(2);
  expect(decimalPlaces(1012.12345)).toBe(5);
  expect(decimalPlaces(1012.123456)).toBe(6);
  expect(decimalPlaces(1012.1234567)).toBe(7);
});
