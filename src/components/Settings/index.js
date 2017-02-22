import fetch from 'unfetch';

import { h, Component } from 'preact';
import { Link } from 'preact-router';
import style from './style';

import Icon from '../Icon';

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

export default class Settings extends Component {

  state = {
    pushNotificationsBlocked: false,
    pushNotificationsSupported: false,
    pushNotificationsDisabled: true,
    pushNotificationsOn: false
  };

  constructor() {
    super();

    this.handleClick.bind(this);
  }

  componentDidMount() {
    this.initPushNotifications();
  }

  initPushNotifications() {
    const { registration } = this.props;

    if (!registration) {
      return;
    }

    // Check if push messaging is supported
    if (!('PushManager' in window)) {
      return console.error('Push messaging isn\'t supported.');
    }

    this.setState({ pushNotificationsSupported: true });

    // Check the current Notification permission.
    // If its denied, it's a permanent block until the
    // user changes the permission
    if (Notification.permission === 'denied') {
      this.setState({ pushNotificationsBlocked: true });
      return console.error('The user has blocked notifications.');
    }

    registration.pushManager.getSubscription().then(subscription => {
      this.setState({ pushNotificationsDisabled: false });

      // We aren’t subscribed to push, so set UI
      // to allow the user to enable push
      if (!subscription) {
        return;
      }

      this.handleSubscriptionOnServer(subscription);

      this.setState({ pushNotificationsOn: true });
    })
    .catch(error => {
      console.error('Error during getSubscription()', error);
    });
  }

  handleSubscriptionOnServer(subscription, action) {
    const { username } = this.props;

    if (!username) {
      return;
    }

    // Send the subscription details to the server using the Fetch API.
    return fetch('./api/pushSubscription', {
      method: action ? 'delete' : 'post',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify({
        subscription,
        username
      })
    })
    .catch(error => console.error);
  }

  subscribe() {
    const { registration } = this.props;

    // Disable the button so it can't be changed while
    // we process the permission request
    this.setState({ pushNotificationsDisabled: false });

    // Otherwise, subscribe the user (userVisibleOnly allows to specify that we don't plan to
    // send notifications that don't have a visible effect for the user).
    registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    }).then(subscription => {
      this.handleSubscriptionOnServer(subscription)
        .then(success => {
          this.setState({ pushNotificationsDisabled: false, pushNotificationsOn: true });
        })
        .catch(error => {
          this.setState({ pushNotificationsDisabled: false, pushNotificationsOn: false });
        });
    })
    .catch(error => {
      if (Notification.permission === 'denied') {
        // The user denied the notification permission which
        // means we failed to subscribe and the user will need
        // to manually change the notification permission to
        // subscribe to push messages
        console.error('Permission for Notifications was denied');

        this.setState({ pushNotificationsBlocked: true, pushNotificationsDisabled: true });
      } else {
        // A problem occurred with the subscription, this can
        // often be down to an issue or lack of the gcm_sender_id
        // and / or gcm_user_visible_only
        console.error('Unable to subscribe to push.', error);
        this.setState({ pushNotificationsDisabled: false, pushNotificationsOn: false });
      }
    });
  }

  unsubscribe() {
    const { registration } = this.props;
    this.setState({ pushNotificationsDisabled: true });

    // To unsubscribe from push messaging, you need get the
    // subcription object, which you can call unsubscribe() on.
    registration.pushManager.getSubscription().then(subscription => {
      // Check we have a subscription to unsubscribe
      if (!subscription) {
        // No subscription object, so set the state
        // to allow the user to subscribe to push

        this.setState({ pushNotificationsDisabled: false, pushNotificationsOn: false });
        return;
      }

      this.handleSubscriptionOnServer(subscription, true);

      // We have a subcription, so call unsubscribe on it
      subscription.unsubscribe().then(() => {
        this.setState({ pushNotificationsDisabled: false, pushNotificationsOn: false });
      }).catch(error => {
        // We failed to unsubscribe, this can lead to
        // an unusual state, so may be best to remove
        // the subscription id from your data store and
        // inform the user that you disabled push

        console.error('Unsubscription error: ', error);
        this.setState({ pushNotificationsDisabled: false });
      });
    }).catch(error => {
      console.error('Error thrown while unsubscribing from push messaging.', error);
    });
  }

  handleClick() {
    const { pushNotificationsOn } = this.state;

    if (pushNotificationsOn) {
      this.unsubscribe();
    } else {
      this.subscribe();
    }
  }

  render() {
    const { logout, username } = this.props;

    const { pushNotificationsBlocked, pushNotificationsSupported, pushNotificationsDisabled, pushNotificationsOn } = this.state;

    let pushNotificationsButtonText = '';
    let pushNotificationsButtonIcon = '';

    if (pushNotificationsSupported) {
      if (pushNotificationsBlocked) {
        pushNotificationsButtonIcon = <Icon name="skull" />;
        pushNotificationsButtonText = "You've blocked notifications";
      } else if (pushNotificationsOn) {
        pushNotificationsButtonIcon = <Icon name="close" />;
        pushNotificationsButtonText = 'Disable push notifications';
      } else {
        pushNotificationsButtonIcon = <Icon name="check" />;
        pushNotificationsButtonText = 'Enable push notifications';
      }
    }

    return (
      <div class={style.page}>
        <div class={style.animateIn}>
          <h1 class={style.title}>{username ? username : 'Settings'}</h1>
        </div>
        <div class={`${style.animateIn} ${style.animateInZoomUp}`}>
          {pushNotificationsSupported && (
            <button
                class={style.button}
                onClick={this.handleClick.bind(this)}
                disabled={pushNotificationsDisabled}>
              <span style={{ display: 'inline-block', transform: 'translateX(-0.25em)' }}>
                {pushNotificationsButtonIcon}
              </span>
              {pushNotificationsButtonText}
            </button>
          )}

          <button class={style.button} onClick={logout}>Logout</button>
        </div>
      </div>
    );
  }
}
