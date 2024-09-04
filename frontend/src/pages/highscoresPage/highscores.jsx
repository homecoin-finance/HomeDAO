import { React, useState } from 'react';
import { useStore } from '@nanostores/react';

import '../../styles/basicStyles.css';
import './highscores.css';

import { getRwaScores } from '../../state';

import { weeklyRewardsStore } from '../../store/homeBoostStore';

import crown from '../../assets/images/crown.png';
import arrow from '../../assets/images/arrow.png';

const Highscores = ({ network, userAddress }) => {
  const [rwaScores, setRwaScores] = useState(null);
  const weeklyRewards = useStore(weeklyRewardsStore);

  if (!rwaScores) {
    getRwaScores({
      address: userAddress,
      network: network === 1 ? 'main' : 'rinkeby',
    }).then((result) => {
      setRwaScores(result);
    });
    setRwaScores('loading');
  }

  const getNumberWithOrdinal = (n) => {
    const s = ['TH', 'ST', 'ND', 'RD'],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const getAccruedRwa = (staked, totalBHomeStaked) => {
    const accruedBalance =
      ((staked / totalBHomeStaked) * weeklyRewards.toNumber()) / 7;
    return accruedBalance.toFixed(1);
  };

  const formatAddress = (address) => {
    return address.substring(0, 6) + '...' + address.slice(-4);
  };

  if (!rwaScores || rwaScores == 'loading') {
    return (
      <div className="highscoresSection">
        <div className="pageHeader">Liquidity Providers</div>
        <div className="main-container"></div>
      </div>
    );
  }

  const stakers = rwaScores.high_scores;
  const totalBHomeStaked = rwaScores.total_bhome_staked;
  const userAddressFormatted = !!userAddress ? formatAddress(userAddress) : '';
  const user = rwaScores.address_score;
  const userStaked = user.bhome_staked;
  const userAccrued = !!userAddress
    ? getAccruedRwa(userStaked, totalBHomeStaked)
    : 0;
  let addresses = [];
  stakers.forEach((staker) => {
    addresses.push(staker.wallet);
  });
  const userRank = user.rank;
  const userRankFormatted =
    userRank !== -1 ? getNumberWithOrdinal(userRank) : '';
  const userInTop = addresses.slice(0, 10).includes(userAddress);

  return (
    <div className="highscoreSection">
      <div className="pageHeader">Liquidity Providers</div>
      <div className="main-container">
        <div className="table-container">
          <div className="table-row heading">
            <div className="crown"></div>
            <div className="rank-row column-name">Rank</div>
            <div className="wallet-row column-name">Wallet</div>
            <div className="rwa-row column-name">RWA Earned (24hr)</div>
          </div>
          {stakers.slice(0, 10).map((staker) => {
            const addressFormatted = formatAddress(staker.wallet);
            const rank = getNumberWithOrdinal(staker.rank);
            const accrued = getAccruedRwa(
              staker.bhome_staked,
              totalBHomeStaked
            );
            return (
              <div className="table-row" key={rank}>
                {staker.wallet === userAddress ? (
                  <>
                    <div className="user-rank">
                      <img alt="arrow" src={arrow} />
                    </div>
                    <div className="rank-row green">{rank}</div>
                    <div className="wallet-row green">
                      {addressFormatted.toUpperCase()}
                    </div>
                    <div className="rwa-row green">{accrued}</div>
                  </>
                ) : (
                  <div className="table-row">
                    {staker.rank <= 3 ? (
                      <div className="crown">
                        <img alt="crown" src={crown} />
                      </div>
                    ) : (
                      <div className="crown"></div>
                    )}

                    <div className="rank-row">{rank}</div>
                    <div className="wallet-row">
                      {addressFormatted.toUpperCase()}
                    </div>
                    <div className="rwa-row">{accrued}</div>
                  </div>
                )}
              </div>
            );
          })}
          {!userInTop && !!userAddress && (
            <>
              <div className="table-row">
                <div className="crown"></div>
                <div className="rank-row">...</div>
                <div className="wallet-row"></div>
                <div className="rwa-row"></div>
              </div>
              <div className="table-row">
                <div className="user-rank">
                  <img alt="arrow" src={arrow} />
                </div>
                <div className="rank-row green">{userRankFormatted}</div>
                <div className="wallet-row green">
                  {userAddressFormatted.toUpperCase()}
                </div>
                <div className="rwa-row green">{userAccrued}</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Highscores;
