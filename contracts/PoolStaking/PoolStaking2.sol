// SPDX-License-Identifier: GPL-3.0-or-later
pragma solidity ^0.8.4;

import "../@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol";
import './../BaconCoin/BaconCoin0.sol';


import '../@openzeppelin/contracts/utils/math/SafeMath.sol';
import '../@openzeppelin/contracts/utils/math/SignedSafeMath.sol';

// Forked from Compound
// See https://github.com/compound-finance/compound-protocol/blob/master/contracts/Timelock.sol
contract PoolStaking2 is Initializable {
    using SignedSafeMath for int256;
    using SafeMath for uint256;

    uint256 constant PER_BLOCK_DECAY = 9999997757;
    uint256 constant PER_BLOCK_DECAY_18_DECIMALS = 999999775700000000;
    uint256 constant PER_BLOCK_DECAY_INVERSE = 10000002243;
    uint256 constant GUARDIAN_REWARD = 39e18;
    uint256 constant DAO_REWARD = 18e18;
    uint256 constant COMMUNITY_REWARD = 50e18;
    uint256 constant COMMUNITY_REWARD_BONUS = 100e18;

    uint256 stakeAfterBlock;
    address guardianAddress;
    address daoAddress;
    address baconCoinAddress;
    address[] poolAddresses;

    uint256[] updateEventBlockNumber;
    uint256[] updateEventNewAmountStaked;
    uint256 updateEventCount;
    uint256 currentStakedAmount;

    mapping(address => uint256) userStaked;
    mapping(address => uint256) userLastDistribution;

    uint256 oneYearBlock;

    struct UnstakeRecord {
        uint256 endBlock;
        uint256 amount;
    }

    // PoolStaking2 storage
    uint256 unstakingLockupBlockDelta;
    mapping(address => UnstakeRecord) userToUnstake;
    uint256 pendingWithdrawalAmount;

    // TODO: maybe this should just be a normal setter like the rest in this block...
    function setUnstakingLockupBlockDelta(uint256 _unstakingLockupBlockDelta) public {
        require(msg.sender == guardianAddress, "unapproved sender");
        unstakingLockupBlockDelta = _unstakingLockupBlockDelta;
    }

    function setOneYearBlock(uint256 _oneYearBlock) public {
        require(msg.sender == guardianAddress, "unapproved sender");
        oneYearBlock = _oneYearBlock;
    }

    function setstakeAfterBlock(uint256 _stakeAfterBlock) public {
        require(msg.sender == guardianAddress, "unapproved sender");
        stakeAfterBlock = _stakeAfterBlock;
    }

    // To be called after baconCoin0 is deployed
    function setBaconAddress(address _baconCoinAddress) public {
        require(msg.sender == guardianAddress, "unapproved sender");
        baconCoinAddress = _baconCoinAddress;
    }

    // To be called after baconCoin0 is deployed
    function setDAOAddress(address _DAOAddress) public {
        require(msg.sender == guardianAddress, "unapproved sender");
        userLastDistribution[_DAOAddress] =  userLastDistribution[daoAddress];
        daoAddress = _DAOAddress;
    }

    function setGuardianAddress(address _guardianAddress) public {
        require(msg.sender == guardianAddress, "unapproved sender");
        userLastDistribution[_guardianAddress] =  userLastDistribution[guardianAddress];
        guardianAddress = _guardianAddress;
    }

    /**  
    *   @dev Function version returns uint depending on what version the contract is on
    */
    function version() public pure returns (uint) {
        return 2;
    }

    function getContractInfo() public view returns (uint256, uint256, address, address, address, address  [] memory, uint256, uint256, uint256) {
        return (
            stakeAfterBlock,
            oneYearBlock,
            guardianAddress,
            daoAddress,
            baconCoinAddress,
            poolAddresses,
            updateEventCount,
            currentStakedAmount,
            pendingWithdrawalAmount
        );
    }

    function getPendingWithdrawInfo(address _holderAddress) public view returns(uint256, uint256, uint256) {
        return (
            userToUnstake[_holderAddress].endBlock,
            userToUnstake[_holderAddress].amount,
            pendingWithdrawalAmount
        );
    }

    function getUserLastDistributed(address wallet) public view returns (uint256) {
        return (userLastDistribution[wallet]);
    }

    /** 
    *   @dev Function isApprovedPool() is an internal function that checks the array of approved pool addresses for the given address
    *   @param _address The address to be checked if it is approved
    *   @return isApproved is if the _addess is found in the list of servicerAddresses
    */
    function isApprovedPool(address _address) internal view returns (bool) {
        bool isApproved = false;
        
        for (uint i = 0; i < poolAddresses.length; i++) {
            if(_address == poolAddresses[i]) {
                isApproved = true;
            }
        }

        return isApproved;
    }

    /*****************************************************
    *       Staking FUNCTIONS
    ******************************************************/

    /**
    *   @dev function stake accepts an amount of bHOME to be staked and creates a new updateEvent for it
    */
    function stake(address wallet, uint256 amount) public returns (bool) {
        require(isApprovedPool(msg.sender), "sender not Pool");

        return stakeInternal(wallet, amount);
    }

    
    function stakeInternal(address wallet, uint256 amount) internal returns (bool) {
        //First handle the case where this is a first staking
        if(userStaked[wallet] != 0 || wallet == guardianAddress || wallet == daoAddress) {
            distribute(wallet);
        } else {
            userLastDistribution[wallet] = block.number;
        }

        userStaked[wallet] = userStaked[wallet].add(amount);
        currentStakedAmount = currentStakedAmount.add(amount);
        updateEventBlockNumber.push(block.number);
        updateEventNewAmountStaked.push(currentStakedAmount);
        updateEventCount = updateEventCount.add(1);

        return true;
    }

    function decayExponent(uint256 exponent) internal pure returns (uint256) {
        //10 decimals
        uint256 answer = PER_BLOCK_DECAY;
        for (uint256 i = 0; i < exponent; i++) {
            answer = answer.mul(10000000000).div(PER_BLOCK_DECAY_INVERSE);
        }

        return answer;
    }

    function calcBaconBetweenEvents(uint256 blockX, uint256 blockY) internal view returns (uint256) {
        //bacon per block after first year is
        //y=50(1-0.000000224337829)^{x}
        //where x is number of blocks over 15651074

        //Bacon accumulated between two blocksover first year is:
        //S(x,y) = S(y) - S(x) = (A1(1-r^y) / (1-r)) - (A1(1-r^x) / (1-r))
        //where A1 = 50 and r = 0.9999997757

        //1 year block subtracted from block numbers passed in since formula only cares about change in time since that point
        blockX = blockX.sub(oneYearBlock);
        blockY = blockY.sub(oneYearBlock);

        uint256 SyNumer = decayExponent(blockY).mul(50);
        uint256 SxNumer = decayExponent(blockX).mul(50);
        uint256 denom = uint256(1000000000000000000).sub(PER_BLOCK_DECAY_18_DECIMALS);

        uint256 Sy = SyNumer.mul(1000000000000000000).div(denom);
        uint256 Sx = SxNumer.mul(1000000000000000000).div(denom);

        return Sy.sub(Sx);
    }


    /**
    *   @dev function distribute accepts a wallet address and transfers the BaconCoin accrued to their wallet since the user's Last Distribution
    */
    function distribute(address wallet) public returns (uint256) {

        if (userStaked[wallet] == 0 && wallet != guardianAddress && wallet != daoAddress) {
            return 0;
        }

        uint256 accruedBacon = 0;
        uint256 countingBlock = userLastDistribution[wallet];

        uint256 blockDifference = 0;
        uint256 tempAccruedBacon = 0;

        if(wallet == daoAddress) {
            blockDifference = block.number - countingBlock;
            tempAccruedBacon = blockDifference.mul(DAO_REWARD);
            accruedBacon += tempAccruedBacon;
        } else if (wallet == guardianAddress) {
            blockDifference = block.number - countingBlock;
            accruedBacon = blockDifference.mul(GUARDIAN_REWARD);
            accruedBacon += tempAccruedBacon;
        } else if (countingBlock < stakeAfterBlock) {
            countingBlock = stakeAfterBlock;
        }

        uint256 usersCurrentStake = userStaked[wallet];
        if (usersCurrentStake != 0) {
            //iterate through the array of update events
            for (uint256 i = 0; i < updateEventCount; i++) {
                //only accrue bacon if event is after last withdraw
                if (updateEventBlockNumber[i] > countingBlock) {
                    blockDifference = updateEventBlockNumber[i] - countingBlock;
                    
                    if(updateEventBlockNumber[i] < oneYearBlock) {
                        //calculate bacon accrued if update event is within the first year
                        //use updateEventNewAmountStaked[i-1] because that is the 
                        tempAccruedBacon = blockDifference.mul(COMMUNITY_REWARD_BONUS).mul(usersCurrentStake).div(updateEventNewAmountStaked[i-1]);
                    } else {
                        //calculate bacon accrued if update event is past the first year
                        if(countingBlock < oneYearBlock) {
                            //calculate the bacon accrued at the end of the first year if overlapped with first year
                            uint256 blocksLeftInFirstYear = oneYearBlock - countingBlock;
                            tempAccruedBacon = blocksLeftInFirstYear.mul(COMMUNITY_REWARD_BONUS).mul(usersCurrentStake).div(updateEventNewAmountStaked[i-1]);

                            //add the amount of bacon accrued before the first year to the running total and set the block difference to start calculating from new year
                            accruedBacon = accruedBacon.add(tempAccruedBacon);
                            countingBlock = oneYearBlock;
                        }
                        
                        //calculate the amount of Bacon accrued between events
                        uint256 baconBetweenBlocks = calcBaconBetweenEvents(countingBlock, updateEventBlockNumber[i]);
                        tempAccruedBacon = baconBetweenBlocks.mul(usersCurrentStake).div(updateEventNewAmountStaked[i-1]);
                    }
                    
                    //as we iterate through events since last withdraw, add the bacon accrued since the last event to the running total & update contingBlock
                    accruedBacon = accruedBacon.add(tempAccruedBacon);
                    countingBlock = updateEventBlockNumber[i];
                }

            }// end updateEvent for loop

            // When there is no more updateEvents to loop through, the last step is to calculate accrued up to current block

            //first check that the last updateEvent didn't happen earlier this block, in which case we're done calculating accrued bacon
            //countingBlock is checked against the block.number in case the counting block was set in the future as startingBlock
            if(countingBlock != block.number && countingBlock < block.number) {
                //case where still within first year
                if(countingBlock < oneYearBlock  && block.number < oneYearBlock) {
                    //calculate accrued between last updateEvent and now
                    blockDifference = block.number - countingBlock;
                    tempAccruedBacon = blockDifference.mul(COMMUNITY_REWARD_BONUS).mul(usersCurrentStake).div(updateEventNewAmountStaked[updateEventCount-1]);
                } else {
                    if (countingBlock < oneYearBlock  && block.number > oneYearBlock) {
                        //case where current block has just surpassed 1 year
                        uint256 blocksLeftInFirstYear = oneYearBlock - countingBlock;
                        tempAccruedBacon = blocksLeftInFirstYear.mul(COMMUNITY_REWARD_BONUS).mul(usersCurrentStake).div(updateEventNewAmountStaked[updateEventCount-1]);

                        //add the amount of bacon accrued before the first year to the running total and set the block difference to start calculating from new year
                        accruedBacon = accruedBacon.add(tempAccruedBacon);
                        countingBlock = oneYearBlock;
                    } 

                    //case where last updateEvent was after year 1
                    //calculate the amount of Bacon accrued between events
                    uint256 baconBetweenBlocks = calcBaconBetweenEvents(countingBlock, block.number);
                    tempAccruedBacon = baconBetweenBlocks.mul(usersCurrentStake).div(updateEventNewAmountStaked[updateEventCount-1]);
                }

                accruedBacon = accruedBacon.add(tempAccruedBacon);
            }
        }

        userLastDistribution[wallet] = block.number;
        // Mint will just go ahead and call callbacks even if nothing is being minted allowing for reentrancy
        // even when we are in the same block as the last distribution.
        if (accruedBacon > 0 ) {
            BaconCoin0(baconCoinAddress).mint(wallet, accruedBacon);
        }

        return accruedBacon;
    }


    function checkStaked(address wallet) public view returns (uint256) {
        return userStaked[wallet];
    }

    /**
    *   @dev Function unstake begins the process of withdrawing staked value. After a timeout, 
    *   the amount will be available to withdraw. If you calling account already has an unstake pending
    *   the new amount will be added to the pending amount and the timeout will reset.
    */
    function unstake(uint256 amount) public returns (uint256) {
        uint256 previousPending = userToUnstake[msg.sender].amount;
        require(amount.add(previousPending) <= userStaked[msg.sender], "not enough staked");
        userToUnstake[msg.sender] = UnstakeRecord(block.number.add(unstakingLockupBlockDelta), amount.add(previousPending));
        pendingWithdrawalAmount = pendingWithdrawalAmount.add(amount);

        uint256 stakedDiff = userStaked[msg.sender].sub(amount);
        currentStakedAmount = currentStakedAmount.sub(userStaked[msg.sender]);

        uint256 distributed = distribute(msg.sender);
        userStaked[msg.sender] = 0;

        //re-stake the difference
        if(stakedDiff > 0) {
            stakeInternal(msg.sender, stakedDiff);
        } else {
            updateEventBlockNumber.push(block.number);
            updateEventNewAmountStaked.push(currentStakedAmount);
            updateEventCount = updateEventCount.add(1); 
        }

        return distributed;
    }

    /**  
    *   @dev Function withdraw moves tokens that were unstaked by the caller to the caller's wallet
    */
    function withdraw(uint256 amount) public returns (uint256) {
        // Make sure that they have enough ready to withdraw
        UnstakeRecord memory userPending = userToUnstake[msg.sender];
        require(userPending.amount >= amount, "not enough pending withdraw");
        require(block.number > userPending.endBlock, "unstake still locked");

        uint256 pendingDiff = userPending.amount.sub(amount);
        userToUnstake[msg.sender].amount = pendingDiff;
        pendingWithdrawalAmount = pendingWithdrawalAmount.sub(amount);

        //finally transfer out amount
        IERC777Upgradeable(poolAddresses[0]).send(msg.sender, amount, "");

        return 0;
    }

    function getEvents() public view returns (uint256  [] memory, uint256  [] memory) {
        return (updateEventBlockNumber, updateEventNewAmountStaked);
    }

}