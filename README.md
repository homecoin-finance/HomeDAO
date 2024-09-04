# HomeDAO

## How to run everything the first time

You will need:

- [Truffle](https://github.com/trufflesuite/truffle)
- [MetaMask](https://metamask.io/)

## Initial setup:

You will need:

- [Homebrew](https://brew.sh/)
- [Node](https://formulae.brew.sh/formula/node)
- [Yarn](https://classic.yarnpkg.com/lang/en/docs/install/#mac-stable)

### Before deploying:

```
cd HomeDAO
yarn install
touch .secret
echo "[test mnemonic]" > .secret
```

You also need to one time add the pre-commit git hook to keep the `contracts/Latest` folder up to date. To do so, run:

`make init`

### Local Deployment Instructions:

In one terminal, run

```
npx hardhat node
```

In a new terminal:

```
truffle compile
truffle migrate
```

### Debugging Solidity

To debug solidity, it is recommended to use [hardhat's console.log](https://hardhat.org/tutorial/debugging-with-hardhat-network.html)

### To use the web interface in dev environment

1.  `cd frontend` & `yarn start-local`
2.  Add the first two wallets from Ganache's account page to MetaMask [link here](https://metamask.zendesk.com/hc/en-us/articles/360015489331-How-to-import-an-Account)

The first wallet is the "Servicer" account that can update the contract. The Second wallet is the "Approver" account that is permissioned to access some of the functions in the smart contracts.

## To deploy to public network

1. Add the deployer's wallet's secret mnemonic phrase to `.secret` (Mainnet mnemonic is in LastPass and should be saved to `.secretMainnet`)
2. Launch the truffle container `docker-compose up` and connect to a shell in it `make truffle-shell`
3. Build all contracts `make compile`
4. Restore deployed addresses `make restore-deployments`. This is needed because the truffle command needs to know the latest migration and that comes from an address on chain in the Migrations contract.
5. Make sure you're on the VPN.
6. Set the OpenZeppelin Defender API key and secret into the environment (both are in LastPass): `export DEFENDER_API_KEY=xxxx` and `export DEFENDER_API_SECRET=xxxxx`.
7. Run a dry-run deployment `make DEPLOY_NETWORK=goerli deploy`
8. If the dry-run looks good, do a real run `make DEPLOY_NETWORK=goerli SKIP_DRY_RUN= deploy`
9. Save off the deployed addresses `make save-deployments`
10. Create a PR with the deployment data for the release and get it merged into main. This should include changes to the 'deployment' folder with the addresses of the deployed contracts as well as changes to frontend/src/contract_data. DO NOT SKIP THIS STEP

### Verifying contracts

From within the truffle shell, after deployment:

1. Save the Etherscan API key (this is in LastPass) `export ETHERSCAN_API_KEY=xxxxxxx`
2. For each contract you want to verify, run `make VERIFY_CONTRACT=ContractName0 DEPLOY_NETWORK=goerli verify`

## To run the frontend testing interface

```
cd frontend
yarn start
```

If `yarn start` prompts an error regarding a discrepancy between your installed version of Webpack versus the version in the project dependencies:

1. Go into your `/HomeDAO/node_modules` directory
2. Delete the `webpack` directory
3. Upon running `yarn start` again the correct version of `webpack` will be installed via the project dependencies

## Testing Analytics

By default we won't embed analytics tracking code in local/dev environments. If you'd like to test analytics behavior you will have to enable it by setting the `REACT_APP_SEGMENT_KEY` variable to the **staging** Segment write key when starting the app.

```
REACT_APP_SEGMENT_KEY=[segment key] yarn start
```

## Installing Brownie

Brownie scripts can be found in the `scripts` folder and are Python scripts that run against our contracts.

Install pipx (if you haven't already)

```
brew install pipx
```

Install Brownie

```
pipx install eth-brownie
```

Install the Gnosis Safe plugin for brownie so it can talk to the Gnosis multisig

```
pipx runpip eth-brownie install -U ape-safe
```

If you hit `AttributeError: module 'rlp' has no attribute 'Serializable'` when trying to run Brownie, then you have to do the following

```
pipx runpip eth-brownie uninstall rlp --yes
pipx runpip eth-brownie install rlp==2.0.1

```

You may see some errors when running the second command, but things should still work

Try it out! This command starts the Brownie console pointed at a local fork of mainnet

```
brownie console --network mainnet-fork
```

### Using Alchemy as they source for your data (optional, but recommended)

Alchemy is a much more reliable source for on chain data than Infura. It doesn't fail nearly as often as infura does, and it tends to be faster.

_This only impacts Brownie networks that are live or forked from a live network._

Set your alchemy app key so that Brownie can use it

```
export WEB3_ALCHEMY_PROJECT_ID=XXXXX
```

Then set alchemy as your network provider, which will cause the node that brownie creates to fetch its data from Alchemy and not infura

```
brownie networks set_provider alchemy
```

## Using Alchemy and Hardhat to fork mainnet at a block

Set your Alchemy api key into the environment

```
export ALCHEMY_API_KEY="XXXX"
```

Where XXXX is your Alchemy App's API key. The quotes are important as the Alchemy keys sometimes contain characters that will get eaten by the command line

Start Hardhat using the fork config passing in the block nubmer you want. BLOCK_NUMBER should be replaced with the actual block number.

```
npx hardhat node --fork-block-number BLOCK_NUMBER --config hardhat-mainnet-fork.config.js
```

For bonus points, you can run Brownie against this local fork.

Make sure that you have a local provider set up in Brownie that can connect to a locally running node. On my machine this config is called 'ganache', but it doesn't care what node is actually running locally

```
brownie networks list True
...
  └─ganache
    ├─id: ganache
    ├─chainid: 1
    └─host: http://localhost:8545
...
```

To set up this config if you don't have it:

```
brownie networks add Ethereum SOME_GOOD_NAME host=http://localhost:8545 chainid=1337
```

Then just run Brownie using this network so it uses the already running node instead of starting its own

```
brownie console --network SOME_GOOD_NAME
```
