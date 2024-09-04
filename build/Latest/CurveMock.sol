// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './../@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';

//import 'hardhat/console.sol';

// This contract is a mock of Curve's HomeCoin contract (https://etherscan.io/address/0x5c6A6Cf9Ae657A73b98454D17986AF41fC7b44ee)
// Basically, we want to be able to write tests with this in dev and use it on Goerli for manual testing.

contract CurveMock1 {

    mapping(int128 => address) currencies;

    function exchange_underlying(
        int128 i,
        int128 j,
        uint256 dx,
        uint256 min_dy,
        address receiver
    ) external returns (uint256) {

        // Transfer the dx to this
        //console.log('PRE-TRANSFER', currencies[i], dx);
        IERC20Upgradeable(currencies[i]).transferFrom(msg.sender, address(this), dx);
        //console.log('POST-TRANSFER', currencies[i], dx);
        // Aprove dy transfer
        IERC20Upgradeable dyCoin = IERC20Upgradeable(currencies[j]);

        // Return an exchange rate to the front end
        // who asks by giving a 0 min_dy.
        if (min_dy == 0) {
            min_dy = dx * 1_010_000 / 1_000_000;
        }

        // Transfer the dy to receiver
        //console.log('PRE-TRANSFER', min_dy);
        dyCoin.transfer(receiver, min_dy);

        //console.log('POST-TRANSFER', min_dy);
        return min_dy;
    }

    function addCurrency(int128 dex, address addr) public {
        currencies[dex] = addr;
    }

    function get_dy_underlying(
        int128 i,
        int128 j,
        uint256 dx
    ) external returns (uint256) {
        return dx;
    }
}
