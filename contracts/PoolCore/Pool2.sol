// contracts/Pool0.sol
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "../@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "../@openzeppelin/contracts-upgradeable/token/ERC777/ERC777Upgradeable.sol";
import '../@openzeppelin/contracts-upgradeable/token/ERC20/IERC20Upgradeable.sol';
import './../PropTokens/PropToken0.sol';
import './../LTVGuidelines.sol';
import "../@openzeppelin/contracts-upgradeable/token/ERC721/IERC721ReceiverUpgradeable.sol";
import '../@openzeppelin/contracts/utils/math/SafeMath.sol';
import '../@openzeppelin/contracts/utils/math/SignedSafeMath.sol';

contract Pool2 is Initializable, ERC777Upgradeable, IERC721ReceiverUpgradeable {
    using SignedSafeMath for int256;
    using SafeMath for uint256;

    struct Loan{
        uint256 loanId;
        address borrower;
        uint256 interestRate;
        uint256 principal;
        uint256 interestAccrued;
        uint256 timeLastPayment;
    }

    address servicer;
    address ERCAddress;
    address[] servicerAddresses;
    /* Adding a variable above this line (not reflected in Pool0) will cause contract storage conflicts */

    uint256 poolLent;
    uint256 poolBorrowed;
    mapping(address => uint256[]) userLoans;
    Loan[] loans;
    uint256 loanCount;

    uint constant servicerFeePercentage = 1000000;
    uint constant baseInterestPercentage = 0;
    uint constant curveK = 200000000;

    /* Pool1 variables introduced here */
    string private _name;
    string private _symbol;
    mapping(uint256 => uint256) loanToPropToken;
    address propTokenContractAddress;

    /* Pool2 variables introduced here */
    address LTVOracleAddress;


    /*****************************************************
    *       POOL STRUCTURE / UPGRADABILITY FUNCTIONS
    ******************************************************/

    function initializePoolTwo(address _LTVOracleAddress) public {
        require(msg.sender == servicer);
        LTVOracleAddress = _LTVOracleAddress;
    }

    function name() public view override returns (string memory) {
        return _name;
    }

    function symbol() public view override returns(string memory) {
        return _symbol;
    }

    function decimals() public pure override returns(uint8) {
        return 6;
    }
    
    /** 
    *   @dev Function setApprovedAddresses() updates the array of addresses approved by the servicer
    *   @param _servicerAddresses The array of addresses to be set as approved for borrowing
    */
    function setApprovedAddresses(address[] memory _servicerAddresses) public {
        require(msg.sender == servicer);

        servicerAddresses = _servicerAddresses;
    }

    /** 
    *   @dev Function setApprovedAddresses() is an internal function that checks the array of approved addresses for the given address
    *   @param _address The address to be checked if it is approved
    *   @return isApproved is if the _addess is found in the list of servicerAddresses
    */
    function isApprovedServicer(address _address) internal view returns (bool) {
        bool isApproved = false;
        
        for (uint i = 0; i < servicerAddresses.length; i++) {
            if(_address == servicerAddresses[i]) {
                isApproved = true;
            }
        }

        return isApproved;
    }

    /*****************************************************
    *                GETTER FUNCTIONS
    ******************************************************/
    /**
    *   @dev Function getContractData() returns a lot of variables about the contract
    */
    function getContractData() public view returns (address, address, uint256, uint256, uint256, uint256) {
        return (servicer, ERCAddress, poolLent, getPoolValueWithInterest(), poolBorrowed, loanCount);
    }

    /**  
    *   @dev Function getPoolValueWithInterest() returns the contract address of ERC20 this pool accepts (ususally USDC)
    */
    function getPoolValueWithInterest() public view returns (uint256) {
        uint256 totalWithInterest = poolLent;

        for (uint i=0; i<loans.length; i++) {
            totalWithInterest = totalWithInterest.add(getLoanAccruedInterest(i));
        }

        return totalWithInterest;
    }

    /**  
    *   @dev Function getSupplyableTokenAddress() returns the contract address of ERC20 this pool accepts (ususally USDC)
    */
    function getSupplyableTokenAddress() public view returns (address) {
        return ERCAddress;
    }

    /**  
    *   @dev Function getServicerAddress() returns the address of this pool's servicer
    */
    function getServicerAddress() public view returns (address) {
        return servicer;
    }

    /**  
    *   @dev Function getActiveLoans() returns an array of the loans currently out by users
    *   @return array of bools, where the index i is the loan ID and the value bool is active or not
    */
    function getActiveLoans() public view returns (bool[] memory) {
        bool[] memory loanActive = new bool[](loans.length);

        for (uint i = 0; i < loans.length; i++) {
            if(loans[i].principal != 0) {
                loanActive[i] = true;
            } else {
                loanActive[i] = false;
            }
        }

        return loanActive;
    }

    /**  
    *   @dev Function getLoanAccruedInterest() calculates and returns the amount of interest accrued on a given loan
    *   @param loanId is the id for the loan we're looking up
    */
    function getLoanAccruedInterest(uint256 loanId) public view returns (uint256) {
        Loan memory loan = loans[loanId];
        uint256 secondsSincePayment = block.timestamp.sub(loan.timeLastPayment);

        uint256 interestPerSecond = loan.principal.mul(loan.interestRate).div(31622400);
        uint256 interestAccrued = interestPerSecond.mul(secondsSincePayment).div(100000000);
        return interestAccrued.add(loan.interestAccrued);
    }    

    /**  
    *   @dev Function getLoanDetails() returns an all the raw details about a loan
    *   @param loanId is the id for the loan we're looking up
    *   EDITED in pool1 to also return PropToken ID
    */
    function getLoanDetails(uint256 loanId) public view returns (uint256, address, uint256, uint256, uint256, uint256, uint256) {
        Loan memory loan = loans[loanId];
        //temp interestAccrued calculation because this is a read function
        uint256 interestAccrued = getLoanAccruedInterest(loanId);
        uint256 propTokenID = loanToPropToken[loanId];
        return (loan.loanId, loan.borrower, loan.interestRate, loan.principal, interestAccrued, loan.timeLastPayment, propTokenID);
    }

    /**  
    *   @dev Function getAverageInterest() returns an average interest for the pool
    */
    function getAverageInterest() public view returns (uint256) {
        uint256 sumOfRates = 0;
        uint256 borrowedCounter = 0;

       for (uint i = 0; i < loans.length; i++) {
           if(loans[i].principal != 0){
               sumOfRates = sumOfRates.add(loans[i].interestRate.mul(loans[i].principal));
               borrowedCounter = borrowedCounter.add(loans[i].principal);
           }
       }

       return sumOfRates.div(borrowedCounter);
    }

    /*****************************************************
    *                LENDING/BORROWING FUNCTIONS
    ******************************************************/

    /**  
    *   @dev Function mintProportionalPoolTokens calculates how many new hc_pool tokens to mint when value is added to the pool based on proportional value
    *   @param recepient The address of the wallet receiving the newly minted hc_pool tokens
    *   @param amount The amount to be minted
    */
    function mintProportionalPoolTokens(address recepient, uint256 amount) private {
        //check if this is first deposit
        if (poolLent == 0) {
            super._mint(recepient, amount, "", "");
        } else {
            //Calculate proportional to total value (including interest)
            uint256 new_hc_pool = amount.mul(super.totalSupply()).div(poolLent);
            super._mint(recepient, new_hc_pool, "", "");
        }
    }

    /**  
    *   @dev Function lend moves assets on the (probably usdc) contract to our own balance
    *   - Before calling: an approve(address _spender (proxy), uint256 _value (0xffff)) function call must be made on remote contract
    *   @param amount The amount to be transferred
    */
    function lend(
        uint256 amount
    ) public {
        //USDC on Ropsten only right now
        IERC20Upgradeable(ERCAddress).transferFrom(msg.sender, address(this), amount);
        mintProportionalPoolTokens(msg.sender, amount);
        poolLent = poolLent.add(amount);
    }

    /**  
    *   @dev Function redeem burns the sender's hcPool tokens and transfers the usdc back to them
    *   @param amount The amount of hc_pool to be redeemed
    */
    function redeem(
        uint256 amount
    ) public {
        //check to see if sender has enough hc_pool to redeem
        require(balanceOf(msg.sender) >= amount);

        //check to make sure there is liquidity available in the pool to withdraw
        uint256 tokenPrice = poolLent.mul(1000000).div(super.totalSupply());
        uint256 erc20ValueOfTokens = amount.mul(tokenPrice).div(1000000);
        require(erc20ValueOfTokens <= (poolLent - poolBorrowed));

        //burn hcPool first
        super._burn(msg.sender, amount, "", "");
        poolLent = poolLent.sub(erc20ValueOfTokens);
        IERC20Upgradeable(ERCAddress).transfer(msg.sender, erc20ValueOfTokens);
    }

    /**  
    *   @dev Function getInterestRate calculates the new interest rate if a loan was to be taken out in this block
    *   @param amount The size of the potential loan in (probably usdc).
    *   @return interestRate The interest rate in APR for the loan
    */
    function getInterestRate(uint256 amount) public view returns (int256) {
        //I = (( U - k ) / (U - 100)) - 0.01k + Base + ServicerFee
        //all ints multiplied by 1000000 to represent the 6 decimal points available
        
        //first check available allocation
        require(amount < (poolLent - poolBorrowed));

        //get new proposed utilization amount
        int256 newUtilizationRatio = int256(poolBorrowed).add(int256(amount)).mul(100000000).div(int256(poolLent));

        //calculate interest
        //subtract k from U
        int256 numerator = newUtilizationRatio.sub(int256(curveK));  
        //subtract 100 from U
        int256 denominator = newUtilizationRatio.sub(100000000);
        //divide numerator by denominator and multiply percentage by 10^6 to account for decimal places
        int256 interest = numerator.mul(1000000).div(denominator);
        //add base and fees to interest
        interest = interest.sub(int256(curveK).div(100)).add(int256(servicerFeePercentage)).add(int256(baseInterestPercentage)); 
        
        return interest;
    }

    /**  
    *   @dev Function borrow creates a new Loan, moves the USDC to Borrower, and returns the loan ID and fixed Interest Rate
    *   - Also creates an origination fee for the Servicer in HC_Pool
    *   @param amount The size of the potential loan in (probably usdc).
    *   @param maxRate The size of the potential loan in (probably usdc).
    *   EDITED in pool1 to also require a PropToken
    *   EDITED in pool1 - borrower param was removed and msg.sender is new recepient of USDC
    *   EDITED in pool2 - propToken data is oulled and LTV of loan is required before loan can process
    */
    function borrow(uint256 amount, uint256 maxRate, uint256 propTokenId) public {
        //for v2 require this address is approved to transfer propToken 
        require(PropToken0(propTokenContractAddress).getApproved(propTokenId) == address(this), "pool not approved to move egg");
        //also require msg.sender is owner of token
        require(PropToken0(propTokenContractAddress).ownerOf(propTokenId) == msg.sender, "msg.sender not egg owner");

        //check the requested interest rate is still available
        uint256 fixedInterestRate = uint256(getInterestRate(amount));
        require(fixedInterestRate <= maxRate, "interest rate no longer avail");

        //require the propToken approved has a lien value less than or equal to the requested loan size
        uint256 lienAmount = PropToken0(propTokenContractAddress).getLienValue(propTokenId);
        require(lienAmount >= amount, "loan larger that egg value");

        //require that LTV of propToken is less than LTV required by oracle
        uint256 LTVRequirement = LTVGuidelines(LTVOracleAddress).getMaxLTV();
        (, , uint256[] memory SeniorLiens, uint256 HomeValue, , ,) = PropToken0(propTokenContractAddress).getPropTokenData(propTokenId);
        for (uint i = 0; i < SeniorLiens.length; i++) {  
            lienAmount = lienAmount.add(SeniorLiens[i]);
        }
        require(lienAmount.mul(100).div(HomeValue) < LTVRequirement, "LTV too high");


        //first take the propToken
        PropToken0(propTokenContractAddress).safeTransferFrom(msg.sender, address(this), propTokenId);

        //create new Loan
        Loan memory newLoan = Loan(loanCount, msg.sender, fixedInterestRate, amount, 0, block.timestamp);
        loans.push(newLoan);
        userLoans[msg.sender].push(loanCount);

        //map new loanID to Token ID
        loanToPropToken[loanCount] = propTokenId;

        //update system variables
        loanCount = loanCount.add(1);
        poolBorrowed = poolBorrowed.add(amount);

        //finally move the USDC
        IERC20Upgradeable(ERCAddress).transfer(msg.sender, amount);

        //then mint HC_Pool for the servicer (fixed 1% origination is better than standard 2.5%)
        mintProportionalPoolTokens(servicer, amount.div(100));
    }
    
    /**  
    *   @dev Function repay repays a specific loan
    *   - payment is first deducted from the interest then principal. 
    *   - the servicer_fee is deducted from the interest repayment and servicer is compensated in hc_pool
    *   - repayer must have first approved fromsfers on behalf 
    *   @param loanId The loan to be repayed
    *   @param amount The amount of the ERC20 token to repay the loan with
    *   EDITED - Pool1 returns propToken when principal reaches 0
    */

    function repay(uint256 loanId, uint256 amount) public {        
        //interestAmountRepayed keeps track of how much of the loan was returned to the pool to calculate servicer fee(treated as cash investment)
        uint256 interestAmountRepayed = amount;

        uint256 currentInterest = getLoanAccruedInterest(loanId);
        if(currentInterest > amount) {
            //if the payment is less than the interest accrued on the loan, just deduct amount from interest
            //deduct amount FIRST (to make sure they have available balance), then reduce loan amount
            IERC20Upgradeable(ERCAddress).transferFrom(msg.sender, address(this), amount);
            loans[loanId].interestAccrued = currentInterest.sub(amount);
        } else {
            //if the amount borrow is repaying is greater than interest accrued, deduct the rest from principal
            interestAmountRepayed = currentInterest;
            uint256 amountAfterInterest = amount.sub(currentInterest);
            
            if(loans[loanId].principal > amountAfterInterest) {
                //deduct amount from Borrower and reduce the principal
                IERC20Upgradeable(ERCAddress).transferFrom(msg.sender, address(this), amount);
                //return the repayed principal to the 'borrowable' amount
                poolBorrowed = poolBorrowed.sub(amountAfterInterest);
                loans[loanId].principal = loans[loanId].principal.sub(amountAfterInterest);
            } else {
                //deduct totalLoanValue
                uint256 totalLoanValue = loans[loanId].principal.add(currentInterest);
                IERC20Upgradeable(ERCAddress).transferFrom(msg.sender, address(this), totalLoanValue);
                //return the repayed principal to the 'borrowable' amount
                poolBorrowed = poolBorrowed.sub(loans[loanId].principal);
                loans[loanId].principal = 0;
                //Send PropToken back to borrower
                PropToken0(propTokenContractAddress).safeTransferFrom(address(this), loans[loanId].borrower, loanToPropToken[loanId]);
            }

            //set interest accrued to 0 AFTER successful erc20 transfer
            loans[loanId].interestAccrued = 0;
        }

        //last payment timestamp is only updated AFTER  successful erc20 transfer
        loans[loanId].timeLastPayment = block.timestamp;

        //treat repayed interest as new money Lent into the pool
        poolLent = poolLent.add(interestAmountRepayed);

        //servicer fee is treated as cash investment in the pool as the percentage interest
        //calculate how much of payment goes to servicer here
        uint256 servicerFeeInERC = servicerFeePercentage.mul(interestAmountRepayed).div(loans[loanId].interestRate);
        mintProportionalPoolTokens(servicer, servicerFeeInERC);
    }


    /**  
    *   @dev Function getVersion returns current upgraded version
    */
    function getVersion() public pure returns (uint) {
        return 2;
    }

    function onERC721Received(address, address, uint256, bytes memory ) public pure override returns (bytes4) {
        return this.onERC721Received.selector;
    }
}