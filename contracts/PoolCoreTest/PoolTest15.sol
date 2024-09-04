// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import '../PoolCore/Pool15.sol';

// This contract is only for testing purposes until we move to pure stable bHOME
// burn was removed from the contracts when we moved to ERC-20
// After that, this contract should be removed and the tests that rely on it
// should be replaced or rewritten or removed.

contract PoolTest15 is Pool15 {

    function mintForTest(address recv, uint256 amount) external {
        super._mint(recv, amount);
    }

    function setAddressesForTest(
        address _servicer,
        address _daoAddress,
        address _propTokenContractAddress,
        address _LTVOracleAddress) external
    {
        servicer = _servicer;
        daoAddress = _daoAddress;
        propTokenContractAddress = _propTokenContractAddress;
        LTVOracleAddress = _LTVOracleAddress;
    }

    function changeRate(
        uint loanId,
        uint newRate) external
    {
        Loan storage loan = loans[loanId];
        loan.interestRate = newRate;
    }
}
