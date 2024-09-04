// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;
import '../PoolCore/Pool9.sol';

// This contract is only for testing purposes until we move to pure stable bHOME
// burn was removed from the contracts when we moved to ERC-20
// After that, this contract should be removed and the tests that rely on it
// should be replaced or rewritten or removed.

contract PoolTest9 is Pool9 {

  function burnForTest(uint256 amount) external {
    _burn(msg.sender, amount);
  }

}
