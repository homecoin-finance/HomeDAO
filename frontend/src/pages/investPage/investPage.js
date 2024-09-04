import { React, useMemo } from 'react';
import { useStore } from '@nanostores/react';

import { useLocation, useNavigate } from 'react-router-dom';

import SwipeableViews from 'react-swipeable-views';

import '../../styles/basicStyles.css';
import '../../styles/investorInterface.css';

import {
  unstakedHomeStore,
  unstakeHomeTransactionStateStore,
  unstakeHome,
} from '../../store/homeStore';
import { boostedHomeStore } from '../../store/homeBoostStore';

import { StatusSection } from '../../components';
import DepositForm from './depositForm';
import WithdrawForm from './withdrawForm';
import StakeForm from './stakeForm';
import UnstakeForm from './unstakeForm';
import BoostForm from './boostForm';
import MyBoostForm from './myBoostsForm';

const indexToSubPage = ['deposit', 'boost', 'myboosts', 'withdraw'];
const indexToSubPageLabel = ['Deposit', 'Boost', 'My Boosts', 'Withdraw'];

const subPageToIndex = indexToSubPage.reduce((p, c, i) => {
  p[c] = i;
  return p;
}, {});

function useQuery() {
  const { search } = useLocation();

  return useMemo(() => new URLSearchParams(search), [search]);
}

const InvestPage = () => {
  const unstakedHome = useStore(unstakedHomeStore);
  const boostedHome = useStore(boostedHomeStore);
  const query = useQuery();
  const navigate = useNavigate();
  let subPage = query.get('subPage');

  let currentIndex = subPageToIndex[subPage];
  if (currentIndex === null || currentIndex === undefined) {
    currentIndex = 0;
    subPage = indexToSubPage[currentIndex];
  }

  const handleIndexChange = (index, indexLatest, meta) => {
    // Ignore index changes based on focus because we are shifting
    // focus when the selected item changes
    if (meta.reason !== 'focus') {
      navigate(`/?subPage=${indexToSubPage[index]}`);
    }
  };

  const navButtons = indexToSubPage.map((pageId, index) => {
    const label = `${pageId[0].toUpperCase()}${pageId.slice(1)}`;
    if (subPage !== pageId) {
      return (
        <button
          key={'navButton' + index}
          className="navButton"
          onClick={() => {
            navigate(`/?subPage=${pageId}`);
          }}
        >
          {indexToSubPageLabel[index]}
        </button>
      );
    } else {
      return (
        <button
          key={'navButton' + index}
          className="selectedNavButton navButton"
        >
          {indexToSubPageLabel[index]}
        </button>
      );
    }
  });

  const navPages = indexToSubPage.map((pageId, index) => {
    const isActive = subPage === pageId;
    const key = 'navPage' + index;
    switch (pageId) {
      case 'deposit':
        return <DepositForm key={key} isActivePage={isActive} />;
      case 'boost':
        return <BoostForm key={key} isActivePage={isActive} />;
      case 'myboosts':
        return <MyBoostForm key={key} isActivePage={isActive} />;
      case 'withdraw':
        return <WithdrawForm key={key} isActivePage={isActive} />;
      default:
        return null;
    }
  });

  return (
    <div className="investorInterface">
      <StatusSection
        boostedHome={boostedHome}
        unstakedHome={unstakedHome}
        loading={false}
      />

      <div className="investorInterface">
        <div className="investorInterfaceBody centered">
          <div className="investorInterfaceContainer">
            <div className="investorButtonContainer">{navButtons}</div>
            <SwipeableViews
              animateTransitions={false}
              index={currentIndex}
              onChangeIndex={handleIndexChange}
            >
              {navPages}
            </SwipeableViews>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvestPage;
