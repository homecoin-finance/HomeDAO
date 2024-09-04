import React from 'react';

import '../../styles/basicStyles.css';
import '../../styles/investorInterface.css';

import { getPoolBorrowed, getEggs } from '../../state';

import { EggStatusSection } from '../../components/eggStatusSection';
import { EggsListSection } from '../../components/eggsListSection';

class Eggs extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      transferApproved: true,
      borrowed: 0,
      eggs: [],
      eggsUpdated: false,
      tokenUpdated: false,
    };
  }

  /**
   * Functions to update webpage State
   */
  setTabState(tab) {
    this.setState({ tabState: tab });
  }

  componentDidMount() {
    this.componentDidUpdate();
  }

  componentDidUpdate() {
    const { contractData } = this.props;
    const { poolContractInstance } = contractData;
    const { eggsUpdated, borrowed } = this.state;
    const isWeb3Connected = poolContractInstance !== undefined;

    if (isWeb3Connected) {
      if (borrowed === 0) {
        this.updateBorrowedAmount();
      }

      if (!eggsUpdated) {
        this.updateEggs();
      }
    }
  }

  updateBorrowedAmount() {
    const { contractData } = this.props;
    const { poolContractInstance } = contractData;

    const isWeb3Connected =
      poolContractInstance !== undefined && this.state.borrowed === 0;

    if (isWeb3Connected) {
      getPoolBorrowed({ poolContractInstance }).then((result) => {
        this.setState({
          borrowed: result,
        });
      });
    }
  }

  updateEggs() {
    const { network } = this.props;
    const networkName = network === 1 ? 'main' : 'rinkeby';
    getEggs(networkName).then((result) => {
      this.setState({
        eggs: result,
        eggsUpdated: true,
      });
    });
  }

  render() {
    const { eggsUpdated, eggs, borrowed } = this.state;
    return (
      <div>
        <EggStatusSection
          eggs={eggs}
          loading={!eggsUpdated}
          borrowed={borrowed}
        />
        <EggsListSection eggs={eggs} loading={!eggsUpdated} />
      </div>
    );
  }
}

export default Eggs;
