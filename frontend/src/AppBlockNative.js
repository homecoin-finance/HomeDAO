//For testing the functions of the DevUSDC and Pool contracts
//Use the same mnemonic when starting ganache: [test mnemonic]

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Onboard from 'bnc-onboard';
import Web3 from 'web3';
import { ethers } from 'ethers';

import './styles/variables.css';
import './App.css';

import {
  userAddressStore,
  contractInstanceDataStore,
  web3Store,
  networkStore,
} from './store/appStore';

import { unstakedHomeStore, stakedHomeStore } from './store/homeStore';

import Header from './components/header.js';
import { Footer } from './components/footer';
import RewardsPage from './pages/rewardsPage/rewardsPage';
import InvestPage from './pages/investPage/investPage.js';
import FarmingPage from './pages/farmingPage/farmingPage.js';
import Eggs from './pages/eggPage/eggs.js';
import Highscores from './pages/highscoresPage/highscores.jsx';
import DevTools from './components/devTools.js';
import { FixBoost } from './components/fixBoost.js';

import { detectNetworkConnected, getContractInstance } from './utils';

let provider;
const ETH_NET = process?.env.REACT_APP_ETH_NET;
const networkId = detectNetworkConnected(ETH_NET);
const INFURA_API_DEV = 'e36052cab1ac49fd8237ec4bae8a33a3';
const INFURA_API_PROD = 'e36052cab1ac49fd8237ec4bae8a33a3';
const infuraKey =
  window.location.hostname === 'localhost' ? INFURA_API_DEV : INFURA_API_PROD;
const rpcUrl = `https://${ETH_NET}.infura.io/v3/${infuraKey}`;

export function initOnboard(subscriptions) {
  return Onboard({
    hideBranding: true,
    networkId,
    darkMode: true,
    subscriptions,
    walletSelect: {
      wallets: [
        { walletName: 'metamask' },
        { walletName: 'coinbase' },
        { walletName: 'walletLink', rpcUrl },
        {
          walletName: 'walletConnect',
          infuraKey,
        },
      ],
    },
    walletCheck: [{ checkName: 'connect' }, { checkName: 'network' }],
  });
}

// new VConsole();

