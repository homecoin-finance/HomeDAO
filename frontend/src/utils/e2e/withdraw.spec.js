import puppeteer from 'puppeteer';
import { launch, setupMetamask } from '@chainsafe/dappeteer';
import { parse } from 'ethers/utils/transaction';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default () => {
  describe('Withdraw', () => {
    test('withdraw', async () => {
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

      // if new chain user will need to allow access to USDC so we handle that here
      let needsUSDCApproval = true;
      while (needsUSDCApproval) {
        const selector = 'div.buttonApproval.centered';
        if ((await page.$(selector)) !== null) {
          await page.click(selector);
          await metamask.confirmTransaction();
          await page.bringToFront();
        } else {
          needsUSDCApproval = false;
        }
      }

      await sleep(2000);

      var itemBefore = await page.$$eval('.value', (elements) =>
        elements.map((item) => item.textContent)
      );
      const bHomeBefore = itemBefore[2];

      console.log(bHomeBefore);

      var withdrawTab = await page.waitForSelector('div.tabRightInactive');
      await withdrawTab.click();

      var input = await page.waitForSelector('input#amount.amountInput');
      await input.type('10');

      await page.click('div.button.centered');
      await metamask.confirmTransaction();

      await page.bringToFront();
      var closeModal = await page.waitForSelector('button.modalConfirmation');
      await closeModal.click();

      await sleep(20000);

      var itemAfter = await page.$$eval('.value', (elements) =>
        elements.map((item) => item.textContent)
      );
      const bHomeAfter = itemAfter[2];

      await browser.close();

      expect(parseFloat(bHomeBefore) > parseFloat(bHomeAfter)).toBe(true);
    }, 100000);
  });
};
