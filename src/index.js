import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import { h, render } from 'preact';
import './style';

import localforage from 'localforage';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

let root;
function init() {
  if ('serviceWorker' in navigator) {
    // Register a Service Worker.
    runtime.register().then((registration) => {
      // Use the PushManager to get the user's subscription to the push service.
      return registration.pushManager.getSubscription().then(subscription => {
        // If a subscription was found, return it.
        if (subscription) {
          return subscription;
        }

        // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
        // send notifications that don't have a visible effect for the user).
        return registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: convertedVapidKey
        });
      });
    }).then(subscription => {
      localforage.getItem('username').then(username => {
        // Send the subscription details to the server using the Fetch API.
        fetch('./register', {
          method: 'post',
          headers: {
            'Content-type': 'application/json'
          },
          body: JSON.stringify({
            subscription,
            username
          })
        });
      });
    });
  }

  let App = require('./components/App').default;
  root = render(<App />, document.body, root);
}

init();

if (module.hot) {
  module.hot.accept('./components/App', () => requestAnimationFrame( () => {
    flushLogs();
    init();
  }) );

  // optional: mute HMR/WDS logs
  let log = console.log,
    logs = [];
  console.log = (t, ...args) => {
    if (typeof t==='string' && t.match(/^\[(HMR|WDS)\]/)) {
      if (t.match(/(up to date|err)/i)) logs.push(t.replace(/^.*?\]\s*/m,''), ...args);
    }
    else {
      log.call(console, t, ...args);
    }
  };
  let flushLogs = () => console.log(`%c🚀 ${logs.splice(0,logs.length).join(' ')}`, 'color:#888;');
}
