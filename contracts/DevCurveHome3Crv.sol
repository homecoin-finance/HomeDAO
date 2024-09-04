// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import './DevLPToken.sol';

contract DevCurveHome3Crv is DevLPToken {
    constructor () DevLPToken('CurveHome3Crv', 'CH3C', 8) {
    }
}