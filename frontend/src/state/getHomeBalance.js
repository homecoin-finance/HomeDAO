export const getHomeBalance = ({ web3, poolContractInstance, userAddress }) => {
  return poolContractInstance.methods
    .balanceOf(userAddress)
    .call((err, res) => {
      if (err) {
        console.log(err);
      }
      return web3.utils.toBN(res);
    });
};