const AppBlockNative = ({ ffDevTools, ffFix }) => {
  const [userAddress, setUserAddress] = useState(null);
  const [network, setNetwork] = useState(null);
  const [poolWalletBalance, setPoolWalletBalance] = useState(null);
  const [contractData, setContractData] = useState({});
  const [web3, setWeb3] = useState(null);
  const [walletUnlocked, setWalletUnlocked] = useState(false);
  const [providerDetails, setProviderDetails] = useState({});
  const [onboard, setOnboard] = useState(null);

  const updateNetwork = (network) => {
    setNetwork(network);
    networkStore.set(network);
  };

  const updateUserAddress = (newUserAddress) => {
    setUserAddress(newUserAddress);
    userAddressStore.set(newUserAddress);
  };

  // eslint-disable-next-line
  useEffect(async () => {
    console.log('------ App Initialised --------');
    const onboard = initOnboard({
      address: updateUserAddress,
      network: updateNetwork,
      wallet: (wallet) => {
        let walletProvider = wallet.provider;
        let web3Interface = walletProvider;

        if (walletProvider) {
          // 1. check if multiple wallets installed
          if (walletProvider.providers && walletProvider.providers.length > 1) {
            // 1.a) select MetaMask as a priority one
            web3Interface = walletProvider.providers[2];
          }

          provider = new ethers.providers.Web3Provider(web3Interface, 'any');
          const providerDetails = provider.provider;
          const network = providerDetails.networkVersion;
          console.log('network: ', network);

          const web3Instance = new Web3(providerDetails);
          const { contractInstanceData } = getContractInstance({
            network: Number(network),
            web3: web3Instance,
          });

          contractInstanceDataStore.set(contractInstanceData);

          setProviderDetails(providerDetails);
          setContractData(contractInstanceData);
          setWeb3(web3Instance);
          web3Store.set(web3Instance);
          localStorage.setItem('baconDao_selectedWallet', wallet.name);
        } else {
          provider = null;
        }
      },
    });

    setOnboard(onboard);
  }, []);

  // eslint-disable-next-line
  useEffect(async () => {
    const getWalletUserAddress = ({ poolContractInstance }) => {
      const currentState = onboard && onboard.getState();
      const walletName = currentState?.wallet?.name?.toLowerCase();

      providerDetails
        .request({ method: 'eth_requestAccounts' })
        .then((accounts) => {
          const userAddress = accounts[0];
          // Check if wallet is unlocked and ready to be used
          // if locked, no accounts are available
          if (userAddress) {
            setUserAddress(userAddress);
            userAddressStore.set(userAddress);
            setWalletUnlocked(true);
            getWalletBalance({ poolContractInstance, userAddress });

            // Use the eth account address as the account's unique identifier
            if (window.analytics) {
              window.analytics.identify(userAddress, {
                address: userAddress,
                // A "pretty" version of an address for name 0x1234...5678
                name: userAddress.slice(0, 5) + '...' + userAddress.slice(-4),
              });

              window.analytics.track('Connect Wallet', {
                wallet: walletName,
              });
            }
          } else {
            userAddressStore.set(null);
            setWalletUnlocked(false);
          }
        })
        .catch((error) => {
          console.log('error!: ', error);

          if (window.analytics) {
            window.analytics.track('Rejected Wallet Connect', {
              wallet: providerDetails,
            });
          }
        });
    };
    const { poolContractInstance } = contractData;
    const previouslySelectedWallet = localStorage.getItem(
      'baconDao_selectedWallet'
    );
    let ready;

    // 1. Check that the onboarding has been initialised
    if (onboard) {
      // 2. if wallet was not selected previously or local storage was emptied

      if (!previouslySelectedWallet) {
        console.log('no wallet');
        // 3. then prompt user to select a wallet
        const walletSelected = await onboard.walletSelect();

        // 4.a) if they didn't select return them to empty screen
        // TODO: we can set a state and show a message for user to connect their wallet
        if (!walletSelected) return false;

        // 4.b) Check that the wallet is ready for transactions (UNLOCKED)
        if (walletSelected) {
          ready = await onboard.walletCheck();
        }
      }

      // 2.b) if wallet was selected previously
      if (previouslySelectedWallet) {
        // console.log('wallet was selected: ', previouslySelectedWallet);
        await onboard.walletSelect(previouslySelectedWallet);
        // 4. Check that the wallet is ready for transactions (UNLOCKED)
        ready = await onboard.walletCheck();
        if (!ready) {
          await onboard.walletSelect();
          window.location.reload(true);
        }
      }

      // 2.c) if wallet is ready and dependencies are loaded get wallet balance
      if (poolContractInstance && ready) {
        getWalletUserAddress({
          poolContractInstance,
        });
      }
    }
  }, [onboard, providerDetails, contractData]);

  const getWalletBalance = ({ poolContractInstance, userAddress }) => {
    // Call balanceOf hc_pool
    poolContractInstance.methods
      .balanceOf(userAddress)
      .call({ from: userAddress }, (err, res) => {
        const unstakedHomeValue = res / Math.pow(10, 6);
        setPoolWalletBalance(unstakedHomeValue);
      });
  };

  const isAppReady =
    userAddress &&
    contractData?.contractAddresses &&
    poolWalletBalance !== null;
  const currentState = onboard && onboard.getState();

  if (isAppReady && ffDevTools) {
    return (
      <DevTools
        address={userAddress}
        contractData={contractData}
        web3={web3}
        network={network}
      />
    );
  } else if (isAppReady && ffFix) {
    return (
      <FixBoost
        address={userAddress}
        contractData={contractData}
        web3={web3}
        network={network}
      />
    );
  } else {
    return (
      <div className="App">
        <div className="content">
          {isAppReady && (
            <BrowserRouter>
              <Header
                wallet={currentState?.wallet?.name?.toLowerCase()}
                walletConnected={walletUnlocked}
                disconnectWallet={() => onboard.walletSelect()}
                userAddress={userAddress}
                contractData={contractData}
              />
              <Routes>
                <Route
                  path="/"
                  element={
                    <>
                      <InvestPage />
                    </>
                  }
                />
                <Route
                  path="/farming"
                  element={
                    <>
                      <FarmingPage />
                    </>
                  }
                />
                <Route
                  path="/rewards"
                  element={
                    <>
                      <RewardsPage
                        userAddress={userAddress}
                        contractData={contractData}
                        web3={web3}
                        network={network}
                        walletUnlocked={walletUnlocked}
                      />
                    </>
                  }
                />
                <Route
                  path="/homes"
                  element={
                    <>
                      <Eggs
                        userAddress={userAddress}
                        contractData={contractData}
                        web3={web3}
                        network={network}
                        walletUnlocked={walletUnlocked}
                      />
                    </>
                  }
                />
                <Route
                  path="/highscores"
                  element={
                    <>
                      <Highscores
                        userAddress={userAddress}
                        contractData={contractData}
                        network={network}
                        walletUnlocked={walletUnlocked}
                      />
                    </>
                  }
                />
              </Routes>
            </BrowserRouter>
          )}
        </div>
        <Footer />
      </div>
    );
  }
};

export default AppBlockNative;
