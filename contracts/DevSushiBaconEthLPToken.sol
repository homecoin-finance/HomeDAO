// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './DevLPToken.sol';

contract DevSushiBaconEthLPToken is DevLPToken {
    constructor () DevLPToken('SushiBaconEth', 'SBET', 18) {
    }
}