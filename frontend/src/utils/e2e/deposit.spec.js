import puppeteer from 'puppeteer';
import { launch, setupMetamask } from '@chainsafe/dappeteer';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export default () => {
  describe('Deposit and stake', () => {
    test('connect, deposit, validate', async () => {
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

      await sleep(1000);

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
      const bHomeBefore = itemBefore[1];

      var input = await page.waitForSelector('input#depositAmount.amountInput');
      await input.type('50');

      await page.click('div.button.centered');
      await metamask.confirmTransaction();

      await page.bringToFront();
      var closeModal = await page.waitForSelector('button.modalConfirmation');
      await closeModal.click();

      await sleep(15000);

      var itemAfter = await page.$$eval('.value', (elements) =>
        elements.map((item) => item.textContent)
      );
      const bHomeAfter = itemAfter[1];

      await browser.close();

      expect(parseFloat(bHomeAfter) > parseFloat(bHomeBefore)).toBe(true);
    }, 100000);
  });
};
