import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import TwitchChatClient from "./views/TwitchChatClient";
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
  <React.StrictMode>
    <TwitchChatClient />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
