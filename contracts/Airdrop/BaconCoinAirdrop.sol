// contracts/BaconCoinAirdrop.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './../BaconCoin/BaconCoin0.sol';

contract BaconCoinAirdrop {

    address guardianAddress;
    bool locked;

    constructor(address _guardianAddress) {
        guardianAddress = _guardianAddress;
        locked = false;
    }

    function lockAirDrop() public {
        locked = true;
    }

    function airdropBaconCoin(address _baconCoinAddress, address[] memory recepients, uint256[] memory amounts, uint256 length) public {
        require(msg.sender == guardianAddress, "unapproved sender");
        require(!locked, "Airdrop locked");

        for (uint256 i = 0; i < length; i++) {    
            BaconCoin0(_baconCoinAddress).mint(recepients[i], amounts[i]);
        }
    }
}