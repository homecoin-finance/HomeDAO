import { formatBnAmount } from './formatBnAmount';

export const toBnNumber = (web3, amount) => {
  return web3.utils.toBN(formatBnAmount(amount)).toString();
};
