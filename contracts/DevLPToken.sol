// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DevLPToken is ERC20 {

    uint8 private _decimals;

    constructor (string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_) {
        _decimals = decimals_;
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }

    function decimals() public view virtual override returns (uint8) {
        return _decimals;
    }
}
