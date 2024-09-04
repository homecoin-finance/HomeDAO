import '../../styles/form.css';

export const MetamaskPrompt = ({ token, poolAddress }) => {
  const { ethereum } = window;
  const tokenSymbol = token;
  const tokenDecimals = token === 'HOME' ? 6 : 18;
  const tokenImage =
    token === 'HOME'
      ? 'https://files.homecoin.finance/homecoin-icon-whitecircle-200.png'
      : 'https://files.homecoin.finance/rwacoin-icon-whitecircle-200.png';

  try {
    // wasAdded is a boolean. Like any RPC method, an error may be thrown.
    ethereum.request({
      method: 'wallet_watchAsset',
      params: {
        type: 'ERC20', // Initially only supports ERC20, but eventually more!
        options: {
          address: poolAddress._address, // The address that the token is at.
          symbol: tokenSymbol, // A ticker symbol or shorthand, up to 5 chars.
          decimals: tokenDecimals, // The number of decimals in the token
          image: tokenImage, // A string url of the token logo
        },
      },
    });
  } catch (error) {
    console.log(error);
  }
};
