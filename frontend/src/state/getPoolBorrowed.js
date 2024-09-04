export const getPoolBorrowed = ({ poolContractInstance }) => {
  return poolContractInstance.methods
    .getContractData()
    .call()
    .then((result) => {
      // console.log("getContractData result: ", result);
      return result[4] / Math.pow(10, 6);
    });
};
