// contracts/Pool0.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import '../@openzeppelin/contracts/utils/math/SafeMath.sol';
import '../@openzeppelin/contracts/utils/math/SignedSafeMath.sol';
import '../@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';

// import "hardhat/console.sol";


contract TestRewards0 {
    address private poolAddress;

    constructor(address _poolAddress) {
        poolAddress = _poolAddress;
    }

    function transferToAndBack(address fromAddress, address toAddress, uint256 toAmount, uint256 backAmount) public{
        IERC20Upgradeable(poolAddress).transferFrom(fromAddress, toAddress, toAmount);
        IERC20Upgradeable(poolAddress).transferFrom(toAddress, fromAddress, backAmount);
    }

    function transferToAndTo(address fromAddress, address toAddress, uint256 firstAmount, uint256 secondAmount) public {
        IERC20Upgradeable(poolAddress).transferFrom(fromAddress, toAddress, firstAmount);
        IERC20Upgradeable(poolAddress).transferFrom(fromAddress, toAddress, secondAmount);
    }
}
