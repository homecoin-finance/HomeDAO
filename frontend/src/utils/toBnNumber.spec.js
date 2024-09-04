import Web3 from 'web3';
import { toBnNumber } from './toBnNumber';

let web3 = new Web3(Web3.givenProvider);

test('formats amount to proper Bn format', () => {
  expect(toBnNumber(web3, 10)).toBe('10000000');
  expect(toBnNumber(web3, 1012)).toBe('1012000000');
  expect(toBnNumber(web3, 10.12)).toBe('10120000');
  expect(toBnNumber(web3, 1012.12)).toBe('1012120000');
  expect(toBnNumber(web3, 9145.38)).toBe('9145380000');
  expect(toBnNumber(web3, 10000.12)).toBe('10000120000');
  expect(toBnNumber(web3, 10120.12)).toBe('10120120000');
  expect(toBnNumber(web3, 100161.53)).toBe('100161530000');
  expect(toBnNumber(web3, 100161.153)).toBe('100161153000');
  expect(toBnNumber(web3, 10.12345)).toBe('10123450');
  expect(toBnNumber(web3, 10.123456)).toBe('10123456');
});
