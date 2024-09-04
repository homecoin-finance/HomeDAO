import { decimalPlaces } from './decimalPlaces';

export const formatBnAmount = (amount) => {
  let bnDecimal = '000000';
  const isDecimal = amount % 1 !== 0;

  if (isDecimal) {
    const maxBnDecimals = 6;
    const numberOfDecimals = decimalPlaces(amount);
    const sliceBnDecimals = maxBnDecimals - numberOfDecimals;

    if (sliceBnDecimals < 0) return;

    bnDecimal = bnDecimal.slice(0, sliceBnDecimals);
    amount = amount.toString().split('.').join('');
  }

  return amount + bnDecimal;
};
