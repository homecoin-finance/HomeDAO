import React from 'react';

import '../../styles/basicStyles.css';
import '../../styles/investorInterface.css';

class TabsComponent extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      tabState: 'First',
      transferApproved: true,
      poolValueWithInterest: 0,
      poolTokenSupply: 0,
      averageInterest: 0,
      tokenUpdated: false,
    };
  }

  /**
   * Functions to update webpage State
   */
  setTabState(tab) {
    this.setState({ tabState: tab });
  }

  render() {
    const { tabOne, tabTwo, containerOne, containerTwo } = this.props;
    const { tabState } = this.state;

    return (
      <div className="investorInterface">
        <div className="investorInterfaceBody centered">
          <div className="investorInterfaceContainer">
            <div className="tabContainer">
              <div
                className={
                  tabState === 'First' ? 'tabLeftActive' : 'tabLeftInactive'
                }
                onClick={() => this.setTabState('First')}
              >
                {tabOne}
              </div>
              <div
                className={
                  tabState === 'Second' ? 'tabRightActive' : 'tabRightInactive'
                }
                onClick={() => this.setTabState('Second')}
              >
                {tabTwo}
              </div>
            </div>

            <div
              className="interfaceContainerOuterBorder"
              style={
                tabState === 'First'
                  ? { backgroundColor: '#18d43b' }
                  : { backgroundColor: '#ffa702' }
              }
            >
              <div className="interfaceContainerInnerBorder">
                {tabState === 'First' ? <span>{containerOne}</span> : <div />}
                {tabState === 'Second' ? <span>{containerTwo}</span> : <div />}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default TabsComponent;
