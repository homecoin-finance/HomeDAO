import deposit from './e2e/deposit.spec';
import withdraw from './e2e/withdraw.spec';
import staking from './e2e/staking.spec';
import unstake from './e2e/unstake.spec';

console.log('Running deposit test');
deposit();
console.log('Deposit test complete');

console.log('Running withdraw test');
withdraw();
console.log('Withdraw test complet');

console.log('Running unstake test');
unstake();
console.log('Unstake test complete');

console.log('Running staking test');
staking();
console.log('Staking test complete');
