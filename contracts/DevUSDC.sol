// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DevUSDC is ERC20 {

    constructor () ERC20("DevUSDC", "DUSDC") {
        _mint(msg.sender, 1000000 * (10 ** uint256(decimals())));
    }

    function decimals() public view virtual override returns (uint8) {
        return 6;
    }

    function gimmeDollarydoos(address receiver, uint256 amount) public {
        _mint(receiver, amount);
    }
}
