//For testing the functions of the DevUSDC and Pool contracts
//Use the same mnemonic when starting ganache: [test mnemonic]

import { React, Component, useState } from 'react';
import SimpleCurrencyInput from './simpleCurrencyInput.js';

import { useStore } from '@nanostores/react';

import '../App.css';
import '../styles/devTools.css';

import { stakedHomeStore } from '../store/homeStore.js';

import {
  currentBlockNumberStore,
  currentBlockTimestampStore,
} from '../store/currentBlockStore.js';

import { homeBoostStore } from '../store/homeBoostStore.js';

import BigNumber from 'bignumber.js';

let fmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const BoostList = ({}) => {
  const boosts = useStore(homeBoostStore);

  console.log(boosts);

  return (
    <table className="loanTable">
      <thead>
        <tr>
          <th>Boost Id</th>
          <th>Amount</th>
          <th>level</th>
          <th>rewards</th>
        </tr>
      </thead>
      <tbody></tbody>
    </table>
  );
};

class DevTools extends Component {
  constructor(props) {
    super(props);
    this.state = {
      userLoans: {},
      propTokens: [],
      contractAddresses: {},
      tokenTransferApproved: true,
      baconAccrued: 0,
      repay: {},
      initialized: false,
      lastEpochInitialized: 0,
      lastEpochInitializedSushi: 0,
      lastEpochInitializedCurve: 0,
    };

    this.approveTransfer = this.approveTransfer.bind(this);
    this.lend = this.lend.bind(this);
    this.redeem = this.redeem.bind(this);
    this.getInterest = this.getInterest.bind(this);
    this.renderLoans = this.renderLoans.bind(this);
    this.initializeDevToolsData = this.initializeDevToolsData.bind(this);
  }

  componentDidUpdate() {
    this.initializeDevToolsData();
  }

  componentDidMount() {
    this.initializeDevToolsData();
    console.log('Subscribing...');
    let unbinds = [];
    unbinds.push(
      stakedHomeStore.listen((value) => {
        console.log(value);
      })
    );
    unbinds.push(
      currentBlockNumberStore.listen((value) => {
        console.log('got update to current block!');
        console.log(value);
        this.setState({ currentBlockNumber: value });
      })
    );
    unbinds.push(
      currentBlockTimestampStore.listen((value) => {
        this.setState({ currentBlockTime: value });
      })
    );
    this.setState({ unbinds: unbinds });
  }

  componentWillUnmount() {
    // pendingUnstakeBHomeStore.
    console.log('component unmounted!!');
    console.log(this.state.unbinds);
    for (let unbind of this.state.unbinds) unbind();
  }

  initializeDevToolsData() {
    const { address } = this.props;
    const { servicer, propTokens, initialized } = this.state;
    if (
      address &&
      servicer === undefined &&
      propTokens.length === 0 &&
      !initialized
    ) {
      console.log(initialized);
      this.setState({ initialized: true });
      try {
        this.updatePropTokenContractData();
      } catch (error) {
        console.log('propToken not live on this network yet');
      }

      //uncomment this when Pool0 is upgraded to Pool1
      this.updatePoolContractData();
      // this.updateBaconCoinData();
      // this.proposeSendDAOVote();
      // this.castVote();
      // this.queueProposal();
      // this.executeProposal();
      // this.getProposalState();
      // this.getQuorumVotes();
      this.getEpoch();
      this.getSushiEpoch();
      this.getCurveEpoch();
    }
  }

