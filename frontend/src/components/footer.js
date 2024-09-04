import React from 'react';
import '../styles/footer.css';

import discord from '../assets/images/discord.png';
import telegram from '../assets/images/telegram.png';
import mirror from '../assets/images/mirror.png';
import instagram from '../assets/images/instagram.png';
import twitter from '../assets/images/twitter.png';
import reddit from '../assets/images/reddit.png';
import giphy from '../assets/images/giphy.png';

export const Footer = () => {
  return (
    <div className="footer">
      <a className="footerSection" href="https://discord.gg/4kaKKvb25f">
        <img src={discord} className="socialLogo" alt="" />
      </a>
      <a
        className="footerSection"
        href="https://t.me/joinchat/sdfymEO4QbZmMWZh"
      >
        <img src={telegram} className="socialLogo" alt="" />
      </a>
      <a
        className="footerSection"
        href="https://mirror.xyz/homecoinfinance.eth"
      >
        <img src={mirror} className="socialLogo" alt="" />
      </a>
      {/* <a
        className="footerSection"
        href="https://www.reddit.com/r/BaconProtocol/"
      >
        <img src={reddit} className="socialLogo" alt="" />
      </a> */}
      <a
        className="footerSection"
        href="https://www.instagram.com/homecoinfinance/"
      >
        <img src={instagram} className="socialLogo" alt="" />
      </a>
      <a className="footerSection" href="https://twitter.com/homecoinfinance">
        <img src={twitter} className="socialLogo" alt="" />
      </a>
      {/* <a className="footerSection" href="https://giphy.com/channel/BaconCoin">
        <img src={giphy} className="socialLogo" alt="" />
      </a> */}
      <p className="footerText">
        If you are an originator or servicer and are interested in using the RWA
        Protocol, drop us a line on Discord.{' '}
        <a href="mailto:info@homecoin.finance">.</a>
      </p>
    </div>
  );
};
