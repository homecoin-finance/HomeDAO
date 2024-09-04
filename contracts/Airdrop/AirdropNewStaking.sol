// contracts/BaconCoinAirdrop.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './../PoolStakingRewards/PoolStakingRewards1.sol';

contract BaconCoinAirdropNewStaking {

    address guardianAddress;
    bool locked;

    constructor(address _guardianAddress) {
        guardianAddress = _guardianAddress;
        locked = false;
    }

    function lockAirDrop() public {
        locked = true;
    }

    function airdropBaconCoin(address _poolStakingRewardsAddress, address[] memory recepients, uint256[] memory amounts, uint256 length) public {
        require(msg.sender == guardianAddress, "unapproved sender");
        require(!locked, "Airdrop locked");

        for (uint256 i = 0; i < length; i++) {    
            PoolStakingRewards1(_poolStakingRewardsAddress).mintBacon(recepients[i], amounts[i]);
        }
    }
}