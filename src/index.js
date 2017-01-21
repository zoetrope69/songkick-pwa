import runtime from 'serviceworker-webpack-plugin/lib/runtime';
import { h, render } from 'preact';
import './style';

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

const vapidPublicKey = 'BMvoWp_DfbGjdMheYMe-pCGsTAbdkIf_qKTwimLmeke0j36XWEiRDpnQgjwMPEMEsr151lidwVoSojfAM1R8ydk';
const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

let isPushEnabled = false;

let root;
function init() {
  if ('serviceWorker' in navigator) {
    // const registration = runtime.register();
  }

  // unsubscribe();
  // subscribe();

  let App = require('./components/App').default;
  root = render(<App />, document.body, root);
}

function sendSubscriptionToServer(subscription) {
  // TODO: Send the subscription.endpoint
  // to your server and save it to send a
  // push message at a later date
  console.log('subscription', JSON.stringify(subscription));
}

function unsubscribe() {
  navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    // To unsubscribe from push messaging, you need get the
    // subcription object, which you can call unsubscribe() on.
    serviceWorkerRegistration.pushManager.getSubscription().then((pushSubscription) => {
      // Check we have a subscription to unsubscribe
      if (!pushSubscription) {
        // No subscription object, so set the state
        // to allow the user to subscribe to push
        return;
      }

      // TODO: Make a request to your server to remove
      // the users data from your data store so you
      // don't attempt to send them push messages anymore

      // We have a subcription, so call unsubscribe on it
      pushSubscription.unsubscribe().then(() => {
        isPushEnabled = false;
      }).catch((e) => {
        // We failed to unsubscribe, this can lead to
        // an unusual state, so may be best to remove
        // the subscription id from your data store and
        // inform the user that you disabled push

        console.log('Unsubscription error: ', e);
      });
    }).catch((e) => {
      console.log('Error thrown while unsubscribing from push messaging.', e);
    });
  });
}

function subscribe() {
  navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    serviceWorkerRegistration.pushManager.subscribe({userVisibleOnly: true, applicationServerKey: convertedVapidKey})
      .then((subscription) => {
        // The subscription was successful

        // TODO: Send the subscription subscription.endpoint
        // to your server and save it to send a push message
        // at a later date
        return sendSubscriptionToServer(subscription);
      })
      .catch((e) => {
        if (Notification.permission === 'denied') {
          // The user denied the notification permission which
          // means we failed to subscribe and the user will need
          // to manually change the notification permission to
          // subscribe to push messages
          console.log('Permission for Notifications was denied');
        } else {
          // A problem occurred with the subscription, this can
          // often be down to an issue or lack of the gcm_sender_id
          // and / or gcm_user_visible_only
          console.log('Unable to subscribe to push.', e);
        }
      });
  });
}

function initialiseState() {
  // Are Notifications supported in the service worker?
  if (!('showNotification' in ServiceWorkerRegistration.prototype)) {
    return console.log('Notifications aren\'t supported.');
  }

  // Check the current Notification permission.
  // If its denied, it's a permanent block until the
  // user changes the permission
  if (Notification.permission === 'denied') {
    return console.log('The user has blocked notifications.');
  }

  // Check if push messaging is supported
  if (!('PushManager' in window)) {
    return console.log('Push messaging isn\'t supported.');
  }

  // We need the service worker registration to check for a subscription
  navigator.serviceWorker.ready.then((serviceWorkerRegistration) => {
    // Do we already have a push message subscription?
    serviceWorkerRegistration.pushManager.getSubscription()
      .then((subscription) => {
        if (!subscription) {
          // We aren’t subscribed to push
          return;
        }

        // Keep your server in sync with the latest subscription
        sendSubscriptionToServer(subscription);

        isPushEnabled = true;
      })
      .catch((err) => {
        console.log('Error during getSubscription()', err);
      });
  });
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
