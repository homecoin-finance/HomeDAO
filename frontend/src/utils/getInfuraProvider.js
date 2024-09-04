export const getInfuraProvider = ({ infuraProjectId, walletLink }) => {
  // if network === undefined, that is, development and default network
  let infuraProvider = walletLink.makeWeb3Provider(
    `https://rinkeby.infura.io/v3/${infuraProjectId}`,
    4
  );

  const ETH_NET = process?.env.REACT_APP_ETH_NET;

  if (ETH_NET === 'mainnet') {
    infuraProvider = walletLink.makeWeb3Provider(
      `https://mainnet.infura.io/v3/${infuraProjectId}`,
      1
    );
  } else if (ETH_NET === 'ropsten') {
    infuraProvider = walletLink.makeWeb3Provider(
      `https://ropsten.infura.io/v3/${infuraProjectId}`,
      3
    );
  } else if (ETH_NET === 'rinkeby') {
    infuraProvider = walletLink.makeWeb3Provider(
      `https://rinkeby.infura.io/v3/${infuraProjectId}`,
      4
    );
  } else if (ETH_NET === 'goerli') {
    infuraProvider = walletLink.makeWeb3Provider(
      `https://goerli.infura.io/v3/${infuraProjectId}`,
      5
    );
  }

  return infuraProvider;
};