  async getCurrentEpoch() {
    const { address, contractData } = this.props;
    const { stakingContractInstance } = contractData;
    const epoch = await stakingContractInstance.methods
      .getCurrentEpoch()
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
          return 0;
        } else {
          return res;
        }
      });
    return parseInt(epoch);
  }

  async getIsEpochInitialized(epochId, poolAddress) {
    const { address, contractData } = this.props;
    const { stakingContractInstance } = contractData;
    const isInitialized = await stakingContractInstance.methods
      .epochIsInitialized(poolAddress, epochId)
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
          return false;
        } else {
          return res;
        }
      });
    return isInitialized;
  }

  async findLastInitializedEpoch(poolAddress) {
    let min = 0;
    let max = await this.getCurrentEpoch();
    this.setState({ currentEpoch: max });
    while (max > min) {
      let mid = Math.round((max + min + 1) / 2);
      let midIsInited = await this.getIsEpochInitialized(mid, poolAddress);
      if (midIsInited) {
        min = mid;
      } else {
        max = mid - 1;
      }
    }
    return min;
  }

  getEpoch() {
    const { contractData } = this.props;
    this.findLastInitializedEpoch(
      contractData.contractAddresses.poolAddress
    ).then((epoch) => {
      this.setState({ lastEpochInitialized: epoch });
    });
  }

  getSushiEpoch() {
    const { contractData } = this.props;
    this.findLastInitializedEpoch(
      contractData.contractAddresses.lpStakable.sushiBaconEth
    ).then((epoch) => {
      this.setState({ lastEpochInitializedSushi: epoch });
    });
  }

  getCurveEpoch() {
    const { contractData } = this.props;
    this.findLastInitializedEpoch(
      contractData.contractAddresses.lpStakable.curveHome3crv
    ).then((epoch) => {
      this.setState({ lastEpochInitializedCurve: epoch });
    });
  }

  delegateVotes() {
    const { address, contractData } = this.props;
    const { baconCoinContractInstance } = contractData;

    let delegatee = document.getElementById('delegatee').value;
    if (delegatee === '') {
      return;
    }

    baconCoinContractInstance.methods
      .delegate(delegatee)
      .send({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('delegated votes to ' + delegatee);
          console.log(res);
        }
      });
  }

  getVotes() {
    const { address, contractData } = this.props;
    const { baconCoinContractInstance } = contractData;
    baconCoinContractInstance.methods
      .getCurrentVotes(address)
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('got votes!');
          console.log(res);
          this.setState({ votingPower: res });
        }
      });
  }

  //proposes sending 5 bacon from Timelock to "devNetServicer"
  proposeSendDAOVote() {
    const { address, contractData } = this.props;
    const { governorAlphaContractInstance } = contractData;
    let that = this;
    console.log('propose');

    async function propose() {
      const encodedParam = await that.props.web3.eth.abi.encodeParameters(
        ['address', 'uint256'],
        [
          '0xa42f6FB68607048dDe54FCd53D2195cc8ca5F486',
          '250000000000000000000000',
        ]
      );

      console.log('data propose vote');
      console.log(
        governorAlphaContractInstance.methods
          .propose(
            ['0xa54d2EBfD977ad836203c85F18db2F0a0cF88854'],
            [0],
            ['transfer(address,uint256)'],
            [encodedParam],
            'send 250,000 baconCoin to multi-sig for distribution'
          )
          .encodeABI()
      );

      governorAlphaContractInstance.methods
        .propose(
          ['0xa54d2EBfD977ad836203c85F18db2F0a0cF88854'],
          [0],
          ['transfer(address,uint256)'],
          [encodedParam],
          'send 250,000 baconCoin to multi-sig for distribution'
        )
        .send({ from: address }, (err, res) => {
          if (err) {
            console.log(err);
          } else {
            console.log('sent Proposal!');
            console.log(res);
          }
        });
    }

    propose();
  }

  castVote() {
    const { address, contractData } = this.props;
    const { governorAlphaContractInstance } = contractData;
    governorAlphaContractInstance.methods
      .castVote(2, true)
      .send({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('sent Proposal!');
          console.log(res);
        }
      });
  }

  queueProposal() {
    const { address, contractData } = this.props;
    const { governorAlphaContractInstance } = contractData;
    governorAlphaContractInstance.methods
      .queue(2)
      .send({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('sent Proposal!');
          console.log(res);
        }
      });
  }

  executeProposal() {
    const { address, contractData } = this.props;
    const { governorAlphaContractInstance } = contractData;
    governorAlphaContractInstance.methods
      .execute(2)
      .send({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('sent Proposal!');
          console.log(res);
        }
      });
  }

  getProposalState() {
    const { address, contractData } = this.props;
    const { governorAlphaContractInstance } = contractData;
    governorAlphaContractInstance.methods
      .proposals(2)
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('got proposal state');
          console.log(res);
        }
      });
  }

  getQuorumVotes() {
    const { address, contractData } = this.props;
    const { governorAlphaContractInstance } = contractData;
    governorAlphaContractInstance.methods
      .quorumVotes()
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('got quorum votes');
          console.log(res);
        }
      });
  }

  updateBaconCoinData() {
    const { address, contractData } = this.props;
    const {
      poolStakingContractInstance,
      baconCoinContractInstance,
      poolStakingRewardsContractInstance,
    } = contractData;
    let that = this;

    poolStakingRewardsContractInstance.methods
      .getCurrentBalance(address)
      .call({ from: address }, (err, res) => {
        that.setState({ amountStaked: res });
      });

    poolStakingRewardsContractInstance.methods
      .massHarvest(address)
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('bacon accrued: ' + res);
        }
        that.setState({ baconAccrued: res });
      });

    baconCoinContractInstance.methods
      .balanceOf(address)
      .call({ from: address }, (err, res) => {
        that.setState({ baconDistributed: res });
      });

    poolStakingContractInstance.methods
      .getUserLastDistributed(address)
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          //console.log('lastDistribution: ' + res);
        }
        that.setState({ lastDistribution: res });
      });

    poolStakingContractInstance.methods
      .getContractInfo()
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          //console.log(res);
        }
      });

    this.getVotes();
  }

  updatePoolContractData() {
    console.log('updating PoolContract data');
    const { address, contractData } = this.props;
    const {
      poolContractInstance,
      usdcContractInstance,
      poolUtilsContractInstance,
    } = contractData;
    let that = this;

    // Call getContractData():
    let loanCount = 0;
    poolContractInstance.methods
      .getContractData()
      .call({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          this.setState({
            servicer: res[0],
            poolLent: res[2] / 1e6,
            poolValueWithInterest: res[3] / 1e6,
            poolBorrowed: res[4] / 1e6,
            loanCount: res[5],
          });

          //get details on loans
          loanCount = res[5];
          for (let i = 0; i < loanCount; i++) {
            poolContractInstance.methods
              .getLoanDetails(i)
              .call({ from: address }, (err, res) => {
                if (err) {
                  console.log('error');
                  console.log(err);
                }
                let tempLoan = {
                  loanId: res[0],
                  borrower: res[1],
                  interestRate: res[2] / 1e6,
                  principal: res[3] / 1e6,
                  interestAccrued: res[4] / 1e6,
                  timeOfLastPayment: res[5],
                  propTokenId: res[6],
                };

                this.setState((prevState) => {
                  let userLoans = Object.assign({}, prevState.userLoans);
                  userLoans[res[0]] = tempLoan;
                  return { userLoans };
                });
              });
          }
        }
      });

    // Call balanceOf usdc:
    usdcContractInstance.methods
      .balanceOf(address)
      .call({ from: address }, (err, res) => {
        that.setState({ usdcWalletBalance: res / 1e6 });
      });

    // Call balanceOf hc_pool:
    poolContractInstance.methods
      .balanceOf(address)
      .call({ from: address }, (err, res) => {
        that.setState({ poolWalletBalance: res / 1e6 });
      });

    console.log(poolContractInstance.methods.totalSupply().encodeABI());

    // Call getActiveLoans:
    poolUtilsContractInstance.methods
      .getActiveLoans()
      .call({ from: address }, (err, res) => {
        // console.log("getActiveLoans:")
        // console.log(res)
      });

    // Check average interest rate from poolUtils:
    // poolUtilsContractInstance.methods
    //   .getAverageInterest()
    //   .call({ from: address }, (err, res) => {
    //     console.log(res);
    //     //that.setState({poolWalletBalance: res/ Math.pow(10,6)})
    //   });
  }

  updatePropTokenContractData() {
    console.log('updating PropToken');
    const { address, contractData } = this.props;
    const { propTokenContractInstance } = contractData;

    // Call getLienCount:
    propTokenContractInstance.methods
      .getPropTokenCount()
      .call({ from: address }, (err, res) => {
        let tempPropTokenList = [];
        //console.log(res)

        for (let i = 0; i < res; i++) {
          propTokenContractInstance.methods
            .getPropTokenData(i)
            .call({ from: address }, (err, res) => {
              tempPropTokenList.push({
                id: i,
                holder: res[0],
                value: res[1],
                seniorLienValues: res[2],
                homeValue: res[3],
                homeAddress: res[4],
                issuedAt: res[5],
                photoURI: res[6],
              });

              this.setState({ propTokens: tempPropTokenList });
            });
        }
      });
  }

  transferBacon() {
    const { web3, address, contractData } = this.props;
    const { baconCoinContractInstance } = contractData;

    baconCoinContractInstance.methods
      .fakeTransfer(
        '0xb147DE117d304b2ae40d8737b415c630E5EC45dd',
        web3.utils.toBN('9000000000000000000').toString()
      )
      .send({ from: address }, (err, res) => {
        console.log(res);
        console.log('sent bacon');
      });
  }

  /*******************************************
   * Functions to call Pool contract methods
   *******************************************/
  approveTransfer() {
    console.log('transaction data field for approve transfer');
    const { web3, address, contractData } = this.props;
    const { usdcContractInstance, contractAddresses } = contractData;
    console.log(
      usdcContractInstance.methods
        .approve(
          contractAddresses.poolAddress,
          web3.utils
            .toBN(
              'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
            )
            .toString()
        )
        .encodeABI()
    );

    usdcContractInstance.methods
      .approve(
        contractAddresses.poolAddress,
        web3.utils
          .toBN(
            'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
          )
          .toString()
      )
      .send({ from: address }, (err, res) => {
        this.setState({ transferApproved: true });
      });
  }

  distributeBacon() {
    const { address, contractData } = this.props;
    const { poolStakingRewardsContractInstance } = contractData;
    let documentAddress = document.getElementById('distributeAddress').value;
    if (documentAddress === '') {
      return;
    }

    console.log(documentAddress);
    poolStakingRewardsContractInstance.methods
      .massHarvest(documentAddress)
      .call({ from: address }, (err, res) => {
        console.log(documentAddress + ' has earned ' + res + 'Bacon');
      });

    poolStakingRewardsContractInstance.methods
      .massHarvest(documentAddress)
      .send({ from: address }, (err, res) => {
        console.log(documentAddress + ' has earned ' + res + 'Bacon');
      });
  }

  lend() {
    const { web3, address, contractData } = this.props;
    const { poolContractInstance } = contractData;
    let amount = document.getElementById('lendAmount').value;
    if (amount === '') {
      return;
    }

    poolContractInstance.methods
      .lend(web3.utils.toBN(amount).toString())
      .send({ from: address }, (err, res) => {
        this.updatePoolContractData();
      });
  }

  lendAndStake() {
    const { web3, address, contractData } = this.props;
    const { poolContractInstance } = contractData;
    let amount = document.getElementById('lendAmount').value;
    if (amount === '') {
      return;
    }

    poolContractInstance.methods
      .lendAndStake(web3.utils.toBN(amount).toString())
      .send({ from: address }, (err, res) => {
        this.updatePoolContractData();
      });
  }

  redeem() {
    const { web3, address, contractData } = this.props;
    const { poolContractInstance } = contractData;
    let amount = document.getElementById('redeemAmount').value;
    if (amount === '') {
      return;
    }

    poolContractInstance.methods
      .redeem(web3.utils.toBN(amount).toString())
      .send({ from: address }, (err, res) => {
        this.updatePoolContractData();
      });
  }

  getbHomeBalance() {
    const { address, contractData } = this.props;
    const { poolContractInstance } = contractData;
    let documentAddress = document.getElementById('bHomeAddress').value;
    if (documentAddress === '') {
      return;
    }

    poolContractInstance.methods
      .balanceOf(documentAddress)
      .call({ from: address }, (err, res) => {
        console.log(res);
      });
  }

  transferBoost() {
    const { web3, address, contractData } = this.props;
    const { homeBoostContractInstance } = contractData;
    let toAddress = document.getElementById('boostToAddress').value;
    let boostId = document.getElementById('boostTransferTokenId').value;

    console.log('transferring boost ' + boostId + ' to: ' + toAddress + ' ');

    homeBoostContractInstance.methods
      .transferFrom(address, toAddress, web3.utils.toBN(boostId).toString())
      .send({ from: address }, (err, res) => {
        if (err) {
          console.log(err);
        } else {
          console.log('Sent!');
        }
      });
  }

  unstake() {
    const { web3, address, contractData } = this.props;
    const { poolStakingContractInstance } = contractData;
    let amount = document.getElementById('unstakeAmount').value;
    if (amount === '') {
      return;
    }

    poolStakingContractInstance.methods
      .unstake(web3.utils.toBN(amount).toString())
      .send({ from: address }, (err, res) => {
        console.log(err);
      });
  }

  withdraw() {
    const { web3, address, contractData } = this.props;
    const { poolStakingContractInstance } = contractData;
    let amount = document.getElementById('withdrawAmount').value;
    if (amount === '') {
      return;
    }

    poolStakingContractInstance.methods
      .withdraw(web3.utils.toBN(amount).toString())
      .send({ from: address }, (err, res) => {
        console.log(err);
      });
  }

  getInterest() {
    this.setState({ interestRate: 10000000 });
  }

  borrow() {
    const { web3, address, contractData } = this.props;
    const { poolContractInstance, propTokenContractInstance } = contractData;
    let amount = document.getElementById('interestAmount').value;
    let tokenID = document.getElementById('tokenID').value;
    if (amount === '' || tokenID === '') {
      return;
    }

    //first check to see if this token can be transferred by the pool contract
    propTokenContractInstance.methods
      .getApproved(tokenID)
      .call({ from: address }, (err, res) => {
        if (res !== poolContractInstance._address) {
          //if not set state so approve button pops up
          this.setState({ tokenTransferApproved: false });
        } else {
          //todo: make this TX send to gnosis safe
          console.log('data to create borrow transaction');
          console.log(
            poolContractInstance.methods
              .borrow(
                web3.utils.toBN(amount).toString(),
                this.state.interestRate,
                tokenID
              )
              .encodeABI()
          );

          //this.setState({txData: poolContractInstance.methods.borrow(web3.utils.toBN(amount).toString(), this.state.interestRate, tokenID).encodeABI()})

          poolContractInstance.methods
            .borrow(
              web3.utils.toBN(amount).toString(),
              this.state.interestRate,
              tokenID
            )
            .send({ from: address }, (err, res) => {
              this.updatePoolContractData();
            });
        }
      });
  }

  addBoostInterest() {
    const { web3, address, contractData } = this.props;
    const { homeBoostContractInstance } = contractData;

    homeBoostContractInstance.methods
      .appendInterestRate(web3.utils.toBN(50000))
      .send({ from: address }, (err, res) => {
        console.log(err);
        this.updatePoolContractData();
      });
  }

  setBoostInterestStartTime() {
    const { address, contractData } = this.props;
    const { homeBoostContractInstance } = contractData;

    let { currentBlockTime } = this.state;
    console.log('setting boost start time to ' + currentBlockTime);

    homeBoostContractInstance.methods
      .setWeeklyStartTime(currentBlockTime)
      .send({ from: address }, (err, res) => {
        this.updatePoolContractData();
      });
  }

  approveTokenTransfer() {
    const { address, contractData } = this.props;
    const { poolContractInstance, propTokenContractInstance } = contractData;
    let tokenID = document.getElementById('tokenID').value;
    if (tokenID === '') {
      return;
    }

    propTokenContractInstance.methods
      .approve(poolContractInstance._address, tokenID)
      .send({ from: address }, (err, res) => {
        console.log(res);
      });
  }

  repay(loanId, amount) {
    const { web3, address, contractData } = this.props;
    const { poolContractInstance } = contractData;
    if (amount === 0) {
      return;
    }

    // Convert to fixed point. Amount comes as number of cents. Convert to 6 decimal places
    amount = amount * (1e6 / 100);

    console.log('Sending repayment for ' + loanId + ' of ' + amount);

    poolContractInstance.methods
      .repay(loanId, web3.utils.toBN(amount).toString())
      .send({ from: address }, (err, res) => {
        this.updatePoolContractData();
      });
  }

  manualEpochInit() {
    const { web3, address, contractData } = this.props;
    const { stakingContractInstance } = contractData;

    let epoch = document.getElementById('epoch').value;
    if (epoch === '') {
      return;
    }
    console.log(epoch);

    stakingContractInstance.methods
      .manualEpochInit(
        [contractData.contractAddresses.poolAddress],
        parseInt(epoch)
      )
      .send({ from: address }, (err, res) => {
        console.log(res);
      });
  }

  batchEpochInit() {
    const { web3, address, contractData } = this.props;
    const { stakingContractInstance } = contractData;

    console.log('batchEpochInit');
    console.log('sushi: ' + this.state.lastEpochInitializedSushi);
    console.log('curve: ' + this.state.lastEpochInitializedCurve);
    stakingContractInstance.methods
      .manualBatchEpochInit(
        [contractData.contractAddresses.poolAddress],
        this.state.lastEpochInitialized + 1,
        this.state.currentEpoch
      )
      .send({ from: address }, (err, res) => {
        console.log(res);
      });
    stakingContractInstance.methods
      .manualBatchEpochInit(
        [contractData.contractAddresses.lpStakable.sushiBaconEth],
        this.state.lastEpochInitializedSushi + 1,
        this.state.currentEpoch
      )
      .send({ from: address }, (err, res) => {
        console.log(res);
      });

    stakingContractInstance.methods
      .manualBatchEpochInit(
        [contractData.contractAddresses.lpStakable.curveHome3crv],
        this.state.lastEpochInitializedCurve + 1,
        this.state.currentEpoch
      )
      .send({ from: address }, (err, res) => {
        console.log(res);
      });
  }

  /************************************************
   * Functions to call PropToken contract methods
   *************************************************/
  mintPropToken() {
    const { address, contractData } = this.props;
    const { propTokenContractInstance } = contractData;
    let to = document.getElementById('mintTo').value;
    if (to === '') {
      return;
    }
    let lienValue = document.getElementById('mintValue').value;
    if (lienValue === '') {
      return;
    }
    let seniorLienValues = document.getElementById('mintSenior').value;
    seniorLienValues = seniorLienValues.split(',').map(Number);
    let propValue = document.getElementById('mintPropValue').value;
    if (propValue === '') {
      return;
    }
    let propAddress = document.getElementById('mintAddress').value;
    if (propAddress === '') {
      return;
    }
    let propPhotoURI = document.getElementById('mintPhotoURI').value;
    if (propAddress === '') {
      return;
    }

    console.log('tx data to be submitted to gnosis safe');
    console.log(
      propTokenContractInstance.methods
        .mintPropToken(
          to,
          lienValue,
          seniorLienValues,
          propValue,
          propAddress,
          propPhotoURI
        )
        .encodeABI()
    );

    console.log(address);

    propTokenContractInstance.methods
      .mintPropToken(
        to,
        lienValue,
        seniorLienValues,
        propValue,
        propAddress,
        propPhotoURI
      )
      .send({ from: address }, (err, res) => {
        this.updatePropTokenContractData();
      });
  }

  /************************************************
   *           Functions to Render tables
   *************************************************/

  //renderLoans() will populate the rows of the Loans table after getContractData() updates the current loans
  renderLoans() {
    let rows = [];

    let loans = Object.values(this.state.userLoans);
    let sorted = loans.sort((a, b) => a.loanId - b.loanId);
    let props = this.state.propTokens.sort((a, b) => a.id - b.id);

    for (let i = 0; i < loans.length; i++) {
      let address =
        (props[loans[i].propTokenId] &&
          props[loans[i].propTokenId].homeAddress) ||
        '';

      rows.push(
        <tr key={loans[i].loanId}>
          <td>{loans[i].loanId}</td>
          <td>
            {loans[i].borrower.substr(0, 6)}...{loans[i].borrower.substr(-4)}
          </td>
          <td>{address}</td>
          <td>{loans[i].interestRate.toFixed(3)}%</td>
          <td style={{ textAlign: 'right' }}>
            {fmt.format(loans[i].principal)}
          </td>
          <td style={{ textAlign: 'right' }}>
            {fmt.format(loans[i].interestAccrued)}
          </td>
          <td style={{ textAlign: 'right' }}>
            {new Date(sorted[i].timeOfLastPayment * 1000).toLocaleDateString(
              'en-US'
            )}
          </td>
          <td>{loans[i].propTokenId}</td>
          <td>
            <SimpleCurrencyInput
              id={'repay-' + loans[i].loanId} //optional
              value={this.state.repay[loans[i].loanId]}
              unit="$"
              onInputChange={(v) => {
                let repay = { ...this.state.repay };
                repay[loans[i].loanId] = v;
                this.setState({ repay: repay });
              }}
            />
            <div
              className="devToolsButton"
              onClick={() =>
                this.repay(loans[i].loanId, this.state.repay[loans[i].loanId])
              }
            >
              Make Payment
            </div>
          </td>
        </tr>
      );
    }

    return rows;
  }

  //renderPropTokens() will populate the rows of the Lien table after getContractData() updates the current liens
  renderPropTokens() {
    let rows = [];
    //console.log(this.state.propTokens[0])

    let sorted = this.state.propTokens.sort((a, b) => a.id - b.id);

    for (let i = 0; i < sorted.length; i++) {
      rows.push(
        <tr key={i}>
          <td>{sorted[i].id}</td>
          <td>{sorted[i].holder}</td>
          <td style={{ textAlign: 'right' }}>
            {fmt.format(sorted[i].value / 1e6)}
          </td>
          <td style={{ textAlign: 'right' }}>
            {fmt.format(sorted[i].seniorLienValues / 1e6)}
          </td>
          <td style={{ textAlign: 'right' }}>
            {fmt.format(sorted[i].homeValue / 1e6)}
          </td>
          <td>{sorted[i].homeAddress}</td>
          <td style={{ textAlign: 'right' }}>
            {new Date(sorted[i].issuedAt * 1000).toLocaleDateString('en-US')}
          </td>
          <td>
            <img alt="img" src={sorted[i].photoURI} className="rowPhoto" />
          </td>
        </tr>
      );
    }

    return rows;
  }

  render() {
    const { network, contractData } = this.props;
    const { contractAddresses } = contractData;

    return (
      <div className="devTools" style={{ fontFamily: 'Arial' }}>
        <div>
          <h1>BaconCoin DevTools</h1>
          <p>Current network is: {network}</p>
          <p>
            The Pool's total value (w/ interest) is:{' '}
            {this.state.poolValueWithInterest}
          </p>
          <p>Pool Amount Lent: {this.state.poolLent}</p>
          <p>Pool Amount Borrowed: {this.state.poolBorrowed}</p>
          <p>Your HOME Wallet Balance is: {this.state.poolWalletBalance} </p>
          <p>
            The currentEpoch is {this.state.currentEpoch}. Last initialized is{' '}
            {this.state.lastEpochInitialized}
          </p>
          <div className="columns">
            {/*left column is to approve usdc transfer*/}
            <div className="centered">
              <p>
                Your DevUSDC Wallet Balance is: {this.state.usdcWalletBalance}
              </p>
              <p>The USDC Contract address is: {this.state.devUsdcAddress}</p>
              <div
                className="devToolsButton"
                onClick={() => this.approveTransfer()}
              >
                Approve USDC transfer
              </div>
              <div
                className="devToolsButton"
                onClick={() => this.transferBacon()}
              >
                Send 9 bacon to hotwallet
              </div>
              {this.state.transferApproved ? <div>Approved!</div> : <div />}
            </div>

            {/*middle column is for lending/redeeming*/}
            <div>
              Lending
              <div className="columns">
                <input id="lendAmount" type="number" />
                <div className="devToolsButton" onClick={() => this.lend()}>
                  Lend in USDC (after approving)
                </div>
                <div
                  className="devToolsButton"
                  onClick={() => this.lendAndStake()}
                >
                  LendAndStake USDC
                </div>
              </div>
              <div className="columns">
                <input id="redeemAmount" type="number" />
                <div className="devToolsButton" onClick={() => this.redeem()}>
                  Redeem in hc_pool (after approving)
                </div>
              </div>
              <div className="columns">
                <input id="bHomeAddress" type="text" />
                <div
                  className="devToolsButton"
                  onClick={() => this.getbHomeBalance()}
                >
                  look up Home amount
                </div>
              </div>
            </div>

            {/*right column is for borrowing*/}
            <div className="txData">
              Borrowing
              <div className="columns">
                <input id="interestAmount" type="number" />
                <div
                  className="devToolsButton"
                  onClick={() => this.getInterest()}
                >
                  Check interest on Borrowing in USDC
                </div>
              </div>
              {this.state.interestRate === undefined ? (
                <div />
              ) : (
                <div className="columns">
                  <input id="tokenID" placeholder="Token ID" />
                  <div className="devToolsButton" onClick={() => this.borrow()}>
                    Click here to lock in interest at{' '}
                    {this.state.interestRate / 1e6} %
                  </div>
                </div>
              )}
              {this.state.tokenTransferApproved ? (
                <div />
              ) : (
                <div className="columns">
                  <div
                    className="devToolsButton"
                    onClick={() => this.approveTokenTransfer()}
                  >
                    Click here first to first approve the transfer of this token
                  </div>
                </div>
              )}
              {/* Print the data that needs to be put in gnosis safe on the page */}
              {this.state.txData ? (
                <div>Use this data: {this.state.txData}</div>
              ) : (
                <div />
              )}
              <div></div>
            </div>
          </div>
          Boost data here:
          <div className="stakingColumn">
            <div className="row">
              <input id="boostToAddress" type="string"></input>
              <input id="boostTransferTokenId" type="number"></input>
              <div
                className="devToolsButton"
                onClick={() => this.transferBoost()}
              >
                transfer Boost
              </div>
            </div>
            <div className="row">
              <BoostList />
            </div>
          </div>
          {/*bottom table is for loans*/}
          Staking data here:
          <div className="stakingColumn">
            <div className="row">
              <input id="stakeAmount" type="number" />
              <div className="devToolsButton" onClick={() => this.stake()}>
                stake HOME
              </div>
            </div>
            <div className="row">
              <input id="unstakeAmount" type="number" />
              <div className="devToolsButton" onClick={() => this.unstake()}>
                unstake HOME
              </div>
            </div>
            <div className="row">
              <input id="withdrawAmount" type="number" />
              <div className="devToolsButton" onClick={() => this.withdraw()}>
                withdraw HOME
              </div>
              <input id="delegatee" type="string" />
              <div
                className="devToolsButton"
                onClick={() => this.delegateVotes()}
              >
                delegate votes to this address
              </div>
            </div>
            <div className="row">
              <input id="distributeAddress" type="string" />
              <div
                className="devToolsButton"
                onClick={() => this.distributeBacon()}
              >
                distribute my Bacon
              </div>
            </div>
            <div className="row">
              <input id="epoch" type="number" />
              <div
                className="devToolsButton"
                onClick={() => this.manualEpochInit()}
              >
                initializeThisEpoch
              </div>
            </div>
            <div className="row">
              <div
                className="devToolsButton"
                onClick={() => this.batchEpochInit()}
              >
                initialize All Epochs
              </div>
            </div>
            <div className="row">
              <div
                className="devToolsButton"
                onClick={() => this.addBoostInterest()}
              >
                add boost interest rate
              </div>
            </div>
            <div className="row">
              <div
                className="devToolsButton"
                onClick={() => this.setBoostInterestStartTime()}
              >
                set boost start time
              </div>
            </div>
          </div>
          <div className="stakingColumns">
            <p>
              Your amount staked is: {this.state.amountStaked / Math.pow(10, 6)}
            </p>
            <p>
              Your HOME pending withdraw is:{' '}
              {this.state.pendingWithdrawInfo
                ? this.state.pendingWithdrawInfo.amount / Math.pow(10, 6)
                : '--'}
            </p>
            <p>
              Your bacon Accrued is:{' '}
              {this.state.baconAccrued / Math.pow(10, 18)}
            </p>
            <p>
              Your bacon distributed is:{' '}
              {this.state.baconDistributed / Math.pow(10, 18)}
            </p>
            <p>
              Your voting power is: {this.state.votingPower / Math.pow(10, 18)}
            </p>
          </div>
          <div className="loansDiv">
            Loans
            <table className="loanTable">
              <thead>
                <tr>
                  <th>loanId</th>
                  <th>borrower</th>
                  <th>address</th>
                  <th>interest rate</th>
                  <th>principal</th>
                  <th>interest accrued</th>
                  <th>last payment</th>
                  <th>propTokenId</th>
                  <th>make payment</th>
                </tr>
              </thead>
              <tbody>{this.renderLoans()}</tbody>
            </table>
          </div>
          <div>
            <div className="propTokensContainer">
              <div className="propTokenForm">
                <div>
                  PropToken "To" address: <input id="mintTo" />
                </div>
                <div>
                  PropToken value: <input id="mintValue" type="number" />
                </div>
                <div>
                  Senior liens (comma seperated): <input id="mintSenior" />
                </div>
                <div>
                  PropToken home value:{' '}
                  <input id="mintPropValue" type="number" />
                </div>
                <div>
                  PropToken home address: <input id="mintAddress" />
                </div>
                <div>
                  Prop photo URI: <input id="mintPhotoURI" />
                </div>
              </div>
              <div
                className="devToolsButton"
                onClick={() => this.mintPropToken()}
              >
                Mint Prop Token
              </div>
            </div>
            <div className="loansDiv">
              PropTokens
              <table className="loanTable">
                <thead>
                  <tr>
                    <th>token ID</th>
                    <th>token Holder</th>
                    <th>lien value</th>
                    <th>seniorLienValues</th>
                    <th>home value</th>
                    <th>address</th>
                    <th>issued at</th>
                    <th>property photo</th>
                  </tr>
                </thead>
                <tbody>{this.renderPropTokens()}</tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default DevTools;
