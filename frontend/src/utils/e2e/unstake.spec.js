import puppeteer from 'puppeteer';
import { launch, setupMetamask } from '@chainsafe/dappeteer';
import { advanceBlock, latestBlock } from '@openzeppelin/test-helpers/src/time';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function mineBlock(metamask) {
  // Send some eth to another address to make ganache mine a block
  await metamask.page.bringToFront();
  try {
    var popoverClose = await metamask.page.waitForSelector(
      '[data-testid="popover-close"]'
    );
    await popoverClose.click();
  } catch (e) {
    // If there's no popover, then fine.
  }

  var transactionsTab = await metamask.page.waitForSelector(
    '[data-testid="home__activity-tab"]'
  );
  await transactionsTab.click();

  await metamask.page.waitForSelector(
    '.transaction-list__completed-transactions'
  );

  var startingTransactionCount = await metamask.page.$$eval(
    '.transaction-list-item',
    (transactions) => transactions.length
  );

  var sendButton = await metamask.page.waitForSelector(
    '[data-testid="eth-overview-send"]'
  );
  await sendButton.click();
  // Paste address to transfer to
  var addressField = await metamask.page.waitForSelector(
    '[data-testid="ens-input"]'
  );
  await addressField.type('0xb147DE117d304b2ae40d8737b415c630E5EC45dd');

  // input the amount to transfer
  var amountInput = await metamask.page.waitForSelector('.unit-input__input');
  await amountInput.type('0.00001');
  await amountInput.press('Enter');

  // click the next button
  var nextButton = await metamask.page.waitForSelector(
    '[data-testid="page-container-footer-next"]:enabled'
  );
  nextButton.click();

  // await class = confirm-page-container-header
  await metamask.page.waitForSelector('.confirm-page-container-header');

  // click confirm button once it is enabled
  var confirmButton = await metamask.page.waitForSelector(
    '[data-testid="page-container-footer-next"]:enabled'
  );
  confirmButton.click();

  // now wait for the transaction to complete...
  await metamask.page.waitForSelector(
    '.transaction-list__completed-transactions'
  );

  var expectedEndingCount = startingTransactionCount + 1;
  await metamask.page.waitForFunction(
    (count) => {
      var currentTransactions = window.document.querySelectorAll(
        '.transaction-list__completed-transactions > .transaction-list-item'
      ).length;
      return currentTransactions === count;
    },
    { polling: 500 },
    expectedEndingCount
  );
}

export default () => {
  describe('Unstaking', () => {
    test('Unstakes bHOME', async () => {
      const browser = await launch(puppeteer, {
        metamaskVersion: 'v10.1.1',
        headless: false,
      });
      const metamask = await setupMetamask(browser, {
        seed: '[test mnemonic]',
      });
      // is local already added?
      // await metamask.addNetwork({
      //   networkName: 'Localhost 8545',
      //   rpc: 'http://localhost:8545',
      //   chainId: 1337,
      //   symbol: 'ETH',
      // });
      await metamask.switchNetwork('localhost');

      const page = await browser.newPage();
      await page.goto('http://localhost:3000/');

      const selectMetamask = await page.$x('//span[text()="MetaMask"]');

      await selectMetamask[0].click();
      await metamask.approve();

      await page.bringToFront();
      await page.goto('http://localhost:3000/staking');

      await sleep(1000);

      await page.bringToFront();

      var itemBefore = await page.$$eval('.value', (elements) =>
        elements.map((item) => item.textContent)
      );
      const stakedBHomeBefore = itemBefore[0];
      const unstakedBHomeBefore = itemBefore[1];

      var withdrawTab = await page.waitForSelector('div.tabRightInactive');
      await withdrawTab.click();

      var input = await page.waitForSelector('input#unstakeAmount.amountInput');
      await input.type('10');

      await page.click('div.button.centered');
      await metamask.confirmTransaction();

      await page.bringToFront();
      var closeModal = await page.waitForSelector('button.modalConfirmation');
      await closeModal.click();

      await page.waitForSelector('[data-testid="holding-message"]');

      var itemAfter = await page.$$eval('.value', (elements) =>
        elements.map((item) => item.textContent)
      );
      const stakedBHomeAfterUnstake = itemAfter[0];

      expect(
        parseFloat(stakedBHomeBefore) > parseFloat(stakedBHomeAfterUnstake)
      ).toBe(true);

      await mineBlock(metamask);

      await page.bringToFront();

      var withdrawButton = await page.waitForSelector(
        '[data-testid="withdraw-button"]'
      );
      await withdrawButton.click();

      await metamask.confirmTransaction();

      await page.bringToFront();
      var withdrawCloseModal = await page.waitForSelector(
        'button.modalConfirmation'
      );
      await withdrawCloseModal.click();

      var itemAfter = await page.$$eval('.value', (elements) =>
        elements.map((item) => item.textContent)
      );
      const unstakedBHomeAfterWithdraw = itemAfter[1];

      await browser.close();

      expect(
        parseFloat(unstakedBHomeAfterWithdraw) > parseFloat(unstakedBHomeBefore)
      ).toBe(true);
    }, 100000);
  });
};
