import { useState } from 'react';
import { useStore } from '@nanostores/react';
import { NavLink } from 'react-router-dom';
import { slide as Menu } from 'react-burger-menu';

import '../styles/header.css';
import '../styles/navbar.css';
import '../styles/burgerMenu.css';

import { userAddressStore, contractInstanceDataStore } from '../store/appStore';

import { rwaCoinBalanceStore, rwaCoinAccruedStore } from '../store/rwaStore';

import { formatRwaBalance } from '../utils';
import { MetamaskPrompt } from '.';

import homeLogo from '../assets/images/HomeLogoWithText.png';
import metamaskPNG from '../assets/images/metamaskLogo.png';
import coinbaseWalletPNG from '../assets/images/coinbaseWalletLogo.png';
import rwaMetamask from '../assets/images/rwaMetamask.png';
import bHomeMetamask from '../assets/images/bHomeMetamask.png';
import { set } from 'date-fns';

export const Header = ({ wallet, walletConnected, disconnectWallet }) => {
  const [dropdownVisible, setDropdownIsVisible] = useState(false);
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const rwaCoinAmount = useStore(rwaCoinBalanceStore);
  const rwaCoinAccrued = useStore(rwaCoinAccruedStore);
  const address = useStore(userAddressStore);
  const contracts = useStore(contractInstanceDataStore);

  const { poolContractInstance, rwaCoinContractInstance } = contracts;

  const rwaBalance = formatRwaBalance({
    rwaCoinAmount,
    rwaCoinAccrued,
  });
  const walletLogo = wallet === 'coinbase' ? coinbaseWalletPNG : metamaskPNG;

  const closeMenu = () => {
    setMenuIsOpen(false);
  };

  return (
    <div className="header">
      <div className="headerSection">
        <a className="headerSection" href="https://www.homecoin.finance">
          <img src={homeLogo} className="logo" alt="" />
        </a>
      </div>

      <div className="navbar">
        <li>
          <NavLink activeclassname="active" to="/" className="navbarItem">
            HOME
          </NavLink>
        </li>
        <li>
          <NavLink
            activeclassname="active"
            to="/farming"
            className="navbarItem"
          >
            Farming
          </NavLink>
        </li>
        <li>
          <NavLink
            activeclassname="active"
            to="/rewards"
            className="navbarItem"
          >
            Rewards
          </NavLink>
        </li>
        <li>
          <NavLink activeclassname="active" to="/homes" className="navbarItem">
            Homes
          </NavLink>
        </li>
        <li>
          <NavLink
            activeclassname="active"
            to="/highscores"
            className="navbarItem"
          >
            Highscores
          </NavLink>
        </li>
      </div>

      <div className="sidebarHost">
        <Menu
          right
          isOpen={menuIsOpen}
          onStateChange={(state) => {
            setMenuIsOpen(state.isOpen);
            return state.isOpen;
          }}
        >
          <NavLink to="/" className="menu-item" onClick={closeMenu}>
            HOME
          </NavLink>
          <NavLink to="/farming" className="menu-item" onClick={closeMenu}>
            Farming
          </NavLink>
          <NavLink to="/rewards" className="menu-item" onClick={closeMenu}>
            Rewards
          </NavLink>
          <NavLink to="/homes" className="menu-item" onClick={closeMenu}>
            Homes
          </NavLink>
          <NavLink to="/highscores" className="menu-item" onClick={closeMenu}>
            Highscores
          </NavLink>
          {rwaBalance ? (
            <span className="menu-item green">{rwaBalance} RWA</span>
          ) : (
            <span className="menu-item green">0 RWA</span>
          )}
        </Menu>
      </div>
      {rwaBalance ? <p className="headerBalance">{rwaBalance} RWA</p> : null}
      <div
        className="walletInfo"
        onMouseEnter={() => setDropdownIsVisible(true)}
        onMouseLeave={() => setDropdownIsVisible(false)}
      >
        <img src={walletLogo} className="walletLogo" alt="" />
        {address.substring(0, 5)}...{address.substring(38, 42)}
      </div>
      <div
        className="headerSection metamaskPrompt"
        onClick={() =>
          MetamaskPrompt({
            token: 'HOME',
            poolAddress: poolContractInstance,
          })
        }
      >
        <img src={bHomeMetamask} className="bHomeMetamask" alt="" />
      </div>
      <div
        className="headerSection metamaskPrompt"
        onClick={() =>
          MetamaskPrompt({
            token: 'RWA',
            poolAddress: rwaCoinContractInstance,
          })
        }
      >
        <img src={rwaMetamask} className="rwaMetamask" alt="" />
      </div>
      <div
        className={
          dropdownVisible && walletConnected
            ? 'dropdownVisible'
            : 'dropdownInvisible'
        }
        onMouseEnter={() => setDropdownIsVisible(true)}
        onMouseLeave={() => setDropdownIsVisible(false)}
        onClick={() => disconnectWallet()}
      >
        <p>Switch Wallet</p>
      </div>
    </div>
  );
};

export default Header;
