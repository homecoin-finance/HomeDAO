import React from 'react';
import ReactDOM from 'react-dom';
import ReactModal from 'react-modal';
import * as Sentry from '@sentry/react';
import './index.css';
import AppBlockNative from './AppBlockNative';
// import App from './App';
import reportWebVitals from './reportWebVitals';

ReactModal.setAppElement('#root');

if (process.env.REACT_APP_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.REACT_APP_SENTRY_DSN,
    environment: process.env.REACT_APP_ENV,
  });
}

const urlSearchParams = new URLSearchParams(window.location.search);
const params = Object.fromEntries(urlSearchParams.entries());
// const ffBlockNative = params.blocknative === 'true';
const ffDevTools = params.devTools === 'true';
const ffFix = params.fixBoost === 'true';

ReactDOM.render(
  <React.StrictMode>
    {/* {ffBlockNative ? <AppBlockNative ffDevTools={ffDevTools} /> : <App />} */}
    <AppBlockNative ffDevTools={ffDevTools} ffFix={ffFix} />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
